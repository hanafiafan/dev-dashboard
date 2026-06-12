import { hasSupabase, supabase } from "./supabase";

// ============================================================
//  Auth abstraction
//   • Supabase mode -> real email/password auth.
//   • Demo mode     -> a single local "owner" password so the
//     workspace can be explored without any backend.
//  In both modes a signed-in session === the owner (Hanafi),
//  because Supabase sign-ups should be disabled (single user).
// ============================================================

export interface Session {
  email: string;
}

export interface AuthClient {
  readonly mode: "demo" | "supabase";
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  onChange(cb: (s: Session | null) => void): () => void;
}

// ---- Demo auth (localStorage) ----
const DEMO_KEY = "dd_demo_session";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim() || "admin";
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL?.trim() || "hanafi.afan@gmail.com";

class DemoAuth implements AuthClient {
  readonly mode = "demo" as const;
  private listeners = new Set<(s: Session | null) => void>();

  async getSession(): Promise<Session | null> {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  }

  async signIn(email: string, password: string): Promise<void> {
    if (password !== DEMO_PASSWORD) {
      throw new Error(`Password salah. (Demo mode: gunakan "${DEMO_PASSWORD}")`);
    }
    const session: Session = { email: email || OWNER_EMAIL };
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(session));
    this.listeners.forEach((cb) => cb(session));
  }

  async signOut(): Promise<void> {
    window.localStorage.removeItem(DEMO_KEY);
    this.listeners.forEach((cb) => cb(null));
  }

  onChange(cb: (s: Session | null) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

// ---- Supabase auth ----
class SupabaseAuth implements AuthClient {
  readonly mode = "supabase" as const;

  async getSession(): Promise<Session | null> {
    const c = supabase();
    if (!c) return null;
    const { data } = await c.auth.getSession();
    const email = data.session?.user?.email;
    return email ? { email } : null;
  }

  async signIn(email: string, password: string): Promise<void> {
    const c = supabase();
    if (!c) throw new Error("Supabase unavailable");
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async signOut(): Promise<void> {
    await supabase()?.auth.signOut();
  }

  onChange(cb: (s: Session | null) => void): () => void {
    const c = supabase();
    if (!c) return () => {};
    const { data } = c.auth.onAuthStateChange((_e, session) => {
      const email = session?.user?.email;
      cb(email ? { email } : null);
    });
    return () => data.subscription.unsubscribe();
  }
}

let authClient: AuthClient | null = null;
export function getAuth(): AuthClient {
  if (!authClient) authClient = hasSupabase ? new SupabaseAuth() : new DemoAuth();
  return authClient;
}

export const isDemoAuth = !hasSupabase;
export const demoPasswordHint = DEMO_PASSWORD;
