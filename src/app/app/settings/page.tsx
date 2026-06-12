"use client";

import * as React from "react";
import {
  Palette,
  LayoutGrid,
  CloudSun,
  Newspaper,
  Timer,
  Radio,
  Database,
  RotateCcw,
  Download,
  Monitor,
  Sun,
  Moon,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { useTheme, useToast } from "@/components/providers";
import { useSettings, resetSettings, WIDGET_DEFS, type NewsTopic } from "@/lib/settings";
import { getProvider } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [settings, update] = useSettings();
  const { mode: themeMode, setMode } = useTheme();
  const toast = useToast();

  function setWidget(id: string, visible: boolean) {
    update({ showWidgets: { ...settings.showWidgets, [id]: visible } });
  }

  function resetLayout() {
    localStorage.removeItem("dd_dash_widgets");
    toast("Tata letak widget direset — buka Dashboard untuk melihat");
  }

  async function exportData() {
    const snap = await getProvider().getSnapshot();
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dev-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Data diekspor");
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Atur tampilan, widget, dan perilaku aplikasi (tersimpan di perangkat ini)" />

      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {/* ---------- Tampilan ---------- */}
        <Section icon={Palette} title="Tampilan" desc="Tema dan wallpaper">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-32 text-sm text-muted-foreground">Tema</span>
            {(
              [
                { v: "light", label: "Light", icon: Sun },
                { v: "dark", label: "Dark", icon: Moon },
                { v: "system", label: "Ikuti Sistem", icon: Monitor },
              ] as const
            ).map((t) => (
              <button
                key={t.v}
                onClick={() => setMode(t.v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                  themeMode === t.v
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
          <Field label="Wallpaper URL (kosongkan untuk gradient bawaan)">
            <div className="flex gap-2">
              <Input
                value={settings.wallpaperUrl}
                onChange={(e) => update({ wallpaperUrl: e.target.value })}
                placeholder="/wallpaper.jpg atau https://…"
              />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Taruh gambar di folder <code>public/</code> lalu isi misalnya <code>/wallpaper.jpg</code>. Berlaku langsung.
            </p>
          </Field>
        </Section>

        {/* ---------- Widget ---------- */}
        <Section icon={LayoutGrid} title="Widget Dashboard" desc="Tampil/sembunyikan widget & reset tata letak">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {WIDGET_DEFS.map((w) => (
              <Toggle
                key={w.id}
                label={w.label}
                checked={settings.showWidgets[w.id] !== false}
                onChange={(v) => setWidget(w.id, v)}
              />
            ))}
          </div>
          <Button size="sm" onClick={resetLayout}>
            <RotateCcw className="h-4 w-4" /> Reset tata letak widget
          </Button>
        </Section>

        {/* ---------- Cuaca ---------- */}
        <Section icon={CloudSun} title="Cuaca" desc="Sumber lokasi widget cuaca">
          <Field label="Kota (kosongkan = ikut lokasi di Profile)">
            <Input
              value={settings.weatherCity}
              onChange={(e) => update({ weatherCity: e.target.value })}
              placeholder="contoh: Boyolali"
            />
          </Field>
        </Section>

        {/* ---------- Berita ---------- */}
        <Section icon={Newspaper} title="Berita Tech / AI" desc="Topik, jumlah, dan interval auto-refresh">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Topik default">
              <Select
                value={settings.news.topic}
                onChange={(e) => update({ news: { ...settings.news, topic: e.target.value as NewsTopic } })}
              >
                <option value="ai">AI</option>
                <option value="tech">Tech (front page)</option>
                <option value="webdev">Web Dev</option>
              </Select>
            </Field>
            <Field label="Jumlah berita">
              <Select
                value={String(settings.news.count)}
                onChange={(e) => update({ news: { ...settings.news, count: Number(e.target.value) } })}
              >
                {[4, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} judul</option>
                ))}
              </Select>
            </Field>
            <Field label="Auto-refresh">
              <Select
                value={String(settings.news.refreshMin)}
                onChange={(e) => update({ news: { ...settings.news, refreshMin: Number(e.target.value) } })}
              >
                {[15, 30, 60, 120].map((n) => (
                  <option key={n} value={n}>tiap {n} menit</option>
                ))}
              </Select>
            </Field>
          </div>
        </Section>

        {/* ---------- Pomodoro ---------- */}
        <Section icon={Timer} title="Pomodoro" desc="Durasi tiap sesi (menit)">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Focus">
              <Input
                type="number" min={5} max={90}
                value={settings.pomodoro.focus}
                onChange={(e) => update({ pomodoro: { ...settings.pomodoro, focus: Math.max(1, Number(e.target.value)) } })}
              />
            </Field>
            <Field label="Short Break">
              <Input
                type="number" min={1} max={30}
                value={settings.pomodoro.short}
                onChange={(e) => update({ pomodoro: { ...settings.pomodoro, short: Math.max(1, Number(e.target.value)) } })}
              />
            </Field>
            <Field label="Long Break">
              <Input
                type="number" min={5} max={60}
                value={settings.pomodoro.long}
                onChange={(e) => update({ pomodoro: { ...settings.pomodoro, long: Math.max(1, Number(e.target.value)) } })}
              />
            </Field>
          </div>
        </Section>

        {/* ---------- Radio ---------- */}
        <Section icon={Radio} title="Focus Radio" desc="Volume default saat widget dimuat">
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.radioVolume}
              onChange={(e) => update({ radioVolume: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm font-semibold">{Math.round(settings.radioVolume * 100)}%</span>
          </div>
        </Section>

        {/* ---------- Data ---------- */}
        <Section icon={Database} title="Data & Reset" desc="Backup dan pemulihan">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={exportData}>
              <Download className="h-4 w-4" /> Export semua data (JSON)
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (confirm("Reset semua pengaturan di perangkat ini ke default?")) {
                  resetSettings();
                  toast("Pengaturan direset");
                }
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reset semua pengaturan
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Pengaturan disimpan per-perangkat (localStorage). Data project/task/profile tetap aman di Supabase.
          </p>
        </Section>
      </div>
    </>
  );
}

/* ---------------- pieces ---------------- */

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/15">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-[hsl(var(--card)/0.5)] px-3 py-2 text-left text-sm transition hover:bg-muted/60"
    >
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
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
