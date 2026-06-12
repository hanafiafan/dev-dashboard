"use client";

import * as React from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";
import { TASK_STATUS_META, formatDate, isOverdue, PRIORITY_META } from "@/lib/utils";
import { useDeleteTask, useUpdateTask } from "@/lib/queries";
import { Button } from "./ui";
import { TaskDialog } from "./task-dialog";
import { useToast } from "./providers";
import { cn } from "@/lib/utils";

export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const update = useUpdateTask();
  const del = useDeleteTask();
  const toast = useToast();
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [hoverCol, setHoverCol] = React.useState<TaskStatus | null>(null);
  const [dialog, setDialog] = React.useState<{ open: boolean; task?: Task }>({ open: false });

  async function moveTo(status: TaskStatus) {
    setHoverCol(null);
    if (!dragId) return;
    const t = tasks.find((x) => x.id === dragId);
    setDragId(null);
    if (t && t.status !== status) {
      await update.mutateAsync([t.id, { status }]);
    }
  }

  async function remove(t: Task) {
    await del.mutateAsync([t.id]);
    toast("Task dihapus");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const items = tasks.filter((t) => t.status === status);
          const meta = TASK_STATUS_META[status];
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverCol(status);
              }}
              onDragLeave={() => setHoverCol((c) => (c === status ? null : c))}
              onDrop={() => moveTo(status)}
              className={cn(
                "rounded-xl border bg-muted/40 p-2.5 transition-colors",
                hoverCol === status ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className={cn("text-sm font-semibold", meta.column)}>{status}</span>
                <span className="rounded-full bg-card px-2 text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      "group cursor-grab rounded-xl border border-border/70 bg-[hsl(var(--card)/0.85)] p-3 shadow-soft transition hover:shadow-glass active:cursor-grabbing",
                      dragId === t.id && "opacity-40",
                    )}
                  >
                    <div className="mb-2 text-sm font-medium leading-snug">{t.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn("h-2 w-2 rounded-full", PRIORITY_META[t.priority].dot)} title={t.priority} />
                        <span className={isOverdue(t.dueDate, t.status === "Done") ? "text-rose-600 dark:text-rose-400" : ""}>
                          {formatDate(t.dueDate)}
                        </span>
                      </span>
                      <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => setDialog({ open: true, task: t })}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(t)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setDialog({ open: true })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog
        open={dialog.open}
        task={dialog.task}
        projectId={projectId}
        onClose={() => setDialog({ open: false })}
      />
    </>
  );
}

export function AddTaskButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Task
      </Button>
      <TaskDialog open={open} projectId={projectId} onClose={() => setOpen(false)} />
    </>
  );
}
