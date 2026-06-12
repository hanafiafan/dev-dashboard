"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Clock, Flag, Dot } from "lucide-react";
import { Button, Card } from "./ui";
import { EventDialog } from "./event-dialog";
import type { CalendarEvent, Snapshot } from "@/lib/types";
import { EVENT_TYPE_META, cn } from "@/lib/utils";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function CalendarWidget({ snapshot }: { snapshot: Snapshot }) {
  const [mounted, setMounted] = React.useState(false);
  const [view, setView] = React.useState({ y: 2026, m: 0 });
  const [selected, setSelected] = React.useState("");
  const [dialog, setDialog] = React.useState<{ open: boolean; event?: CalendarEvent; date?: string }>({
    open: false,
  });

  React.useEffect(() => {
    const now = new Date();
    setView({ y: now.getFullYear(), m: now.getMonth() });
    setSelected(iso(now.getFullYear(), now.getMonth(), now.getDate()));
    setMounted(true);
  }, []);

  const todayIso = React.useMemo(() => {
    const n = new Date();
    return iso(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  // markers per date
  const marks = React.useMemo(() => {
    const map: Record<string, { events: CalendarEvent["type"][]; deadline: boolean }> = {};
    snapshot.events.forEach((e) => {
      (map[e.date] ??= { events: [], deadline: false }).events.push(e.type);
    });
    snapshot.tasks.forEach((t) => {
      if (t.dueDate && t.status !== "Done") (map[t.dueDate] ??= { events: [], deadline: false }).deadline = true;
    });
    return map;
  }, [snapshot]);

  if (!mounted) {
    return <Card className="h-[420px] animate-pulse p-5" />;
  }

  const { y, m } = view;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const move = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => {
    const n = new Date();
    setView({ y: n.getFullYear(), m: n.getMonth() });
    setSelected(iso(n.getFullYear(), n.getMonth(), n.getDate()));
  };

  const dayEvents = snapshot.events
    .filter((e) => e.date === selected)
    .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const dayDeadlines = snapshot.tasks.filter((t) => t.dueDate === selected && t.status !== "Done");

  const selDate = selected ? new Date(selected + "T00:00:00") : null;

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {MONTHS[m]} <span className="text-muted-foreground">{y}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={goToday} className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
            Hari ini
          </button>
          <button onClick={() => move(-1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => move(1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const cellIso = iso(y, m, d);
          const isToday = cellIso === todayIso;
          const isSel = cellIso === selected;
          const mk = marks[cellIso];
          const dots: string[] = [];
          if (mk) {
            mk.events.slice(0, 3).forEach((t) => dots.push(EVENT_TYPE_META[t].dot));
            if (mk.deadline && dots.length < 4) dots.push("bg-rose-500");
          }
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
              {dots.length > 0 && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {dots.map((c, j) => (
                    <span key={j} className={cn("h-1 w-1 rounded-full", isSel ? "bg-primary-foreground/80" : c)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Agenda for selected day */}
      <div className="mt-4 border-t border-border/60 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            {selDate
              ? selDate.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" })
              : "—"}
          </h4>
          <Button size="sm" variant="primary" onClick={() => setDialog({ open: true, date: selected })}>
            <Plus className="h-4 w-4" /> Event
          </Button>
        </div>

        <div className="space-y-1.5">
          {dayEvents.length === 0 && dayDeadlines.length === 0 && (
            <p className="py-3 text-center text-sm text-muted-foreground">Tidak ada agenda di hari ini.</p>
          )}

          {dayEvents.map((e) => {
            const meta = EVENT_TYPE_META[e.type];
            const Icon = meta.icon;
            return (
              <button
                key={e.id}
                onClick={() => setDialog({ open: true, event: e })}
                className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 text-left transition hover:bg-muted/60"
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", meta.badge)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{e.title}</span>
                  {e.notes && <span className="block truncate text-xs text-muted-foreground">{e.notes}</span>}
                </span>
                {e.time && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {e.time}
                  </span>
                )}
              </button>
            );
          })}

          {dayDeadlines.map((t) => {
            const proj = snapshot.projects.find((p) => p.id === t.projectId);
            return (
              <Link
                key={t.id}
                href={`/app/projects/${t.projectId}`}
                className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 transition hover:bg-rose-500/10"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300">
                  <Flag className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">Deadline · {proj?.name}</span>
                </span>
                <Dot className="h-4 w-4 text-rose-500" />
              </Link>
            );
          })}
        </div>
      </div>

      <EventDialog
        open={dialog.open}
        event={dialog.event}
        defaultDate={dialog.date}
        onClose={() => setDialog({ open: false })}
      />
    </Card>
  );
}
