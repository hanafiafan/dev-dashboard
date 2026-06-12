"use client";

import * as React from "react";

// ============================================================
//  App settings — device-level preferences, stored in
//  localStorage and broadcast via a window event so every
//  consumer (widgets, providers) updates live.
// ============================================================

export type NewsTopic = "ai" | "tech" | "webdev";

export interface AppSettings {
  /** Override kota cuaca; kosong = ikut lokasi di Profile. */
  weatherCity: string;
  /** Visibilitas tiap widget dashboard (default semua tampil). */
  showWidgets: Record<string, boolean>;
  news: { topic: NewsTopic; count: number; refreshMin: number };
  pomodoro: { focus: number; short: number; long: number };
  /** Override wallpaper (mengalahkan NEXT_PUBLIC_WALLPAPER_URL). */
  wallpaperUrl: string;
  /** Volume awal Focus Radio (0..1). */
  radioVolume: number;
}

export const WIDGET_DEFS: { id: string; label: string }[] = [
  { id: "clock", label: "Jam Digital" },
  { id: "weather", label: "Cuaca" },
  { id: "agenda", label: "Agenda Hari Ini" },
  { id: "facts", label: "Fokus Saat Ini" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "music", label: "Focus Radio" },
  { id: "github", label: "GitHub Activity" },
  { id: "contrib", label: "Kontribusi GitHub" },
  { id: "news", label: "Berita Tech / AI" },
];

const DEFAULTS: AppSettings = {
  weatherCity: "",
  showWidgets: {},
  news: { topic: "ai", count: 6, refreshMin: 60 },
  pomodoro: { focus: 25, short: 5, long: 15 },
  wallpaperUrl: "",
  radioVolume: 0.7,
};

const KEY = "dd_settings_v1";
const EVENT = "dd-settings-changed";

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULTS,
      ...saved,
      news: { ...DEFAULTS.news, ...saved.news },
      pomodoro: { ...DEFAULTS.pomodoro, ...saved.pomodoro },
      showWidgets: { ...saved.showWidgets },
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(patch: Partial<AppSettings>) {
  const next = { ...getSettings(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function resetSettings() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Live settings hook — re-renders when settings change anywhere. */
export function useSettings(): [AppSettings, (patch: Partial<AppSettings>) => void] {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULTS);

  React.useEffect(() => {
    const sync = () => setSettings(getSettings());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = React.useCallback((patch: Partial<AppSettings>) => saveSettings(patch), []);
  return [settings, update];
}
