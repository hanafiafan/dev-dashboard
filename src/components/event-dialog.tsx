"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button, Dialog, Field, Input, Select, Textarea } from "./ui";
import { useToast } from "./providers";
import { useCreateEvent, useDeleteEvent, useUpdateEvent } from "@/lib/queries";
import { EVENT_TYPES, type CalendarEvent, type EventInput } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export function EventDialog({
  open,
  onClose,
  event,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent;
  defaultDate?: string;
}) {
  const toast = useToast();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const del = useDeleteEvent();

  const [form, setForm] = React.useState<EventInput>({
    title: "",
    date: defaultDate ?? todayISO(),
    time: "",
    type: "Meeting",
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      if (event) {
        const { id, createdAt, ...rest } = event;
        void id;
        void createdAt;
        setForm(rest);
      } else {
        setForm({ title: "", date: defaultDate ?? todayISO(), time: "", type: "Meeting", notes: "" });
      }
    }
  }, [open, event, defaultDate]);

  const set = <K extends keyof EventInput>(k: K, v: EventInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.title.trim()) {
      toast("Judul event wajib diisi", "error");
      return;
    }
    try {
      if (event) {
        await update.mutateAsync([event.id, form]);
        toast("Event diperbarui");
      } else {
        await create.mutateAsync([form]);
        toast("Event ditambahkan");
      }
      onClose();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function remove() {
    if (!event) return;
    await del.mutateAsync([event.id]);
    toast("Event dihapus");
    onClose();
  }

  const busy = create.isPending || update.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={event ? "Edit Event" : "New Event"}
      footer={
        <>
          {event && (
            <Button variant="danger" onClick={remove} className="mr-auto">
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
          )}
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
        <Field label="Judul">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Client call, deadline, dll" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal">
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Jam (opsional)">
            <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
          </Field>
        </div>
        <Field label="Tipe">
          <Select value={form.type} onChange={(e) => set("type", e.target.value as EventInput["type"])}>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Catatan">
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Detail tambahan…" />
        </Field>
      </div>
    </Dialog>
  );
}
