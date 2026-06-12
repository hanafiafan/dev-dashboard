import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ClipboardList,
  LoaderCircle,
  CheckCircle2,
  PauseCircle,
  Circle,
  CircleDashed,
  Ban,
  ChevronsUp,
  Equal,
  ChevronsDown,
  Sparkles,
  Eye,
  XCircle,
  CheckCheck,
  Users,
  Flag,
  Bell,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { EventType, Priority, ProjectStatus, RequestStatus, TaskStatus } from "./types";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Collision-resistant id without external deps. */
export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(d?: string): string {
  if (!d) return "—";
  const dt = new Date(`${d}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysUntil(d?: string): number | null {
  if (!d) return null;
  const dt = new Date(`${d}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  const today = new Date(todayISO() + "T00:00:00");
  return Math.round((dt.getTime() - today.getTime()) / 86_400_000);
}

export function isOverdue(d: string, done: boolean): boolean {
  if (done || !d) return false;
  return d < todayISO();
}

/**
 * Build a wa.me link from a free-form phone number.
 * Normalises Indonesian numbers: strips non-digits, turns a leading
 * "0" into the country code (default 62), keeps existing country codes.
 */
export function waLink(raw: string, defaultCc = "62"): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = defaultCc + digits.slice(1);
  return `https://wa.me/${digits}`;
}

export function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ---- Presentation tokens (Tailwind class fragments) ----------------

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; icon: LucideIcon; dot: string; badge: string; chart: string }
> = {
  Planning: {
    label: "Planning",
    icon: ClipboardList,
    dot: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-300",
    chart: "#3b82f6",
  },
  "In Progress": {
    label: "In Progress",
    icon: LoaderCircle,
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    chart: "#f59e0b",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    chart: "#10b981",
  },
  "On Hold": {
    label: "On Hold",
    icon: PauseCircle,
    dot: "bg-violet-500",
    badge: "bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300",
    chart: "#8b5cf6",
  },
};

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; icon: LucideIcon; badge: string; chart: string; column: string }
> = {
  Todo: {
    label: "Todo",
    icon: Circle,
    badge: "bg-slate-500/15 text-slate-600 ring-slate-500/25 dark:text-slate-300",
    chart: "#94a3b8",
    column: "text-slate-500 dark:text-slate-400",
  },
  "In Progress": {
    label: "In Progress",
    icon: CircleDashed,
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    chart: "#f59e0b",
    column: "text-amber-600 dark:text-amber-400",
  },
  Done: {
    label: "Done",
    icon: CheckCircle2,
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    chart: "#10b981",
    column: "text-emerald-600 dark:text-emerald-400",
  },
  Blocked: {
    label: "Blocked",
    icon: Ban,
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300",
    chart: "#f43f5e",
    column: "text-rose-600 dark:text-rose-400",
  },
};

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; icon: LucideIcon; badge: string }> = {
  New: {
    label: "New",
    icon: Sparkles,
    badge: "bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-300",
  },
  Reviewing: {
    label: "Reviewing",
    icon: Eye,
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  },
  Accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  },
  Rejected: {
    label: "Rejected",
    icon: XCircle,
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300",
  },
  Done: {
    label: "Done",
    icon: CheckCheck,
    badge: "bg-slate-500/15 text-slate-600 ring-slate-500/25 dark:text-slate-300",
  },
};

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; icon: LucideIcon; dot: string; badge: string; chart: string }
> = {
  Meeting: {
    label: "Meeting",
    icon: Users,
    dot: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-300",
    chart: "#3b82f6",
  },
  Deadline: {
    label: "Deadline",
    icon: Flag,
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300",
    chart: "#f43f5e",
  },
  Reminder: {
    label: "Reminder",
    icon: Bell,
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    chart: "#f59e0b",
  },
  Personal: {
    label: "Personal",
    icon: UserRound,
    dot: "bg-violet-500",
    badge: "bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-300",
    chart: "#8b5cf6",
  },
};

export const PRIORITY_META: Record<Priority, { label: string; icon: LucideIcon; dot: string; badge: string }> = {
  High: {
    label: "High",
    icon: ChevronsUp,
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300",
  },
  Medium: {
    label: "Medium",
    icon: Equal,
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  },
  Low: {
    label: "Low",
    icon: ChevronsDown,
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  },
};
