"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Moon,
  Sun,
  LogIn,
  Github,
  MessageCircle,
  Globe,
  ArrowRight,
  CheckCircle2,
  Flame,
  ClipboardList,
  Smartphone,
  Palette,
  Server,
  PieChart,
  BarChart3,
  Gauge,
  Layers,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ListChecks,
  CheckCheck,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Chip, ProgressBar, StatusBadge } from "@/components/common";
import { Avatar, ProjectIcon } from "@/components/icons";
import { Reveal, CountUp } from "@/components/reveal";
import { InteractiveBg } from "@/components/interactive-bg";
import { RequestForm } from "@/components/request-form";
import { ClockWidget, WeatherWidget, QuickFactsWidget } from "@/components/widgets";
import { GitHubWidget } from "@/components/github-widget";
import { ContributionsWidget } from "@/components/contributions-widget";
import { PublicCalendar } from "@/components/public-calendar";
import { ProjectStatusDonut, TaskStatusBar } from "@/components/charts";
import { TechStackChart, CompletionGauge } from "@/components/public-charts";
import { useSnapshot } from "@/lib/queries";
import { useTheme } from "@/components/providers";
import type { Project, Snapshot, Task } from "@/lib/types";
import { STATUS_META, TASK_STATUS_META, formatDate, cn, waLink } from "@/lib/utils";

const SERVICES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Globe, title: "Web Development", desc: "Website & web app modern, cepat, dan scalable." },
  { icon: Smartphone, title: "Mobile Apps", desc: "Aplikasi Android & iOS yang mulus dan ringan." },
  { icon: Palette, title: "UI/UX Design", desc: "Antarmuka bersih, intuitif, dan enak dipakai." },
  { icon: Server, title: "Backend & API", desc: "REST API, database, dan integrasi pihak ketiga." },
];

const NAV_LINKS = [
  { href: "#stats", label: "Statistik" },
  { href: "#services", label: "Layanan" },
  { href: "#work", label: "Karya" },
  { href: "#request", label: "Kontak" },
];

