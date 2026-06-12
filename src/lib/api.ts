import type {
  CalendarEvent,
  EventInput,
  Profile,
  Project,
  ProjectInput,
  ProjectRequest,
  RequestAttachment,
  RequestInput,
  RequestStatus,
  Snapshot,
  Task,
  TaskInput,
} from "./types";
import { nowISO, uid } from "./utils";
import { seedSnapshot } from "./seed";
import { ATTACHMENT_BUCKET, hasSupabase, supabase } from "./supabase";

// ============================================================
//  Data access layer
//  One interface, two interchangeable implementations:
//    • LocalProvider    -> browser localStorage (DEMO MODE)
//    • SupabaseProvider -> Postgres + Auth + Storage + Realtime
//  Selected at runtime by the presence of Supabase env vars.
// ============================================================

export interface DataProvider {
  readonly mode: "demo" | "supabase";
  getSnapshot(): Promise<Snapshot>;

  createProject(input: ProjectInput): Promise<Project>;
  updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: string, patch: Partial<TaskInput>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  updateProfile(patch: Partial<Profile>): Promise<Profile>;

  createRequest(input: RequestInput, files: File[]): Promise<ProjectRequest>;
  updateRequest(id: string, status: RequestStatus): Promise<ProjectRequest>;
  deleteRequest(id: string): Promise<void>;

  createEvent(input: EventInput): Promise<CalendarEvent>;
  updateEvent(id: string, patch: Partial<EventInput>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
}

// ----------------------------------------------------------------
//  Local (demo) provider — fully offline, persisted to localStorage
// ----------------------------------------------------------------
const STORE_KEY = "dev_dashboard_state_v4";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

class LocalProvider implements DataProvider {
  readonly mode = "demo" as const;

  private read(): Snapshot {
    if (typeof window === "undefined") return seedSnapshot();
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seeded = seedSnapshot();
      window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try {
      return JSON.parse(raw) as Snapshot;
    } catch {
      const seeded = seedSnapshot();
      window.localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  private write(s: Snapshot) {
    if (typeof window !== "undefined") window.localStorage.setItem(STORE_KEY, JSON.stringify(s));
  }

  private log(
    s: Snapshot,
    type: Snapshot["activity"][number]["type"],
    action: Snapshot["activity"][number]["action"],
    message: string,
  ) {
    s.activity.unshift({ id: uid("a"), timestamp: nowISO(), type, action, message });
    s.activity = s.activity.slice(0, 40);
  }

  async getSnapshot(): Promise<Snapshot> {
    return this.read();
  }

  async createProject(input: ProjectInput): Promise<Project> {
    const s = this.read();
    const project: Project = { ...input, id: uid("p"), createdAt: nowISO(), updatedAt: nowISO() };
    s.projects.push(project);
    this.log(s, "project", "created", `Project "${project.name}" dibuat`);
    this.write(s);
    return project;
  }

  async updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
    const s = this.read();
    const p = s.projects.find((x) => x.id === id);
    if (!p) throw new Error("Project not found");
    Object.assign(p, patch, { updatedAt: nowISO() });
    if (patch.status === "Completed") p.progress = 100;
    this.log(s, "project", "updated", `Project "${p.name}" diperbarui`);
    this.write(s);
    return p;
  }

  async deleteProject(id: string): Promise<void> {
    const s = this.read();
    const p = s.projects.find((x) => x.id === id);
    s.projects = s.projects.filter((x) => x.id !== id);
    s.tasks = s.tasks.filter((t) => t.projectId !== id);
    if (p) this.log(s, "project", "deleted", `Project "${p.name}" dihapus`);
    this.write(s);
  }

  async createTask(input: TaskInput): Promise<Task> {
    const s = this.read();
    const task: Task = { ...input, id: uid("t"), createdAt: nowISO(), updatedAt: nowISO() };
    s.tasks.push(task);
    this.log(s, "task", "created", `Task "${task.name}" dibuat`);
    this.write(s);
    return task;
  }

  async updateTask(id: string, patch: Partial<TaskInput>): Promise<Task> {
    const s = this.read();
    const t = s.tasks.find((x) => x.id === id);
    if (!t) throw new Error("Task not found");
    Object.assign(t, patch, { updatedAt: nowISO() });
    this.log(s, "task", "updated", `Task "${t.name}" diperbarui`);
    this.write(s);
    return t;
  }

  async deleteTask(id: string): Promise<void> {
    const s = this.read();
    const t = s.tasks.find((x) => x.id === id);
    s.tasks = s.tasks.filter((x) => x.id !== id);
    if (t) this.log(s, "task", "deleted", `Task "${t.name}" dihapus`);
    this.write(s);
  }

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const s = this.read();
    s.profile = { ...s.profile, ...patch };
    this.log(s, "profile", "updated", "Profil diperbarui");
    this.write(s);
    return s.profile;
  }

