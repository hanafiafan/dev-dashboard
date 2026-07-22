"use client";

import * as React from "react";
import { MessageCircle, Mail, Paperclip, Trash2, Inbox } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Card, Select } from "@/components/ui";
import { Badge } from "@/components/ui";
import { useDeleteRequest, useSnapshot, useUpdateRequest } from "@/lib/queries";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/types";
import { REQUEST_STATUS_META, relativeTime, waLink } from "@/lib/utils";
import { useToast } from "@/components/providers";

export default function RequestsPage() {
  const { data } = useSnapshot();
  const update = useUpdateRequest();
  const del = useDeleteRequest();
  const toast = useToast();
  const [filter, setFilter] = React.useState<RequestStatus | "All">("All");

  const requests = React.useMemo(() => {
    const list = data?.requests ?? [];
    return filter === "All" ? list : list.filter((r) => r.status === filter);
  }, [data, filter]);

  const newCount = (data?.requests ?? []).filter((r) => r.status === "New").length;

  async function remove(id: string) {
    if (!confirm("Hapus request ini?")) return;
    await del.mutateAsync([id]);
    toast("Request dihapus");
  }

  return (
    <>
      <PageHeader
        title="Requests"
        subtitle={`${data?.requests.length ?? 0} request masuk · ${newCount} baru`}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as RequestStatus | "All")} className="w-auto">
            <option value="All">Semua status</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        }
      />

      <div className="space-y-4 p-6">
        {requests.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">Belum ada request masuk.</p>
          </div>
        )}

        {requests.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.name}</h3>
                  <Badge className={REQUEST_STATUS_META[r.status].badge}>{r.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.projectType} · {relativeTime(r.createdAt)}
                  {r.company ? ` · ${r.company}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={r.status}
                  onChange={(e) => update.mutate([r.id, e.target.value as RequestStatus])}
                  className="h-8 w-auto text-xs"
                >
                  {REQUEST_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-md border border-border p-2 text-muted-foreground hover:border-rose-300 hover:text-rose-600"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {(r.budget || r.timeline || r.referenceUrl || r.driveLink) && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {r.budget && (
                  <span>
                    <b className="text-foreground">Budget:</b> {r.budget}
                  </span>
                )}
                {r.timeline && (
                  <span>
                    <b className="text-foreground">Timeline:</b> {r.timeline}
                  </span>
                )}
                {r.referenceUrl && (
                  <a href={r.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Link referensi ↗
                  </a>
                )}
                {r.driveLink && (
                  <a href={r.driveLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Buka Google Drive ↗
                  </a>
                )}
              </div>
            )}

            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 px-4 py-3 text-sm leading-relaxed">
              {r.message}
            </p>

            {r.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-[160px] truncate">{a.name}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <a href={waLink(r.whatsapp)} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                  <MessageCircle className="h-4 w-4" /> Chat WhatsApp
                </Button>
              </a>
              <span className="text-sm text-muted-foreground">{r.whatsapp}</span>
              {r.email && (
                <a
                  href={`mailto:${r.email}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" /> {r.email}
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
