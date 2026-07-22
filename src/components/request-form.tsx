"use client";

import * as React from "react";
import { FolderInput, Send, CheckCircle2, MessageSquarePlus, Clock3, MessageCircle } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";
import { useCreateRequest, useSnapshot } from "@/lib/queries";
import type { RequestInput } from "@/lib/types";
import { waLink } from "@/lib/utils";

const PROJECT_TYPES = [
  "Website / Web App",
  "Mobile App",
  "UI/UX Design",
  "API / Backend",
  "Maintenance / Bug Fix",
  "Lainnya",
];

const TIMELINE_OPTIONS = ["Fleksibel", "< 2 minggu", "2-4 minggu", "1-2 bulan", "> 2 bulan"];

const emptyForm: RequestInput = {
  name: "",
  whatsapp: "",
  email: "",
  company: "",
  projectType: PROJECT_TYPES[0],
  team: "",
  timeline: TIMELINE_OPTIONS[0],
  referenceUrl: "",
  driveLink: "",
  message: "",
  attachments: [],
};

export function RequestForm() {
  const { data } = useSnapshot();
  const create = useCreateRequest();
  const [form, setForm] = React.useState<RequestInput>(emptyForm);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const set = <K extends keyof RequestInput>(k: K, v: RequestInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.message.trim()) {
      setError("Nama, No. WhatsApp, dan deskripsi wajib diisi.");
      return;
    }
    setError("");
    try {
      await create.mutateAsync([form, []]);
      setDone(true);
    } catch (err) {
      setError("Gagal mengirim: " + (err as Error).message);
    }
  }

  if (data && data.profile.acceptingProjects === false) {
    return (
      <Card className="mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10">
          <Clock3 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Sedang tidak menerima project baru</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Slot pengerjaan sedang penuh. Form request untuk sementara ditutup — cek lagi nanti, atau kalau mendesak
          bisa langsung hubungi lewat WhatsApp.
        </p>
        {data.profile.linkedin && waLink(data.profile.linkedin) && (
          <a href={waLink(data.profile.linkedin)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block">
            <Button variant="primary">
              <MessageCircle className="h-4 w-4" /> Chat WhatsApp
            </Button>
          </a>
        )}
      </Card>
    );
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
            setForm(emptyForm);
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
          <Field label="Perusahaan / Brand (opsional)">
            <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="PT / brand kamu" />
          </Field>
          <Field label="Jenis Project">
            <Select value={form.projectType} onChange={(e) => set("projectType", e.target.value)}>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Dari Tim / Bagian (opsional)">
            <Input value={form.team} onChange={(e) => set("team", e.target.value)} placeholder="mis. Marketing, Finance, CRM" />
          </Field>
          <Field label="Target Timeline">
            <Select value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
              {TIMELINE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Link Referensi (opsional)">
            <Input
              value={form.referenceUrl}
              onChange={(e) => set("referenceUrl", e.target.value)}
              placeholder="https://... (situs/desain acuan)"
            />
          </Field>
        </div>

        <Field label="Deskripsi kebutuhan / request *">
          <Textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Ceritakan lebih detail apa yang kamu butuhkan — fitur, alur, target pengguna, kendala saat ini, dll. Makin detail, makin cepat saya bisa kasih estimasi yang akurat."
            className="min-h-[140px]"
          />
        </Field>

        <Field label="Link Google Drive — file/referensi (opsional)">
          <div className="relative">
            <FolderInput className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={form.driveLink}
              onChange={(e) => set("driveLink", e.target.value)}
              placeholder="https://drive.google.com/..."
              className="pl-9"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Kalau ada file (foto, dokumen, referensi), upload dulu ke Google Drive, ubah akses jadi <b>"Siapa saja
            yang memiliki link — Editor"</b>, lalu tempel link-nya di sini.
          </p>
        </Field>

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
