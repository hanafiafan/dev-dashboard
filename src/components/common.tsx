"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Card } from "./ui";
import { PRIORITY_META, STATUS_META, TASK_STATUS_META } from "@/lib/utils";
import type { Priority, ProjectStatus, TaskStatus } from "@/lib/types";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "amber" | "emerald" | "rose" | "blue" | "violet";
}) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary ring-primary/15",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-600 ring-amber-500/15 dark:text-amber-400",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
    rose: "from-rose-500/15 to-rose-500/5 text-rose-600 ring-rose-500/15 dark:text-rose-400",
    blue: "from-blue-500/15 to-blue-500/5 text-blue-600 ring-blue-500/15 dark:text-blue-400",
    violet: "from-violet-500/15 to-violet-500/5 text-violet-600 ring-violet-500/15 dark:text-violet-400",
  };
  return (
    <Card className="glass-hover p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <Badge className={m.badge}>
      <Icon className="h-3 w-3" />
      {m.label}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const m = TASK_STATUS_META[status];
  const Icon = m.icon;
  return (
    <Badge className={m.badge}>
      <Icon className="h-3 w-3" />
      {m.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  const Icon = m.icon;
  return (
    <Badge className={m.badge}>
      <Icon className="h-3 w-3" />
      {m.label}
    </Badge>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function SectionHeading({
  children,
  icon: Icon,
  count,
  action,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-2.5">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h2 className="text-sm font-semibold">{children}</h2>
      {count !== undefined && (
        <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      )}
      <div className="h-px flex-1 bg-border/70" />
      {action}
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