  async createRequest(input: RequestInput, files: File[]): Promise<ProjectRequest> {
    const s = this.read();
    const attachments: RequestAttachment[] = [];
    for (const f of files) {
      attachments.push({ name: f.name, url: await fileToDataUrl(f), size: f.size });
    }
    const req: ProjectRequest = {
      ...input,
      attachments,
      id: uid("r"),
      status: "New",
      createdAt: nowISO(),
    };
    s.requests.unshift(req);
    this.log(s, "request", "created", `Request baru dari ${req.name}`);
    this.write(s);
    return req;
  }

  async updateRequest(id: string, status: RequestStatus): Promise<ProjectRequest> {
    const s = this.read();
    const r = s.requests.find((x) => x.id === id);
    if (!r) throw new Error("Request not found");
    r.status = status;
    this.log(s, "request", "updated", `Request ${r.name} → ${status}`);
    this.write(s);
    return r;
  }

  async deleteRequest(id: string): Promise<void> {
    const s = this.read();
    s.requests = s.requests.filter((x) => x.id !== id);
    this.write(s);
  }

  async createEvent(input: EventInput): Promise<CalendarEvent> {
    const s = this.read();
    const ev: CalendarEvent = { ...input, id: uid("e"), createdAt: nowISO() };
    s.events.push(ev);
    this.log(s, "event", "created", `Event "${ev.title}" dibuat`);
    this.write(s);
    return ev;
  }

  async updateEvent(id: string, patch: Partial<EventInput>): Promise<CalendarEvent> {
    const s = this.read();
    const ev = s.events.find((x) => x.id === id);
    if (!ev) throw new Error("Event not found");
    Object.assign(ev, patch);
    this.log(s, "event", "updated", `Event "${ev.title}" diperbarui`);
    this.write(s);
    return ev;
  }

  async deleteEvent(id: string): Promise<void> {
    const s = this.read();
    s.events = s.events.filter((x) => x.id !== id);
    this.write(s);
  }
}

// ----------------------------------------------------------------
//  Supabase provider — Postgres + Storage. Columns are camelCase
//  (quoted in SQL) so rows map 1:1 to the TS models.
// ----------------------------------------------------------------
class SupabaseProvider implements DataProvider {
  readonly mode = "supabase" as const;

  private get db() {
    const c = supabase();
    if (!c) throw new Error("Supabase client unavailable");
    return c;
  }

  async getSnapshot(): Promise<Snapshot> {
    const db = this.db;
    const [projects, tasks, profile, requests, events, activity] = await Promise.all([
      db.from("projects").select("*").order("createdAt", { ascending: false }),
      db.from("tasks").select("*").order("createdAt", { ascending: true }),
      db.from("profile").select("*").eq("id", 1).maybeSingle(),
      db.from("requests").select("*").order("createdAt", { ascending: false }),
      db.from("events").select("*").order("date", { ascending: true }),
      db.from("activity").select("*").order("timestamp", { ascending: false }).limit(40),
    ]);
    if (projects.error) throw projects.error;
    if (tasks.error) throw tasks.error;
    return {
      projects: (projects.data ?? []) as Project[],
      tasks: (tasks.data ?? []) as Task[],
      profile: (profile.data ?? seedSnapshot().profile) as unknown as Profile,
      requests: (requests.data ?? []) as ProjectRequest[],
      events: (events.data ?? []) as CalendarEvent[],
      activity: (activity.data ?? []) as Snapshot["activity"],
    };
  }

