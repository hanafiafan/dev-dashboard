"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Flame,
  FolderPlus,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  CalendarClock,
  PieChart,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Card } from "@/components/ui";
import { StatCard, SectionHeading } from "@/components/common";
import { ProjectCard } from "@/components/project-card";
import { ProjectIcon } from "@/components/icons";
import { ClockWidget, WeatherWidget, QuickFactsWidget } from "@/components/widgets";
import { GitHubWidget } from "@/components/github-widget";
import { ContributionsWidget } from "@/components/contributions-widget";
import { MusicWidget } from "@/components/music-widget";
import { PomodoroWidget } from "@/components/pomodoro-widget";
import { NewsWidget } from "@/components/news-widget";
import { DraggableGrid } from "@/components/draggable-grid";
import { useSettings } from "@/lib/settings";
import { CalendarWidget } from "@/components/calendar";
import { ProjectStatusDonut, TaskStatusBar } from "@/components/charts";
import { ProjectDialog } from "@/components/project-dialog";
import { deriveStats, useSnapshot } from "@/lib/queries";
import { PROJECT_STATUSES } from "@/lib/types";
import { EVENT_TYPE_META, STATUS_META, formatDate, isOverdue } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

export default function DashboardPage() {
  const { data, isLoading } = useSnapshot();
  const [settings] = useSettings();
  const [dialog, setDialog] = React.useState(false);
  const stats = deriveStats(data);

  const todayIso = React.useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
  }, []);

  const upcoming = React.useMemo(() => {
    if (!data) return [];
    return [...data.tasks]
      .filter((t) => t.status !== "Done")
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
      .slice(0, 5);
  }, [data]);

  const todayEvents = React.useMemo(
    () =>
      (data?.events ?? [])
        .filter((e) => e.date === todayIso)
        .sort((a, b) => (a.time || "99").localeCompare(b.time || "99")),
    [data, todayIso],
  );
  const todayDeadlines = (data?.tasks ?? []).filter((t) => t.dueDate === todayIso && t.status !== "Done");
  const todayCount = todayEvents.length + todayDeadlines.length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={data ? `Selamat datang kembali, ${data.profile.name.split(" ")[0]}` : "Memuat…"}
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {/* Customizable widget zone — drag the grip (hover, top-right) to rearrange */}
        <div>
          <p className="mb-2 text-right text-[11px] text-muted-foreground">
            Arahkan kursor ke widget lalu tahan ikon ⋮⋮ untuk atur tata letak
          </p>
          <DraggableGrid
            storageKey="dd_dash_widgets"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            items={[
              { id: "clock", node: <ClockWidget className="h-full" /> },
              {
                id: "weather",
                node: <WeatherWidget className="h-full" city={settings.weatherCity || data?.profile.location} />,
              },
              {
                id: "agenda",
                node: (
                  <Card className="relative h-full overflow-hidden p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" /> Agenda Hari Ini
                      </h3>
                      <span className="mr-7 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">
                        {todayCount}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {todayCount === 0 && (
                        <p className="text-sm text-muted-foreground">Tidak ada agenda hari ini. Santai 🙂</p>
                      )}
                      {todayEvents.slice(0, 3).map((e) => {
                        const meta = EVENT_TYPE_META[e.type];
                        const Icon = meta.icon;
                        return (
                          <div key={e.id} className="flex items-center gap-2.5 text-sm">
                            <span className={"grid h-7 w-7 place-items-center rounded-lg " + meta.badge}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium">{e.title}</span>
                            {e.time && <span className="shrink-0 text-xs text-muted-foreground">{e.time}</span>}
                          </div>
                        );
                      })}
                      {todayDeadlines.slice(0, 2).map((t) => (
                        <Link
                          key={t.id}
                          href={`/app/projects/${t.projectId}`}
                          className="flex items-center gap-2.5 text-sm hover:opacity-80"
                        >
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">deadline</span>
                        </Link>
                      ))}
                    </div>
                  </Card>
                ),
              },
              { id: "facts", node: <QuickFactsWidget className="h-full" snapshot={data} /> },
              { id: "pomodoro", node: <PomodoroWidget className="h-full" /> },
              { id: "music", node: <MusicWidget className="h-full" /> },
              { id: "github", node: <GitHubWidget className="h-full" github={data?.profile.github} /> },
              { id: "contrib", node: <ContributionsWidget className="h-full" github={data?.profile.github} /> },
              { id: "news", node: <NewsWidget className="h-full" /> },
            ].filter((item) => settings.showWidgets[item.id] !== false)}
          />
        </div>

        {/* Calendar + upcoming */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {data && <CalendarWidget snapshot={data} />}
          </div>
          <Card className="flex flex-col p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="h-4 w-4 text-muted-foreground" /> Upcoming Tasks
            </h3>
            <div className="-mr-2 flex-1 space-y-2 overflow-y-auto pr-2">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada task aktif.</p>}
              {upcoming.map((t) => {
                const proj = data?.projects.find((p) => p.id === t.projectId);
                return (
                  <Link
                    key={t.id}
                    href={`/app/projects/${t.projectId}`}
                    className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 text-sm transition hover:bg-muted/70"
                  >
                    <ProjectIcon iconKey={proj?.emoji} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{t.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{proj?.name}</span>
                    </span>
                    <span
                      className={
                        "shrink-0 text-xs " +
                        (isOverdue(t.dueDate, false) ? "font-semibold text-rose-600 dark:text-rose-400" : "text-muted-foreground")
                      }
                    >
                      {formatDate(t.dueDate)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="In Progress" value={stats.inProgress} icon={Flame} tone="amber" />
          <StatCard label="Planning" value={stats.planning} icon={FolderPlus} tone="blue" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="emerald" />
          <StatCard label="Open Tasks" value={stats.openTasks} icon={ListTodo} tone="primary" hint={`${stats.totalTasks} total`} />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            tone="rose"
            hint={stats.overdue ? "Perlu perhatian" : "Aman"}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <PieChart className="h-4 w-4 text-muted-foreground" /> Projects by Status
            </h3>
            {data && <ProjectStatusDonut snapshot={data} />}
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-muted-foreground" /> Tasks by Status
            </h3>
            {data && <TaskStatusBar snapshot={data} />}
          </Card>
        </div>

        {/* Projects grouped by status */}
        {isLoading && <p className="text-sm text-muted-foreground">Memuat project…</p>}
        {data &&
          PROJECT_STATUSES.map((status) => {
            const list = data.projects.filter((p) => p.status === status);
            if (status === "On Hold" && list.length === 0) return null;
            return (
              <section key={status}>
                <SectionHeading icon={STATUS_META[status].icon} count={list.length}>
                  {status}
                </SectionHeading>
                {list.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((p) => (
                      <ProjectCard key={p.id} project={p} tasks={data.tasks} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                    Belum ada project.
                  </p>
                )}
              </section>
            );
          })}
      </div>

      <ProjectDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  );
}
