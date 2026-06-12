import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
// Accept either the new publishable key or the legacy anon key.
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)?.trim();

/** True when Supabase env vars are configured (otherwise we run in demo mode). */
export const hasSupabase = Boolean(url && anonKey);

/** Bucket used for public request attachments. */
export const ATTACHMENT_BUCKET = "request-files";

let client: SupabaseClient | null = null;

/** Lazily-created singleton browser client. Returns null in demo mode. */
export function supabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "dd-auth",
      },
    });
  }
  return client;
}
