"use client";

import * as React from "react";
import { Save, Github, MessageCircle, Globe, Mail, MapPin, Eye, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/common";
import { Avatar } from "@/components/icons";
import { useSnapshot, useUpdateProfile } from "@/lib/queries";
import type { Profile } from "@/lib/types";
import { waLink } from "@/lib/utils";
import { useToast } from "@/components/providers";

export default function ProfilePage() {
  const { data } = useSnapshot();
  const update = useUpdateProfile();
  const toast = useToast();
  const [form, setForm] = React.useState<Profile | null>(null);
  const [skillsText, setSkillsText] = React.useState("");

  React.useEffect(() => {
    if (data && !form) {
      setForm(data.profile);
      setSkillsText(data.profile.skills.join(", "));
    }
  }, [data, form]);

  if (!form) return <div className="p-6 text-sm text-muted-foreground">Memuat…</div>;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function save() {
    const payload: Profile = {
      ...form!,
      skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    await update.mutateAsync([payload]);
    toast("Profil disimpan");
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Kelola informasi profil kamu"
        actions={
          <Button variant="primary" size="sm" onClick={save} disabled={update.isPending}>
            <Save className="h-4 w-4" /> {update.isPending ? "Saving…" : "Save"}
          </Button>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        {/* Preview card */}
        <Card className="h-fit p-6 text-center">
          <Avatar name={form.name} size="xl" className="mx-auto" />
          <h2 className="mt-4 text-lg font-semibold">{form.name || "—"}</h2>
          <p className="text-sm text-muted-foreground">{form.role}</p>

          <div className="mt-4 space-y-2 text-left text-sm">
            {form.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {form.email}
              </div>
            )}
            {form.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {form.location}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {skillsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {form.github && <Social href={form.github} icon={<Github className="h-4 w-4" />} />}
            {form.linkedin && waLink(form.linkedin) !== "" && (
              <Social href={waLink(form.linkedin)} icon={<MessageCircle className="h-4 w-4" />} />
            )}
            {form.website && <Social href={form.website} icon={<Globe className="h-4 w-4" />} />}
          </div>
        </Card>

        {/* Edit form */}
        <Card className="p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Role / Title">
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} />
            </Field>
            <Field label="GitHub URL">
              <Input value={form.github} onChange={(e) => set("github", e.target.value)} />
            </Field>
            <Field label="No. WhatsApp">
              <Input
                value={form.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </Field>
            <Field label="Skills (comma separated)" className="sm:col-span-2">
              <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="TypeScript, Next.js, …" />
            </Field>
            <Field label="Bio" className="sm:col-span-2">
              <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} className="min-h-[110px]" />
            </Field>
          </div>
        </Card>

        {/* Status ketersediaan project */}
        <Card className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Status Ketersediaan Project</h3>
          </div>
          <VisibilityToggle
            label={form.acceptingProjects !== false ? "Sedang menerima project baru" : "Sedang tidak menerima project baru"}
            checked={form.acceptingProjects !== false}
            onChange={(v) => set("acceptingProjects", v)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Kalau dimatikan, form request di halaman publik otomatis dikunci dan pengunjung diarahkan chat WhatsApp
            langsung — cocok dipakai saat slot pengerjaan lagi penuh.
          </p>
        </Card>

        {/* Visibilitas halaman publik */}
        <Card className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Visibilitas Halaman Publik</h3>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <VisibilityToggle
              label="Kalender publik"
              checked={form.showCalendar !== false}
              onChange={(v) => set("showCalendar", v)}
            />
            <VisibilityToggle
              label="Chart Tech Stack Terpopuler"
              checked={form.showTechStack !== false}
              onChange={(v) => set("showTechStack", v)}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

function VisibilityToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 text-left text-sm transition hover:bg-muted/60"
    >
      <span className="font-medium">{label}</span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}>
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function Social({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {icon}
    </a>
  );
}
