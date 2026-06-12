"use client";

import * as React from "react";
import Link from "next/link";
import { Search, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Card, Input, Select } from "@/components/ui";
import { PriorityBadge } from "@/components/common";
import { useSnapshot, useUpdateTask } from "@/lib/queries";
import { ProjectIcon } from "@/components/icons";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";
import { TASK_STATUS_META, formatDate, isOverdue } from "@/lib/utils";

export default function TasksPage() {
  const { data } = useSnapshot();
  const update = useUpdateTask();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus | "All">("All");

  const rows = React.useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter((t) => (status === "All" || t.status === status) && (!q || t.name.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  }, [data, q, status]);

  return (
    <>
      <PageHeader title="All Tasks" subtitle={`${data?.tasks.length ?? 0} task lintas project`} />

      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari task…" className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus | "All")} className="w-auto">
            <option value="All">Semua status</option>
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Task</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const proj = data?.projects.find((p) => p.id === t.projectId);
                  const overdue = isOverdue(t.dueDate, t.status === "Done");
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/projects/${t.projectId}`}
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <ProjectIcon iconKey={proj?.emoji} size="sm" />
                          {proj ? proj.name : "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) => update.mutate([t.id, { status: e.target.value as TaskStatus }])}
                          className={
                            "cursor-pointer appearance-none rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 " +
                            TASK_STATUS_META[t.status].badge
                          }
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-card text-foreground">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className={"px-4 py-3 " + (overdue ? "font-semibold text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                        <span className="inline-flex items-center gap-1.5">
                          {formatDate(t.dueDate)}
                          {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      Tidak ada task.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
