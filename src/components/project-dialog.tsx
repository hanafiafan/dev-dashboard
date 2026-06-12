"use client";

import * as React from "react";
import { Button, Dialog, Field, Input, Select, Textarea } from "./ui";
import { useToast } from "./providers";
import { useCreateProject, useUpdateProject } from "@/lib/queries";
import { PRIORITIES, PROJECT_STATUSES, type Project, type ProjectInput } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";
import { PROJECT_ICON_KEYS, PROJECT_ICONS } from "./icons";

const empty: ProjectInput = {
  name: "",
  emoji: "folder",
  status: "Planning",
  priority: "Medium",
  startDate: todayISO(),
  deadline: "",
  techStack: [],
  client: "",
  progress: 0,
  description: "",
  repoUrl: "",
  figmaUrl: "",
  stagingUrl: "",
  isPublic: true,
};

export function ProjectDialog({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project;
}) {
  const toast = useToast();
  const create = useCreateProject();
  const update = useUpdateProject();
  const [form, setForm] = React.useState<ProjectInput>(empty);
  const [techText, setTechText] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (project) {
        const { id, createdAt, updatedAt, ...rest } = project;
        void id;
        void createdAt;
        void updatedAt;
        setForm(rest);
        setTechText(project.techStack.join(", "));
      } else {
        setForm(empty);
        setTechText("");
      }
    }
  }, [open, project]);

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.name.trim()) {
      toast("Nama project wajib diisi", "error");
      return;
    }
    const payload: ProjectInput = {
      ...form,
      techStack: techText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (project) {
        await update.mutateAsync([project.id, payload]);
        toast("Project diperbarui");
      } else {
        await create.mutateAsync([payload]);
        toast("Project dibuat");
      }
      onClose();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const busy = create.isPending || update.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={project ? "Edit Project" : "New Project"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project Name" className="col-span-2">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="E-Commerce Platform" />
        </Field>
        <Field label="Client / Stakeholder" className="col-span-2">
          <Input value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="PT ..." />
        </Field>
        <div className="col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</span>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border/70 bg-muted/30 p-2">
            {PROJECT_ICON_KEYS.map((key) => {
              const Icon = PROJECT_ICONS[key];
              const active = form.emoji === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("emoji", key)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  title={key}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value as Project["priority"])}>
            {PRIORITIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Start Date">
          <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Deadline">
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label="Tech Stack (comma separated)" className="col-span-2">
          <Input value={techText} onChange={(e) => setTechText(e.target.value)} placeholder="Next.js, Laravel, MySQL" />
        </Field>
        <Field label="Progress (%)" className="col-span-2">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm font-semibold">{form.progress}%</span>
          </div>
        </Field>
        <Field label="Description" className="col-span-2">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ringkasan project…" />
        </Field>
        <Field label="Repository URL">
          <Input value={form.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/…" />
        </Field>
        <Field label="Figma URL">
          <Input value={form.figmaUrl} onChange={(e) => set("figmaUrl", e.target.value)} placeholder="https://figma.com/…" />
        </Field>
        <Field label="Staging / Live URL" className="col-span-2">
          <Input value={form.stagingUrl} onChange={(e) => set("stagingUrl", e.target.value)} placeholder="https://…" />
        </Field>
        <label className="col-span-2 flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => set("isPublic", e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span className="text-sm">
            <b>Tampilkan di halaman publik</b>
            <span className="block text-xs text-muted-foreground">
              Project ini akan terlihat oleh pengunjung di beranda (read-only).
            </span>
          </span>
        </label>
      </div>
    </Dialog>
  );
}
