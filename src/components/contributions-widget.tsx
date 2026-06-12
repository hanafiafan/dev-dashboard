"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, Github } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";
import { extractUsername } from "./github-widget";

// Daily contribution counts via the public github-contributions API
// (proxy around GitHub's contribution calendar — no token needed).
type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-muted",
  1: "bg-emerald-300/60 dark:bg-emerald-800",
  2: "bg-emerald-400/80 dark:bg-emerald-600",
  3: "bg-emerald-500 dark:bg-emerald-500",
  4: "bg-emerald-600 dark:bg-emerald-400",
};

const WEEKS_SHOWN = 20; // last ~5 months — fits the widget nicely

export function ContributionsWidget({ github, className }: { github?: string; className?: string }) {
  const username = extractUsername(github);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gh-contrib", username],
    enabled: !!username,
    staleTime: 30 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (!res.ok) throw new Error("contributions unavailable");
      const json = (await res.json()) as { total: Record<string, number>; contributions: Day[] };
      return json;
    },
  });

  // Build week columns (GitHub style: columns = weeks, rows = Sun..Sat)
  const { weeks, total, streak } = React.useMemo(() => {
    const days = data?.contributions ?? [];
    if (!days.length) return { weeks: [] as Day[][], total: 0, streak: 0 };

    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
    const today = new Date().toISOString().slice(0, 10);
    const upToToday = sorted.filter((d) => d.date <= today);

    // current streak (count back from today, allowing today to be 0 so the
    // streak isn't broken before the day is over)
    let streakCount = 0;
    for (let i = upToToday.length - 1; i >= 0; i--) {
      const d = upToToday[i];
      if (d.count > 0) streakCount++;
      else if (d.date !== today) break;
    }

    const lastDays = upToToday.slice(-WEEKS_SHOWN * 7);
    // pad so the first column starts on Sunday
    const firstDow = new Date(lastDays[0].date + "T00:00:00").getDay();
    const padded: (Day | null)[] = [...Array(firstDow).fill(null), ...lastDays];
    const cols: (Day | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));

    const totalYear = Object.values(data?.total ?? {}).reduce((a, b) => a + b, 0);
    return { weeks: cols as Day[][], total: totalYear, streak: streakCount };
  }, [data]);

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Github className="h-4 w-4 text-muted-foreground" /> Kontribusi GitHub
          </h3>
          {data && (
            <span className="mr-7 flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-amber-500" /> streak <b className="text-foreground">{streak}</b> hari
            </span>
          )}
        </div>

        {!username && <p className="mt-4 text-sm text-muted-foreground">Isi URL GitHub di Profile dulu.</p>}
        {isLoading && username && <p className="mt-4 text-sm text-muted-foreground">Memuat kontribusi…</p>}
        {isError && <p className="mt-4 text-sm text-muted-foreground">Data kontribusi tidak tersedia.</p>}

        {weeks.length > 0 && (
          <>
            <div className="mt-3 flex gap-[3px] overflow-hidden">
              {weeks.map((col, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }, (_, r) => {
                    const d = col[r];
                    return (
                      <span
                        key={r}
                        title={d ? `${d.count} kontribusi · ${d.date}` : ""}
                        className={cn(
                          "h-[10px] w-[10px] rounded-[3px]",
                          d ? LEVEL_CLASS[d.level] : "bg-transparent",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span>
                <b className="text-foreground">{total.toLocaleString("id-ID")}</b> kontribusi setahun terakhir
              </span>
              <span className="flex items-center gap-1">
                Less
                {[0, 1, 2, 3, 4].map((l) => (
                  <span key={l} className={cn("h-[9px] w-[9px] rounded-[2px]", LEVEL_CLASS[l])} />
                ))}
                More
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
