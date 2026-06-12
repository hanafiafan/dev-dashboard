"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  MapPin,
  Target,
  ListTodo,
  CalendarClock,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Card } from "./ui";
import { ProgressBar } from "./common";
import { ProjectIcon } from "./icons";
import { cn } from "@/lib/utils";
import type { Snapshot } from "@/lib/types";

// ---------------- Live digital clock ----------------
export function ClockWidget({ className }: { className?: string }) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";
  const date = now
    ? now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "";
  const greeting = !now
    ? ""
    : now.getHours() < 11
      ? "Selamat pagi"
      : now.getHours() < 15
        ? "Selamat siang"
        : now.getHours() < 19
          ? "Selamat sore"
          : "Selamat malam";

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-primary/25 to-violet-500/10 blur-2xl" />
      <div className="relative">
        <div className="text-xs font-medium text-muted-foreground">{greeting}</div>
        <div className="mt-1 flex items-baseline gap-1 font-semibold tracking-tight">
          <span className="text-4xl tabular-nums">{hh}</span>
          <span className="text-4xl tabular-nums">:</span>
          <span className="text-4xl tabular-nums">{mm}</span>
          <span className="ml-1 text-lg tabular-nums text-muted-foreground">{ss}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{date || "—"}</div>
      </div>
    </Card>
  );
}

// ---------------- Weather (Open-Meteo, no API key) ----------------
type Weather = {
  place: string;
  temp: number;
  humidity: number;
  wind: number;
  code: number;
};

function weatherInfo(code: number): { icon: LucideIcon; label: string } {
  if (code === 0) return { icon: Sun, label: "Cerah" };
  if (code <= 2) return { icon: CloudSun, label: "Cerah berawan" };
  if (code === 3) return { icon: Cloud, label: "Berawan" };
  if (code <= 48) return { icon: CloudFog, label: "Berkabut" };
  if (code <= 57) return { icon: CloudDrizzle, label: "Gerimis" };
  if (code <= 67) return { icon: CloudRain, label: "Hujan" };
  if (code <= 77) return { icon: CloudSnow, label: "Salju" };
  if (code <= 82) return { icon: CloudRain, label: "Hujan" };
  if (code <= 86) return { icon: CloudSnow, label: "Salju" };
  return { icon: CloudLightning, label: "Badai petir" };
}

function useWeather(city: string) {
  return useQuery({
    queryKey: ["weather", city],
    enabled: !!city,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<Weather> => {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=id&format=json`,
      ).then((r) => r.json());
      const loc = geo.results?.[0];
      if (!loc) throw new Error("Lokasi tidak ditemukan");
      const w = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`,
      ).then((r) => r.json());
      return {
        place: loc.name,
        temp: Math.round(w.current.temperature_2m),
        humidity: w.current.relative_humidity_2m,
        wind: Math.round(w.current.wind_speed_10m),
        code: w.current.weather_code,
      };
    },
  });
}

export function WeatherWidget({ city, className }: { city?: string; className?: string }) {
  const resolved = (city || "Jakarta").split(",")[0].trim();
  const { data, isLoading, isError } = useWeather(resolved);
  const info = data ? weatherInfo(data.code) : null;
  const Icon = info?.icon ?? Cloud;

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-sky-400/25 to-blue-500/10 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3 w-3" /> {data?.place ?? resolved}
          </div>
          {isLoading ? (
            <div className="mt-2 text-2xl font-semibold text-muted-foreground">…</div>
          ) : isError ? (
            <div className="mt-2 text-sm text-muted-foreground">Cuaca tak tersedia</div>
          ) : (
            <>
              <div className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{data?.temp}°</div>
              <div className="text-sm text-muted-foreground">{info?.label}</div>
            </>
          )}
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-sky-400/20 to-blue-500/10 text-sky-500 ring-1 ring-inset ring-sky-400/20">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      {data && !isError && (
        <div className="relative mt-4 flex items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" /> {data.humidity}%
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" /> {data.wind} km/j
          </span>
        </div>
      )}
    </Card>
  );
}

// ---------------- Quick Facts / "Now" ----------------
export function QuickFactsWidget({ snapshot, className }: { snapshot?: Snapshot; className?: string }) {
  const prioRank = { High: 0, Medium: 1, Low: 2 } as const;
  const focus = React.useMemo(() => {
    if (!snapshot) return null;
    return (
      [...snapshot.projects]
        .filter((p) => p.status === "In Progress")
        .sort((a, b) => prioRank[a.priority] - prioRank[b.priority] || b.progress - a.progress)[0] ?? null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const openTasks = (snapshot?.tasks ?? []).filter((t) => t.status !== "Done");
  const weekAhead = React.useMemo(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);
    return openTasks.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= end).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);
  const estHours = openTasks.reduce((a, t) => a + (t.estimatedHours || 0), 0);

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-2xl" />
      <div className="relative">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-muted-foreground" /> Fokus Saat Ini
        </h3>

        {focus ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2.5">
            <ProjectIcon iconKey={focus.emoji} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{focus.name}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar value={focus.progress} className="h-1.5" />
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">{focus.progress}%</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Tidak ada project In Progress.</p>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
          <Fact icon={ListTodo} value={openTasks.length} label="Task open" />
          <Fact icon={CalendarClock} value={weekAhead} label="Due 7 hari" />
          <Fact icon={Timer} value={estHours} label="Est. jam" />
        </div>
      </div>
    </Card>
  );
}

function Fact({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div>
      <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
      <div className="mt-1 text-lg font-semibold leading-none">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
