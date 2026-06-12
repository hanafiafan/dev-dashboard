"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Input, Select } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import { ProjectDialog } from "@/components/project-dialog";
import { useSnapshot } from "@/lib/queries";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";

export default function ProjectsPage() {
  const { data } = useSnapshot();
  const [dialog, setDialog] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus | "All">("All");

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.projects.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.client.toLowerCase().includes(q.toLowerCase()) ||
        p.techStack.some((t) => t.toLowerCase().includes(q.toLowerCase()));
      const matchS = status === "All" || p.status === status;
      return matchQ && matchS;
    });
  }, [data, q, status]);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={`${data?.projects.length ?? 0} project total`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari project, client, atau tech…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | "All")}
            className="w-auto"
          >
            <option value="All">Semua status</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>

        {filtered.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} tasks={data!.tasks} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            Tidak ada project yang cocok.
          </p>
        )}
      </div>

      <ProjectDialog open={dialog} onClose={() => setDialog(false)} />
    </>
  );
}
