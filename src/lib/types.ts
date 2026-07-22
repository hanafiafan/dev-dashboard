// ============================================================
//  Domain models — single source of truth for the whole app
//  Mirrors the Google Sheets column schema (see SETUP.md).
// ============================================================

export type ProjectStatus = "Planning" | "In Progress" | "Completed" | "On Hold";
export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "Todo" | "In Progress" | "Done" | "Blocked";
export type RequestStatus = "New" | "Reviewing" | "Accepted" | "Rejected" | "Done";

export const REQUEST_STATUSES: RequestStatus[] = [
  "New",
  "Reviewing",
  "Accepted",
  "Rejected",
  "Done",
];

export type EventType = "Meeting" | "Deadline" | "Reminder" | "Personal";
export const EVENT_TYPES: EventType[] = ["Meeting", "Deadline", "Reminder", "Personal"];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
];
export const TASK_STATUSES: TaskStatus[] = ["Todo", "In Progress", "Done", "Blocked"];
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

export interface Project {
  id: string;
  name: string;
  emoji: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  techStack: string[];
  client: string;
  progress: number; // 0..100
  /** Short, safe-for-anyone summary shown on the public landing page. */
  publicSummary: string;
  /** Full internal detail — only ever fetched/shown to the logged-in owner. */
  description: string;
  repoUrl: string;
  figmaUrl: string;
  stagingUrl: string;
  isPublic: boolean; // show on the public landing page?
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  name: string;
  role: string;
  email: string;
  location: string;
  bio: string;
  avatarEmoji: string;
  skills: string[];
  github: string;
  /** Nomor WhatsApp owner (kolom DB lama bernama "linkedin"). */
  linkedin: string;
  website: string;
  /** Tampilkan widget kalender publik di landing page? */
  showCalendar: boolean;
  /** Tampilkan chart Tech Stack Terpopuler di landing page? */
  showTechStack: boolean;
  /** Kalau false, form request di halaman publik dikunci ("sedang tidak menerima project"). */
  acceptingProjects: boolean;
}

export interface ActivityEntry {
  id: string;
  timestamp: string; // ISO
  type: "project" | "task" | "profile" | "request" | "event";
  action: "created" | "updated" | "deleted";
  message: string;
}

export interface RequestAttachment {
  name: string;
  url: string;
  size: number;
}

/** A brief submitted by a visitor on the public landing page. */
export interface ProjectRequest {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  referenceUrl: string;
  message: string;
  attachments: RequestAttachment[];
  status: RequestStatus;
  createdAt: string;
}

export type RequestInput = Omit<ProjectRequest, "id" | "status" | "createdAt">;

/** A scheduled event/agenda item shown on the dashboard calendar. */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (optional, "")
  type: EventType;
  notes: string;
  createdAt: string;
}

export type EventInput = Omit<CalendarEvent, "id" | "createdAt">;

export interface Snapshot {
  projects: Project[];
  tasks: Task[];
  profile: Profile;
  requests: ProjectRequest[];
  events: CalendarEvent[];
  activity: ActivityEntry[];
}

// Inputs for create/update — id & timestamps are managed by the provider.
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