  private async logActivity(type: string, action: string, message: string) {
    await this.db.from("activity").insert({ type, action, message });
  }

  async createProject(input: ProjectInput): Promise<Project> {
    const row = { ...input, id: uid("p") };
    const { data, error } = await this.db.from("projects").insert(row).select().single();
    if (error) throw error;
    await this.logActivity("project", "created", `Project "${input.name}" dibuat`);
    return data as Project;
  }

  async updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
    const update = { ...patch, updatedAt: nowISO() } as Record<string, unknown>;
    if (patch.status === "Completed") update.progress = 100;
    const { data, error } = await this.db.from("projects").update(update).eq("id", id).select().single();
    if (error) throw error;
    await this.logActivity("project", "updated", `Project diperbarui`);
    return data as Project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.db.from("projects").delete().eq("id", id);
    if (error) throw error;
    await this.logActivity("project", "deleted", `Project dihapus`);
  }

  async createTask(input: TaskInput): Promise<Task> {
    const row = { ...input, id: uid("t") };
    const { data, error } = await this.db.from("tasks").insert(row).select().single();
    if (error) throw error;
    await this.logActivity("task", "created", `Task "${input.name}" dibuat`);
    return data as Task;
  }

  async updateTask(id: string, patch: Partial<TaskInput>): Promise<Task> {
    const { data, error } = await this.db
      .from("tasks")
      .update({ ...patch, updatedAt: nowISO() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.db.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.db
      .from("profile")
      .update(patch)
      .eq("id", 1)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Profile;
  }

  async createRequest(input: RequestInput, files: File[]): Promise<ProjectRequest> {
    const db = this.db;
    const reqId = uid("r");
    const attachments: RequestAttachment[] = [];
    for (const f of files) {
      const path = `${reqId}/${Date.now()}-${f.name}`;
      const up = await db.storage.from(ATTACHMENT_BUCKET).upload(path, f, { upsert: false });
      if (up.error) throw up.error;
      const { data: pub } = db.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
      attachments.push({ name: f.name, url: pub.publicUrl, size: f.size });
    }
    const { data, error } = await db
      .from("requests")
      .insert({ ...input, attachments, status: "New" })
      .select()
      .single();
    if (error) throw error;
    await db.from("activity").insert({
      type: "request",
      action: "created",
      message: `Request baru dari ${input.name}`,
    });
    return data as ProjectRequest;
  }

  async updateRequest(id: string, status: RequestStatus): Promise<ProjectRequest> {
    const { data, error } = await this.db
      .from("requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ProjectRequest;
  }

  async deleteRequest(id: string): Promise<void> {
    const { error } = await this.db.from("requests").delete().eq("id", id);
    if (error) throw error;
  }

  async createEvent(input: EventInput): Promise<CalendarEvent> {
    const row = { ...input, id: uid("e") };
    const { data, error } = await this.db.from("events").insert(row).select().single();
    if (error) throw error;
    return data as CalendarEvent;
  }

  async updateEvent(id: string, patch: Partial<EventInput>): Promise<CalendarEvent> {
    const { data, error } = await this.db.from("events").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as CalendarEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.db.from("events").delete().eq("id", id);
    if (error) throw error;
  }
}

// ----------------------------------------------------------------
//  Singleton selector
// ----------------------------------------------------------------
let provider: DataProvider | null = null;

export function getProvider(): DataProvider {
  if (provider) return provider;
  provider = hasSupabase ? new SupabaseProvider() : new LocalProvider();
  return provider;
}
