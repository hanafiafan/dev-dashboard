"use client";

import * as React from "react";
import { Button, Dialog, Field, Input, Select, Textarea } from "./ui";
import { useToast } from "./providers";
import { useCreateTask, useUpdateTask } from "@/lib/queries";
import { PRIORITIES, TASK_STATUSES, type Task, type TaskInput } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export function TaskDialog({
  open,
  onClose,
  projectId,
  task,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task;
}) {
  const toast = useToast();
  const create = useCreateTask();
  const update = useUpdateTask();

  const base: TaskInput = React.useMemo(
    () => ({
      projectId,
      name: "",
      status: "Todo",
      priority: "Medium",
      dueDate: todayISO(),
      estimatedHours: 0,
      notes: "",
    }),
    [projectId],
  );

  const [form, setForm] = React.useState<TaskInput>(base);

  React.useEffect(() => {
    if (open) {
      if (task) {
        const { id, createdAt, updatedAt, ...rest } = task;
        void id;
        void createdAt;
        void updatedAt;
        setForm(rest);
      } else {
        setForm(base);
      }
    }
  }, [open, task, base]);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.name.trim()) {
      toast("Nama task wajib diisi", "error");
      return;
    }
    try {
      if (task) {
        await update.mutateAsync([task.id, form]);
        toast("Task diperbarui");
      } else {
        await create.mutateAsync([form]);
        toast("Task ditambahkan");
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
      title={task ? "Edit Task" : "New Task"}
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
      <div className="space-y-3">
        <Field label="Task Name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Build login API" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value as Task["status"])}>
              {TASK_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => set("priority", e.target.value as Task["priority"])}>
              {PRIORITIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Due Date">
            <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
          </Field>
          <Field label="Est. Hours">
            <Input
              type="number"
              min={0}
              value={form.estimatedHours}
              onChange={(e) => set("estimatedHours", Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Catatan opsional…" />
        </Field>
      </div>
    </Dialog>
  );
}
