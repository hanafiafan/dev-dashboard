"use client";

import * as React from "react";
import {
  Folder,
  ShoppingCart,
  Smartphone,
  Palette,
  Package,
  Globe,
  Server,
  Database,
  Code2,
  Rocket,
  Landmark,
  Gamepad2,
  Camera,
  Music,
  BookOpen,
  Briefcase,
  Cpu,
  Cloud,
  PenTool,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Curated set of professional project icons (replaces emoji).
export const PROJECT_ICONS: Record<string, LucideIcon> = {
  cart: ShoppingCart,
  mobile: Smartphone,
  design: Palette,
  box: Package,
  web: Globe,
  server: Server,
  database: Database,
  code: Code2,
  rocket: Rocket,
  bank: Landmark,
  game: Gamepad2,
  camera: Camera,
  music: Music,
  book: BookOpen,
  work: Briefcase,
  cpu: Cpu,
  cloud: Cloud,
  pen: PenTool,
  chart: LineChart,
  folder: Folder,
};

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS);

export function resolveProjectIcon(key?: string): LucideIcon {
  return (key && PROJECT_ICONS[key]) || Folder;
}

/** Renders a soft rounded tile with the project's icon. */
export function ProjectIcon({
  iconKey,
  className,
  size = "md",
}: {
  iconKey?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = resolveProjectIcon(iconKey);
  const box = size === "lg" ? "h-11 w-11 rounded-2xl" : size === "sm" ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl";
  const ic = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/15",
        box,
        className,
      )}
    >
      <Icon className={ic} />
    </span>
  );
}

function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Initials avatar on a soft gradient (no emoji). */
export function Avatar({
  name,
  className,
  size = "md",
}: {
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const box =
    size === "xl"
      ? "h-20 w-20 rounded-3xl text-2xl"
      : size === "lg"
        ? "h-11 w-11 rounded-2xl text-base"
        : size === "sm"
          ? "h-8 w-8 rounded-xl text-xs"
          : "h-9 w-9 rounded-xl text-sm";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-to-br from-primary to-violet-500 font-semibold text-white shadow-soft",
        box,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
