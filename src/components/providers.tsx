"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { getAuth, type Session } from "@/lib/auth";
import { hasSupabase, supabase } from "@/lib/supabase";

// ---------------- Toast ----------------
type Toast = { id: number; message: string; tone: "default" | "error" };
const ToastCtx = React.createContext<(message: string, tone?: "default" | "error") => void>(() => {});
export const useToast = () => React.useContext(ToastCtx);

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto animate-fade-in rounded-xl border px-4 py-2.5 text-sm font-medium shadow-glass-lg " +
            (t.tone === "error"
              ? "border-rose-400/40 bg-rose-500/15 text-rose-700 backdrop-blur-md dark:text-rose-300"
              : "glass text-foreground")
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---------------- Theme ----------------
type ThemeMode = "light" | "dark" | "system";
const ThemeCtx = React.createContext<{
  theme: "light" | "dark"; // resolved
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}>({
  theme: "light",
  mode: "system",
  toggle: () => {},
  setMode: () => {},
});
export const useTheme = () => React.useContext(ThemeCtx);

// ---------------- Auth ----------------
type AuthValue = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  mode: "demo" | "supabase";
};
const AuthCtx = React.createContext<AuthValue>({
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  mode: "demo",
});
export const useAuth = () => React.useContext(AuthCtx);

function useAuthState(): AuthValue {
  const auth = React.useMemo(() => getAuth(), []);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    auth.getSession().then((s) => {
      if (active) {
        setSession(s);
        setLoading(false);
      }
    });
    const off = auth.onChange((s) => setSession(s));
    return () => {
      active = false;
      off();
    };
  }, [auth]);

  return {
    session,
    loading,
    mode: auth.mode,
    signIn: (e, p) => auth.signIn(e, p),
    signOut: () => auth.signOut(),
  };
}

// ---------------- Realtime bridge ----------------
function RealtimeBridge() {
  const qc = useQueryClient();
  React.useEffect(() => {
    if (!hasSupabase) return;
    const client = supabase();
    if (!client) return;
    const channel = client
      .channel("dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () =>
        qc.invalidateQueries({ queryKey: ["snapshot"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () =>
        qc.invalidateQueries({ queryKey: ["snapshot"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () =>
        qc.invalidateQueries({ queryKey: ["snapshot"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () =>
        qc.invalidateQueries({ queryKey: ["snapshot"] }),
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [qc]);
  return null;
}

// ---------------- Root ----------------
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );

  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const pushToast = React.useCallback((message: string, tone: "default" | "error" = "default") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  // Theme: defaults to "system" (follows OS) until the user picks explicitly.
  const [mode, setModeState] = React.useState<ThemeMode>("system");
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const saved = localStorage.getItem("dd_theme");
    setModeState(saved === "light" || saved === "dark" ? saved : "system");
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const eff = mode === "system" ? (mq.matches ? "dark" : "light") : mode;
      setResolved(eff);
      document.documentElement.classList.toggle("dark", eff === "dark");
    };
    apply();
    if (mode === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [mode]);

  const setMode = React.useCallback((m: ThemeMode) => {
    setModeState(m);
    if (m === "system") localStorage.removeItem("dd_theme");
    else localStorage.setItem("dd_theme", m);
  }, []);

  const toggle = React.useCallback(() => {
    setModeState((m) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const currentEff = m === "system" ? (mq.matches ? "dark" : "light") : m;
      const next = currentEff === "dark" ? "light" : "dark";
      localStorage.setItem("dd_theme", next);
      return next;
    });
  }, []);

  // Wallpaper image: Settings override > NEXT_PUBLIC_WALLPAPER_URL > gradient.
  React.useEffect(() => {
    const apply = () => {
      let saved = "";
      try {
        saved = (JSON.parse(localStorage.getItem("dd_settings_v1") ?? "{}") as { wallpaperUrl?: string }).wallpaperUrl ?? "";
      } catch {}
      const url = saved.trim() || process.env.NEXT_PUBLIC_WALLPAPER_URL?.trim() || "";
      const root = document.documentElement;
      if (url) {
        root.style.setProperty("--wp-image", `url("${url}")`);
        root.style.setProperty(
          "--wp-overlay",
          "linear-gradient(hsl(var(--background) / 0.4), hsl(var(--background) / 0.55))",
        );
      } else {
        root.style.removeProperty("--wp-image");
        root.style.removeProperty("--wp-overlay");
      }
    };
    apply();
    window.addEventListener("dd-settings-changed", apply);
    return () => window.removeEventListener("dd-settings-changed", apply);
  }, []);

  const authValue = useAuthState();

  return (
    <QueryClientProvider client={client}>
      <RealtimeBridge />
      <AuthCtx.Provider value={authValue}>
        <ThemeCtx.Provider value={{ theme: resolved, mode, toggle, setMode }}>
          <ToastCtx.Provider value={pushToast}>
            {children}
            <ToastViewport toasts={toasts} />
          </ToastCtx.Provider>
        </ThemeCtx.Provider>
      </AuthCtx.Provider>
    </QueryClientProvider>
  );
}
