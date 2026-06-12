"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Inbox,
  User,
  Globe,
  Settings,
  SunMoon,
  MonitorCog,
  LogOut,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnapshot } from "@/lib/queries";
import { useAuth, useTheme } from "./providers";
import { ProjectIcon } from "./icons";

type Item = {
  id: string;
  label: string;
  hint?: string;
  section: string;
  icon: React.ReactNode;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const { data } = useSnapshot();
  const { signOut } = useAuth();
  const { toggle, setMode } = useTheme();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const close = () => setOpen(false);
  const go = (href: string) => {
    router.push(href);
    close();
  };

  const nav = (label: string, href: string, icon: LucideIcon): Item => ({
    id: "nav:" + href,
    label,
    section: "Navigasi",
    icon: <NavIcon icon={icon} />,
    run: () => go(href),
  });

  const items: Item[] = React.useMemo(() => {
    const Icon = (I: LucideIcon) => <NavIcon icon={I} />;
    const base: Item[] = [
      nav("Dashboard", "/app", LayoutDashboard),
      nav("Projects", "/app/projects", FolderKanban),
      nav("Tasks", "/app/tasks", CheckSquare),
      nav("Requests", "/app/requests", Inbox),
      nav("Profile", "/app/profile", User),
      nav("Settings", "/app/settings", Settings),
      {
        id: "act:public",
        label: "Buka halaman publik",
        section: "Aksi",
        icon: Icon(Globe),
        run: () => {
          window.open("/", "_blank");
          close();
        },
      },
      {
        id: "act:theme",
        label: "Ganti tema (light / dark)",
        section: "Aksi",
        icon: Icon(SunMoon),
        keywords: "dark light mode tema",
        run: () => {
          toggle();
          close();
        },
      },
      {
        id: "act:auto",
        label: "Tema otomatis (ikut sistem)",
        section: "Aksi",
        icon: Icon(MonitorCog),
        keywords: "auto system os",
        run: () => {
          setMode("system");
          close();
        },
      },
      {
        id: "act:signout",
        label: "Sign out",
        section: "Aksi",
        icon: Icon(LogOut),
        run: () => {
          signOut();
          close();
        },
      },
    ];

    const projectItems: Item[] = (data?.projects ?? []).map((p) => ({
      id: "proj:" + p.id,
      label: p.name,
      hint: p.status,
      section: "Projects",
      icon: <ProjectIcon iconKey={p.emoji} size="sm" />,
      keywords: p.client + " " + p.techStack.join(" "),
      run: () => go(`/app/projects/${p.id}`),
    }));

    const taskItems: Item[] = (data?.tasks ?? []).slice(0, 50).map((t) => {
      const proj = data?.projects.find((p) => p.id === t.projectId);
      return {
        id: "task:" + t.id,
        label: t.name,
        hint: proj?.name,
        section: "Tasks",
        icon: <NavIcon icon={CheckSquare} />,
        keywords: (proj?.name ?? "") + " " + t.status,
        run: () => go(`/app/projects/${t.projectId}`),
      };
    });

    return [...base, ...projectItems, ...taskItems];
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      (it.label + " " + (it.hint ?? "") + " " + (it.keywords ?? "") + " " + it.section)
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  React.useEffect(() => setActive(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === "Escape") {
      close();
    }
  };

  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  // group rows but keep a flat index for keyboard nav
  let idx = -1;
  let lastSection = "";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={close}
    >
      <div
        className="glass w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl shadow-glass-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari project, task, atau perintah…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">Tidak ada hasil.</div>
          )}
          {filtered.map((it) => {
            idx += 1;
            const myIdx = idx;
            const showSection = it.section !== lastSection;
            lastSection = it.section;
            return (
              <React.Fragment key={it.id}>
                {showSection && (
                  <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {it.section}
                  </div>
                )}
                <button
                  data-idx={myIdx}
                  onMouseEnter={() => setActive(myIdx)}
                  onClick={() => it.run()}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition",
                    active === myIdx ? "bg-primary/12 text-foreground" : "text-foreground/90 hover:bg-muted/60",
                  )}
                >
                  {it.icon}
                  <span className="min-w-0 flex-1 truncate font-medium">{it.label}</span>
                  {it.hint && <span className="shrink-0 text-xs text-muted-foreground">{it.hint}</span>}
                  {active === myIdx && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Nudge>↑</Nudge>
            <Nudge>↓</Nudge> navigasi
          </span>
          <span className="flex items-center gap-1.5">
            <Nudge>↵</Nudge> pilih
          </span>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted/70 text-muted-foreground">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function Nudge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-medium">{children}</kbd>
  );
}
