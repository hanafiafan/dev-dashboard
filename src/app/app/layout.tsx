"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CommandPalette } from "@/components/command-palette";
import { useAuth } from "@/components/providers";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Memuat workspace…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Mengalihkan ke halaman login…
      </div>
    );
  }

  return (
    <AppShell>
      {children}
      <CommandPalette />
    </AppShell>
  );
}