export default function PublicHome() {
  const { data } = useSnapshot();
  const { theme, toggle } = useTheme();

  const profile = data?.profile;
  const publicProjects = (data?.projects ?? []).filter((p) => p.isPublic);
  const pubIds = new Set(publicProjects.map((p) => p.id));
  const publicTasks = (data?.tasks ?? []).filter((t) => pubIds.has(t.projectId));
  const active = publicProjects.filter((p) => p.status === "In Progress");
  const completed = publicProjects.filter((p) => p.status === "Completed");
  const planning = publicProjects.filter((p) => p.status === "Planning");
  const doneTasks = publicTasks.filter((t) => t.status === "Done").length;
  const completion = publicTasks.length ? (doneTasks / publicTasks.length) * 100 : 0;
  const allTech = Array.from(new Set([...(profile?.skills ?? []), ...publicProjects.flatMap((p) => p.techStack)]));
  const pubSnapshot: Snapshot | null = data ? { ...data, projects: publicProjects, tasks: publicTasks } : null;

  return (
    <div className="min-h-screen">
      <InteractiveBg />

      {/* Top bar */}
      <header className="glass-bar sticky top-0 z-30 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold">{profile?.name ?? "Dev Dashboard"}</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-lg border border-border bg-[hsl(var(--card)/0.6)] p-2 backdrop-blur-md hover:bg-muted">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/login">
              <Button size="sm">
                <LogIn className="h-4 w-4" /> Masuk
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-10">
        {/* ===== HERO BENTO ===== */}
        <section className="py-8">
          <div className="grid items-stretch gap-4 lg:grid-cols-3">
            <ProfileCard profile={profile} className="lg:col-span-2" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              <ClockWidget className="h-full" />
              <WeatherWidget className="h-full" city={profile?.location} />
            </div>
          </div>
        </section>

        {/* Tech marquee */}
        {allTech.length > 0 && (
          <div className="marquee-mask overflow-hidden py-1">
            <div className="flex w-max animate-marquee gap-2.5">
              {[...allTech, ...allTech].map((t, i) => (
                <span key={i} className="rounded-full border border-border/70 bg-[hsl(var(--card)/0.6)] px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-md">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== ANALYTICS BENTO ===== */}
        <section id="stats" className="scroll-mt-20 py-10">
          <Reveal>
            <SectionTitle eyebrow="Statistik" title="Insight & analitik" />
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={Flame} tone="amber" value={active.length} label="Project Aktif" />
            <StatTile icon={CheckCircle2} tone="emerald" value={completed.length} label="Project Selesai" />
            <StatTile icon={ListChecks} tone="blue" value={publicTasks.length} label="Total Task" />
            <StatTile icon={CheckCheck} tone="violet" value={doneTasks} label="Task Beres" />
          </div>

          {pubSnapshot && (
            <>
              <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-3">
                <ChartCard icon={PieChart} title="Project by Status">
                  <ProjectStatusDonut snapshot={pubSnapshot} />
                </ChartCard>
                <ChartCard icon={Gauge} title="Penyelesaian Task">
                  <CompletionGauge percent={completion} label={`${doneTasks}/${publicTasks.length} task selesai`} />
                </ChartCard>
                <ChartCard icon={BarChart3} title="Task by Status">
                  <TaskStatusBar snapshot={pubSnapshot} />
                </ChartCard>
              </div>

              {(profile?.showCalendar !== false || profile?.showTechStack !== false) && (
                <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-3">
                  {profile?.showCalendar !== false && (
                    <div className={profile?.showTechStack !== false ? "lg:col-span-2" : "lg:col-span-3"}>
                      <PublicCalendar projects={publicProjects} tasks={publicTasks} />
                    </div>
                  )}
                  {profile?.showTechStack !== false && (
                    <div className={profile?.showCalendar !== false ? "" : "lg:col-span-3"}>
                      <ChartCard icon={Layers} title="Tech Stack Terpopuler">
                        <TechStackChart projects={publicProjects} />
                      </ChartCard>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <GitHubWidget className="h-full" github={profile?.github} />
                </div>
                <QuickFactsWidget className="h-full" snapshot={pubSnapshot ?? undefined} />
              </div>

              <div className="mt-3">
                <ContributionsWidget github={profile?.github} />
              </div>
            </>
          )}
        </section>

        {/* ===== SERVICES ===== */}
        <section id="services" className="scroll-mt-20 py-10">
          <Reveal>
            <SectionTitle eyebrow="Layanan" title="Apa yang bisa saya bantu" />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <Card className="glass-hover h-full p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/15">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== SHOWCASE (kanban) ===== */}
        <section id="work" className="scroll-mt-20 py-6">
          <Reveal>
            <SectionTitle eyebrow="Portfolio" title="Karya & project terbaru" />
          </Reveal>
          <Card className="mt-6 grid grid-cols-1 gap-6 p-4 lg:grid-cols-3 lg:items-start lg:gap-0 lg:divide-x lg:divide-border/60 lg:p-5">
            <KanbanColumn icon={Flame} title="Sedang Dikerjakan" projects={active} empty="Belum ada project aktif.">
              {(p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <PublicProjectCard project={p} tasks={publicTasks.filter((t) => t.projectId === p.id)} />
                </Reveal>
              )}
            </KanbanColumn>
            <KanbanColumn icon={ClipboardList} title="Dalam Perencanaan" projects={planning} empty="Belum ada project dalam perencanaan.">
              {(p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <PublicProjectCard project={p} tasks={publicTasks.filter((t) => t.projectId === p.id)} />
                </Reveal>
              )}
            </KanbanColumn>
            <KanbanColumn icon={CheckCircle2} title="Baru Selesai" projects={completed} empty="Belum ada project selesai.">
              {(p) => <CompactProjectRow key={p.id} project={p} />}
            </KanbanColumn>
          </Card>
        </section>

        {/* ===== TIMELINE (gantt, active projects) ===== */}
        {active.some((p) => p.startDate && p.deadline) && (
          <section className="scroll-mt-20 py-10">
            <Reveal>
              <SectionTitle eyebrow="Perjalanan" title="Timeline Project Aktif" />
            </Reveal>
            <div className="mt-8">
              <ActiveProjectCalendar projects={active} />
            </div>
          </section>
        )}

        {/* ===== REQUEST ===== */}
        <section id="request" className="scroll-mt-20 py-12">
          <Reveal>
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mulai Project Bareng</h2>
              <p className="mt-2 text-sm text-muted-foreground">Kirim kebutuhan kamu — lengkap dengan lampiran kalau ada. Gratis & tanpa komitmen.</p>
            </div>
            <RequestForm />
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {profile?.name ?? "Dev Dashboard"} · Dibuat dengan Next.js & Supabase
      </footer>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function ProfileCard({ profile, className }: { profile?: Snapshot["profile"]; className?: string }) {
  return (
    <Card className={cn("relative flex flex-col justify-center overflow-hidden p-8", className)}>
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/10 blur-3xl" />
      <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-gradient-to-br from-sky-400/15 to-blue-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
          Tersedia untuk project baru
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={profile?.name} size="xl" className="shadow-glass" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{profile?.name ?? "—"}</h1>
            <p className="text-muted-foreground">{profile?.role}</p>
          </div>
        </div>
        {profile?.bio && <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(profile?.skills ?? []).slice(0, 8).map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="#request">
            <Button variant="primary">
              Ajukan Project <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <div className="flex gap-1.5">
            {profile?.github && <Social href={profile.github} icon={<Github className="h-4 w-4" />} />}
            {profile?.linkedin && waLink(profile.linkedin) !== "" && (
              <Social href={waLink(profile.linkedin)} icon={<MessageCircle className="h-4 w-4" />} />
            )}
            {profile?.website && <Social href={profile.website} icon={<Globe className="h-4 w-4" />} />}
          </div>
        </div>
      </div>
    </Card>
  );
}

const TILE_TONES: Record<string, string> = {
  amber: "from-amber-500/15 to-amber-500/5 text-amber-600 ring-amber-500/15 dark:text-amber-400",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
  blue: "from-blue-500/15 to-blue-500/5 text-blue-600 ring-blue-500/15 dark:text-blue-400",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-600 ring-violet-500/15 dark:text-violet-400",
};

function StatTile({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: keyof typeof TILE_TONES; value: number; label: string }) {
  return (
    <Card className="glass-hover flex flex-col justify-between p-4">
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset", TILE_TONES[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4">
        <CountUp value={value} className="text-3xl font-semibold tracking-tight" />
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}

function ChartCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" /> {title}
      </h3>
      <div className="flex flex-1 items-center">
        <div className="w-full">{children}</div>
      </div>
    </Card>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</span>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}

function Social({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-[hsl(var(--card)/0.6)] text-muted-foreground backdrop-blur-md transition hover:bg-muted hover:text-foreground">
      {icon}
    </a>
  );
}

/** Fixed lane height so all 3 columns line up in one neat box regardless of item count — overflow scrolls within the lane. */
const KANBAN_LANE_HEIGHT = "560px";

function KanbanColumn({
  icon: Icon,
  title,
  projects,
  empty,
  children,
}: {
  icon: LucideIcon;
  title: string;
  projects: Project[];
  empty: string;
  children: (project: Project, index: number) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:px-4 lg:first:pl-0 lg:last:pr-0">
      <div className="mb-3 flex items-center justify-between px-1.5 pt-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </span>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">{projects.length}</span>
      </div>
      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2.5 overflow-y-auto pr-1" style={{ maxHeight: KANBAN_LANE_HEIGHT }}>
          {projects.map((p, i) => children(p, i))}
        </div>
      )}
    </div>
  );
}

/** Gantt-style horizontal bars — one line per active project, positioned along a shared date axis. */
const CAL_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const CAL_WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** Month-calendar view — each active project draws a horizontal line across the day cells it spans. */
function ActiveProjectCalendar({ projects }: { projects: Project[] }) {
  const rows = projects.filter((p) => p.startDate && p.deadline);
  const [view, setView] = React.useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  if (rows.length === 0) return null;

  const { y, m } = view;
  const firstOfMonth = new Date(y, m, 1);
  const leadDays = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -leadDays);
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)));
  const today = new Date();

  return (
    <Card className="overflow-x-auto p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{CAL_MONTHS[m]} {y}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView((v) => { const d = new Date(v.y, v.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView((v) => { const d = new Date(v.y, v.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
          {CAL_WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, wi) => {
            const weekStart = week[0];
            const weekEnd = week[6];
            const segments = rows
              .map((p) => {
                const start = new Date(p.startDate + "T00:00:00");
                const end = new Date(p.deadline + "T00:00:00");
                if (end < weekStart || start > weekEnd) return null;
                const segStart = start < weekStart ? weekStart : start;
                const segEnd = end > weekEnd ? weekEnd : end;
                const startCol = week.findIndex((d) => sameDay(d, segStart));
                const endCol = week.findIndex((d) => sameDay(d, segEnd));
                return { project: p, startCol, endCol, isFirstWeek: sameDay(start, segStart) };
              })
              .filter((s): s is NonNullable<typeof s> => s !== null);

            // if this month view has no active project at all touching this week, skip the empty lane space
            const laneCount = rows.length;

            return (
              <div key={wi}>
                <div className="grid grid-cols-7">
                  {week.map((d, di) => (
                    <div
                      key={di}
                      className={cn(
                        "flex h-7 items-start justify-center text-xs",
                        d.getMonth() !== m ? "text-muted-foreground/35" : "font-medium",
                        sameDay(d, today) && "text-primary",
                      )}
                    >
                      {d.getDate()}
                    </div>
                  ))}
                </div>
                {segments.length > 0 && (
                  <div className="relative grid grid-cols-7 gap-y-1 pb-1.5" style={{ minHeight: laneCount * 20 }}>
                    {segments.map((seg) => (
                      <div
                        key={seg.project.id}
                        className="mx-0.5 flex h-4 items-center overflow-hidden rounded-full px-2"
                        style={{
                          gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                          gridRow: rows.indexOf(seg.project) + 1,
                          background: STATUS_META[seg.project.status].chart,
                        }}
                        title={`${seg.project.name} · ${formatDate(seg.project.startDate)} → ${formatDate(seg.project.deadline)} · ${seg.project.progress}%`}
                      >
                        {seg.isFirstWeek && (
                          <span className="truncate text-[10px] font-medium text-white">
                            {seg.project.name} · {seg.project.progress}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {rows.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[p.status].chart }} />
            {p.name}
          </span>
        ))}
      </div>
    </Card>
  );
}

function PublicProjectCard({ project, tasks }: { project: Project; tasks: Task[] }) {
  const counts = {
    Todo: tasks.filter((t) => t.status === "Todo").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Done: tasks.filter((t) => t.status === "Done").length,
  };
  return (
    <Card className="glass-hover h-full p-5 hover:shadow-glass-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <ProjectIcon iconKey={project.emoji} />
          <span className="truncate font-semibold">{project.name}</span>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.publicSummary && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{project.publicSummary}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 4).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={project.progress} />
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{project.progress}%</span>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-border/60 pt-3 text-xs">
        {(["Todo", "In Progress", "Done"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: TASK_STATUS_META[s].chart }} />
            {s}: <b className="text-foreground">{counts[s]}</b>
          </span>
        ))}
      </div>
    </Card>
  );
}

/** Compact title-only preview — used for the "Done" kanban column so it doesn't eat screen space. */
function CompactProjectRow({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.6)] px-3 py-2">
      <ProjectIcon iconKey={project.emoji} size="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{project.name}</span>
    </div>
  );
}
