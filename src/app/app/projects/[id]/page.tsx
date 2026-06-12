"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Github,
  Figma,
  ExternalLink,
  CalendarDays,
  KanbanSquare,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Card, Select, Textarea } from "@/components/ui";
import { Chip, PriorityBadge, ProgressBar, SectionHeading, StatusBadge } from "@/components/common";
import { ProjectIcon } from "@/components/icons";
import { KanbanBoard, AddTaskButton } from "@/components/kanban";
import { ProjectDialog } from "@/components/project-dialog";
import { useDeleteProject, useSnapshot, useUpdateProject } from "@/lib/queries";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/providers";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data } = useSnapshot();
  const update = useUpdateProject();
  const del = useDeleteProject();
  const [edit, setEdit] = React.useState(false);

  const project = data?.projects.find((p) => p.id === id);
  const tasks = React.useMemo(() => data?.tasks.filter((t) => t.projectId === id) ?? [], [data, id]);

  const [desc, setDesc] = React.useState("");
  React.useEffect(() => setDesc(project?.description ?? ""), [project?.description]);

  if (!data) return <div className="p-6 text-sm text-muted-foreground">Memuat…</div>;
  if (!project)
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Project tidak ditemukan.</p>
        <Link href="/app/projects" className="mt-2 inline-block text-sm text-primary">
          ← Kembali
        </Link>
      </div>
    );

  async function setStatus(status: ProjectStatus) {
    await update.mutateAsync([project!.id, { status }]);
    toast("Status diperbarui");
  }
  async function setProgress(progress: number) {
    await update.mutateAsync([project!.id, { progress }]);
  }
  async function saveDesc() {
    if (desc !== project!.description) {
      await update.mutateAsync([project!.id, { description: desc }]);
      toast("Deskripsi disimpan");
    }
  }
  async function remove() {
    if (!confirm("Hapus project ini beserta semua task-nya?")) return;
    await del.mutateAsync([project!.id]);
    toast("Project dihapus");
    router.push("/app/projects");
  }

  const done = tasks.filter((t) => t.status === "Done").length;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <ProjectIcon iconKey={project.emoji} size="sm" /> {project.name}
          </span>
        }
        subtitle={`${project.client || "—"} · ${done}/${tasks.length} tasks selesai`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setEdit(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="danger" onClick={remove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Link
          href="/app/projects"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
        </div>

        {/* Info grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</div>
            <Select
              className="mt-2"
              value={project.status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deadline</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-muted-foreground" /> {formatDate(project.deadline)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Mulai {formatDate(project.startDate)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</div>
            <div className="mt-2 text-sm font-semibold">{project.client || "—"}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Progress</span>
              <span className="font-bold text-foreground">{project.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={project.progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <ProgressBar value={project.progress} className="mt-2" />
          </Card>
        </div>

        {/* Tech + resources */}
        <Card className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tech Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.length ? (
                project.techStack.map((t) => <Chip key={t}>{t}</Chip>)
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {project.repoUrl && <ResourceLink href={project.repoUrl} icon={<Github className="h-4 w-4" />} label="Repo" />}
            {project.figmaUrl && <ResourceLink href={project.figmaUrl} icon={<Figma className="h-4 w-4" />} label="Figma" />}
            {project.stagingUrl && (
              <ResourceLink href={project.stagingUrl} icon={<ExternalLink className="h-4 w-4" />} label="Live" />
            )}
          </div>
        </Card>

        {/* Kanban */}
        <SectionHeading icon={KanbanSquare} count={tasks.length} action={<AddTaskButton projectId={project.id} />}>
          Task Board
        </SectionHeading>
        <KanbanBoard projectId={project.id} tasks={tasks} />

        {/* Description */}
        <SectionHeading icon={FileText}>Description &amp; Notes</SectionHeading>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={saveDesc}
          placeholder="Catatan, arsitektur, keputusan teknis… (otomatis tersimpan saat klik di luar)"
          className="min-h-[140px]"
        />
      </div>

      <ProjectDialog open={edit} project={project} onClose={() => setEdit(false)} />
    </>
  );
}

function ResourceLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
    >
      {icon} {label}
    </a>
  );
}
