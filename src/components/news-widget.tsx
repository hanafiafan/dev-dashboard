"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";
import { useSettings, type NewsTopic } from "@/lib/settings";

// Hacker News (Algolia) API — free, no key, CORS-enabled.
const TOPIC_QUERY: Record<NewsTopic, { label: string; url: (n: number) => string }> = {
  ai: {
    label: "AI",
    url: (n) =>
      `https://hn.algolia.com/api/v1/search?query=AI%20LLM&tags=story&numericFilters=points%3E20&hitsPerPage=${n}`,
  },
  tech: {
    label: "Tech",
    url: (n) => `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=${n}`,
  },
  webdev: {
    label: "Web Dev",
    url: (n) =>
      `https://hn.algolia.com/api/v1/search?query=javascript%20react%20web&tags=story&numericFilters=points%3E10&hitsPerPage=${n}`,
  },
};

type Hit = { objectID: string; title: string; url: string | null; points: number; created_at: string };

export function NewsWidget({ className }: { className?: string }) {
  const [settings, update] = useSettings();
  const { topic, count, refreshMin } = settings.news;

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["news", topic, count],
    staleTime: refreshMin * 60_000,
    refetchInterval: refreshMin * 60_000,
    retry: 1,
    queryFn: async (): Promise<Hit[]> => {
      const res = await fetch(TOPIC_QUERY[topic].url(count));
      if (!res.ok) throw new Error("news unavailable");
      const json = (await res.json()) as { hits: Hit[] };
      return json.hits.filter((h) => h.title);
    },
  });

  const updatedAgo = dataUpdatedAt
    ? Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 60000))
    : null;

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Newspaper className="h-4 w-4 text-muted-foreground" /> Berita {TOPIC_QUERY[topic].label}
          </h3>
          <button
            onClick={() => refetch()}
            title="Refresh berita"
            className="mr-7 grid h-7 w-7 place-items-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          </button>
        </div>

        {/* topic pills */}
        <div className="mt-2 flex gap-1.5">
          {(Object.keys(TOPIC_QUERY) as NewsTopic[]).map((t) => (
            <button
              key={t}
              onClick={() => update({ news: { ...settings.news, topic: t } })}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition",
                t === topic
                  ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {TOPIC_QUERY[t].label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-1">
          {!data && isFetching && <p className="py-2 text-sm text-muted-foreground">Memuat berita…</p>}
          {!data && !isFetching && <p className="py-2 text-sm text-muted-foreground">Berita tidak tersedia.</p>}
          {data?.map((h) => (
            <a
              key={h.objectID}
              href={h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/news flex items-start gap-2 rounded-lg px-2 py-1.5 transition hover:bg-muted/60"
            >
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50 transition group-hover/news:text-primary" />
              <span className="line-clamp-2 text-sm leading-snug group-hover/news:text-primary">{h.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-2 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
          Auto-refresh tiap {refreshMin} menit · diperbarui {updatedAgo === null ? "—" : updatedAgo === 0 ? "baru saja" : `${updatedAgo} mnt lalu`} · via Hacker News
        </div>
      </div>
    </Card>
  );
}
