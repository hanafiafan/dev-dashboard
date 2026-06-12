"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Flag, CalendarDays } from "lucide-react";
import { Card } from "./ui";
import { ProjectIcon } from "./icons";
import type { Project, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function PublicCalendar({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [view, setView] = React.useState({ y: 2026, m: 0 });
  const [selected, setSelected] = React.useState("");

  React.useEffect(() => {
    const n = new Date();
    setView({ y: n.getFullYear(), m: n.getMonth() });
    setSelected(iso(n.getFullYear(), n.getMonth(), n.getDate()));
    setMounted(true);
  }, []);

  const todayIso = React.useMemo(() => {
    const n = new Date();
    return iso(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const marks = React.useMemo(() => {
    const map: Record<string, { project: boolean; task: boolean }> = {};
    projects.forEach((p) => {
      if (p.deadline) (map[p.deadline] ??= { project: false, task: false }).project = true;
    });
    tasks.forEach((t) => {
      if (t.dueDate && t.status !== "Done") (map[t.dueDate] ??= { project: false, task: false }).task = true;
    });
    return map;
  }, [projects, tasks]);

  if (!mounted) return <Card className="h-[440px] animate-pulse p-5" />;

  const { y, m } = view;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const move = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const dayProjects = projects.filter((p) => p.deadline === selected);
  const dayTasks = tasks.filter((t) => t.dueDate === selected && t.status !== "Done");
  const selDate = selected ? new Date(selected + "T00:00:00") : null;

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-muted-foreground" /> {MONTHS[m]} {y}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => move(1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const cellIso = iso(y, m, d);
          const isToday = cellIso === todayIso;
          const isSel = cellIso === selected;
          const mk = marks[cellIso];
          return (
            <button
              key={i}
              onClick={() => setSelected(cellIso)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition",
                isSel
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : isToday
                    ? "bg-primary/12 font-semibold text-primary"
                    : "hover:bg-muted",
              )}
            >
              {d}
              {mk && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {mk.project && <span className={cn("h-1 w-1 rounded-full", isSel ? "bg-primary-foreground/80" : "bg-primary")} />}
                  {mk.task && <span className={cn("h-1 w-1 rounded-full", isSel ? "bg-primary-foreground/80" : "bg-rose-500")} />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex-1 border-t border-border/60 pt-3">
        <h4 className="mb-2 text-sm font-semibold">
          {selDate ? selDate.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" }) : "—"}
        </h4>
        <div className="space-y-1.5">
          {dayProjects.length === 0 && dayTasks.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">Tidak ada deadline di tanggal ini.</p>
          )}
          {dayProjects.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2">
              <ProjectIcon iconKey={p.emoji} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">deadline project</span>
            </div>
          ))}
          {dayTasks.map((t) => {
            const proj = projects.find((p) => p.id === t.projectId);
            return (
              <div key={t.id} className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300">
                  <Flag className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{proj?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
