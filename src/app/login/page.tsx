"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, LogIn } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import { useAuth } from "@/components/providers";
import { isDemoAuth, demoPasswordHint } from "@/lib/auth";

export default function LoginPage() {
  const { signIn, session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState(isDemoAuth ? "hanafi.afan@gmail.com" : "");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (session) router.replace("/app");
  }, [session, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/app");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>

        <Card className="p-7 shadow-lg">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-lg font-semibold">Masuk ke Workspace</h1>
            <p className="text-sm text-muted-foreground">Khusus owner (Hanafi Afan)</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {error && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={busy}>
              <LogIn className="h-4 w-4" /> {busy ? "Masuk…" : "Masuk"}
            </Button>
          </form>

          {isDemoAuth && (
            <p className="mt-5 rounded-lg border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground">
              <b>Demo mode</b> — password: <code className="font-semibold">{demoPasswordHint}</code>
              <br />
              (email apa pun bisa). Hubungkan Supabase untuk login sungguhan.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
