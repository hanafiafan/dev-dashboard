"use client";

import * as React from "react";
import { Paperclip, X, Send, CheckCircle2, MessageSquarePlus } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { useCreateRequest } from "@/lib/queries";
import type { RequestInput } from "@/lib/types";

const PROJECT_TYPES = [
  "Website / Web App",
  "Mobile App",
  "UI/UX Design",
  "API / Backend",
  "Maintenance / Bug Fix",
  "Lainnya",
];

const MAX_FILE_MB = 10;

export function RequestForm() {
  const create = useCreateRequest();
  const [form, setForm] = React.useState<RequestInput>({
    name: "",
    whatsapp: "",
    email: "",
    projectType: PROJECT_TYPES[0],
    message: "",
    attachments: [],
  });
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const set = <K extends keyof RequestInput>(k: K, v: RequestInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`File "${tooBig.name}" melebihi ${MAX_FILE_MB}MB.`);
      return;
    }
    setError("");
    setFiles((prev) => [...prev, ...incoming].slice(0, 5));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.message.trim()) {
      setError("Nama, No. WhatsApp, dan deskripsi wajib diisi.");
      return;
    }
    setError("");
    try {
      await create.mutateAsync([form, files]);
      setDone(true);
    } catch (err) {
      setError("Gagal mengirim: " + (err as Error).message);
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Request terkirim!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Terima kasih, {form.name}. Request kamu sudah masuk dan akan segera ditinjau. Saya akan
          menghubungi kamu lewat WhatsApp.
        </p>
        <Button
          variant="default"
          className="mx-auto mt-5"
          onClick={() => {
            setDone(false);
            setForm({ name: "", whatsapp: "", email: "", projectType: PROJECT_TYPES[0], message: "", attachments: [] });
            setFiles([]);
          }}
        >
          Kirim request lain
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Punya project untuk dikerjakan?</h3>
          <p className="text-sm text-muted-foreground">Isi brief di bawah, saya akan menghubungi kamu.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama *">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama kamu" />
          </Field>
          <Field label="No. WhatsApp *">
            <Input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="08xxxxxxxxxx"
              inputMode="tel"
            />
          </Field>
          <Field label="Email (opsional)">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
          </Field>
          <Field label="Jenis Project">
            <Select value={form.projectType} onChange={(e) => set("projectType", e.target.value)}>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Deskripsi kebutuhan / request *">
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Ceritakan apa yang kamu butuhkan — fitur, timeline, referensi, dll."
            className="min-h-[120px]"
          />
        </Field>

        {/* Attachments */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Lampiran (foto / dokumen, maks 5 file · {MAX_FILE_MB}MB)
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Paperclip className="h-4 w-4" /> Tambah lampiran
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={create.isPending}>
          <Send className="h-4 w-4" /> {create.isPending ? "Mengirim…" : "Kirim Request"}
        </Button>
      </form>
    </Card>
  );
}
