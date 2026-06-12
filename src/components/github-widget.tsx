"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Github, Star, GitFork, Users, BookMarked, ExternalLink } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Go: "#00ADD8",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Java: "#b07219",
};

type GhUser = { login: string; followers: number; public_repos: number; avatar_url: string; html_url: string };
type GhRepo = { id: number; name: string; html_url: string; stargazers_count: number; forks_count: number; language: string | null; description: string | null };

export function extractUsername(githubUrl?: string): string | null {
  if (!githubUrl) return null;
  const m = githubUrl.match(/github\.com\/([^/?#]+)/i);
  return m ? m[1] : githubUrl.replace(/^@/, "").trim() || null;
}

export function GitHubWidget({ github, className }: { github?: string; className?: string }) {
  const username = extractUsername(github);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["github", username],
    enabled: !!username,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const [userRes, repoRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=4`),
      ]);
      if (!userRes.ok) throw new Error("GitHub user tidak ditemukan");
      const user = (await userRes.json()) as GhUser;
      const repos = repoRes.ok ? ((await repoRes.json()) as GhRepo[]) : [];
      return { user, repos };
    },
  });

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-700/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Github className="h-4 w-4 text-muted-foreground" /> GitHub Activity
          </h3>
          {data && (
            <a
              href={data.user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              @{data.user.login} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {!username && <p className="mt-4 text-sm text-muted-foreground">Isi URL GitHub di Profile untuk menampilkan aktivitas.</p>}
        {isLoading && username && <p className="mt-4 text-sm text-muted-foreground">Memuat dari GitHub…</p>}
        {isError && <p className="mt-4 text-sm text-muted-foreground">Data GitHub tidak tersedia (user tidak ditemukan / rate limit).</p>}

        {data && (
          <>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookMarked className="h-3.5 w-3.5" /> <b className="text-foreground">{data.user.public_repos}</b> repos
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> <b className="text-foreground">{data.user.followers}</b> followers
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {data.repos.length === 0 && <p className="text-sm text-muted-foreground">Belum ada repo publik.</p>}
              {data.repos.map((r) => (
                <a
                  key={r.id}
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 transition hover:bg-muted/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.name}</span>
                    {r.description && <span className="block truncate text-xs text-muted-foreground">{r.description}</span>}
                  </span>
                  {r.language && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#8b949e" }} />
                      {r.language}
                    </span>
                  )}
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" /> {r.stargazers_count}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <GitFork className="h-3 w-3" /> {r.forks_count}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
