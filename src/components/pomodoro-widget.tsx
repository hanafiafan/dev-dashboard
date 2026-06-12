"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, SkipForward, Timer } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";

type Mode = "focus" | "short" | "long";

const MODE_META: Record<Mode, { label: string; color: string }> = {
  focus: { label: "Focus", color: "hsl(var(--primary))" },
  short: { label: "Short Break", color: "#10b981" },
  long: { label: "Long Break", color: "#8b5cf6" },
};

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {}
}

export function PomodoroWidget({ className }: { className?: string }) {
  const [settings] = useSettings();
  const durations: Record<Mode, number> = React.useMemo(
    () => ({
      focus: settings.pomodoro.focus,
      short: settings.pomodoro.short,
      long: settings.pomodoro.long,
    }),
    [settings.pomodoro],
  );

  const [mode, setMode] = React.useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = React.useState(25 * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);

  // apply duration changes from Settings when timer is idle
  React.useEffect(() => {
    if (!running) setSecondsLeft(durations[mode] * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations]);

  // restore today's completed focus sessions
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("dd_pomodoro");
      if (raw) {
        const saved = JSON.parse(raw) as { date: string; sessions: number };
        if (saved.date === new Date().toISOString().slice(0, 10)) setSessions(saved.sessions);
      }
    } catch {}
  }, []);

  const persistSessions = (n: number) => {
    setSessions(n);
    try {
      localStorage.setItem("dd_pomodoro", JSON.stringify({ date: new Date().toISOString().slice(0, 10), sessions: n }));
    } catch {}
  };

  const switchMode = React.useCallback(
    (m: Mode, autostart = false) => {
      setMode(m);
      setSecondsLeft(durations[m] * 60);
      setRunning(autostart);
    },
    [durations],
  );

  const complete = React.useCallback(() => {
    beep();
    if (mode === "focus") {
      const n = sessions + 1;
      persistSessions(n);
      switchMode(n % 4 === 0 ? "long" : "short", false);
    } else {
      switchMode("focus", false);
    }
  }, [mode, sessions, switchMode]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          // defer completion to next tick to avoid setState-in-render issues
          setTimeout(complete, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, complete]);

  const total = durations[mode] * 60;
  const frac = total ? secondsLeft / total : 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-rose-500/15 to-orange-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Timer className="h-4 w-4 text-muted-foreground" /> Pomodoro
          </h3>
          <span className="mr-7 text-xs text-muted-foreground">
            {sessions} sesi hari ini
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4">
          {/* progress ring */}
          <div className="relative h-[120px] w-[120px] shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={MODE_META[mode].color}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {mm}:{ss}
              </span>
              <span className="text-[10px] text-muted-foreground">{MODE_META[mode].label}</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(MODE_META) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition",
                    m === mode
                      ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {MODE_META[m].label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-soft transition active:scale-95"
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </button>
              <button
                onClick={() => switchMode(mode)}
                title="Reset"
                className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={complete}
                title="Skip ke sesi berikutnya"
                className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* session dots */}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-5 rounded-full",
                    i < sessions % 4 || (sessions > 0 && sessions % 4 === 0) ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
              <span className="ml-1.5 text-[10px] text-muted-foreground">menuju long break</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
