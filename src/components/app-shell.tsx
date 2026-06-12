"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  Inbox,
  Moon,
  Sun,
  Cloud,
  HardDrive,
  Sparkles,
  LogOut,
  Globe,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnapshot } from "@/lib/queries";
import { getProvider } from "@/lib/api";
import { useAuth, useTheme } from "./providers";
import { Avatar } from "./icons";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/requests", label: "Requests", icon: Inbox, badgeKey: "requests" as const },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSnapshot();
  const { theme, toggle } = useTheme();
  const { session, signOut } = useAuth();
  const mode = getProvider().mode;
  const profile = data?.profile;
  const newRequests = data?.requests.filter((r) => r.status === "New").length ?? 0;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="glass-bar sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 md:flex">
        <Link href="/app" className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Dev Dashboard</div>
            <div className="text-xs text-muted-foreground">Workspace</div>
          </div>
        </Link>

        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="mx-3 mb-1 flex items-center gap-2 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Cari…</span>
          <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </button>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            const badge = item.badgeKey === "requests" ? newRequests : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[hsl(var(--card)/0.9)] text-foreground shadow-soft ring-1 ring-border/70"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
                {item.label}
                {badge > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 px-3 pb-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" /> Lihat halaman publik
          </Link>

          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ring-1 ring-inset",
              mode === "supabase"
                ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300"
                : "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
            )}
          >
            {mode === "supabase" ? <Cloud className="h-4 w-4" /> : <HardDrive className="h-4 w-4" />}
            {mode === "supabase" ? "Supabase connected" : "Demo mode (local)"}
          </div>

          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <Avatar name={profile?.name} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium">{profile?.name ?? "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{session?.email ?? ""}</div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <div className="glass-bar sticky top-0 z-20 flex items-center justify-between border-b border-border/60 px-4 py-2.5 md:hidden">
          <Link href="/app" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            Dev Dashboard
          </Link>
          <button onClick={toggle} className="rounded-lg p-2 hover:bg-muted">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <nav className="glass-bar flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 md:hidden">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                  active ? "bg-muted text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Page header used by every workspace route for a consistent look. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { theme, toggle } = useTheme();
  return (
    <div className="glass-bar sticky top-0 z-20 flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={toggle}
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-[hsl(var(--card)/0.6)] backdrop-blur-md hover:bg-muted md:inline-flex"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
