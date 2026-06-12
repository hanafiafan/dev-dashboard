"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GridItem {
  id: string;
  node: React.ReactNode;
  className?: string;
}

/**
 * A grid whose tiles can be rearranged by dragging the grip handle
 * (top-right of each tile, appears on hover). Order persists to
 * localStorage per `storageKey`, so every device can have its own layout.
 */
export function DraggableGrid({
  storageKey,
  items,
  className,
}: {
  storageKey: string;
  items: GridItem[];
  className?: string;
}) {
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const [order, setOrder] = React.useState<string[]>(ids);
  const [armed, setArmed] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // Load saved order after mount (SSR-safe), reconciling with current items.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = (JSON.parse(raw) as string[]).filter((id) => ids.includes(id));
        const missing = ids.filter((id) => !saved.includes(id));
        setOrder([...saved, ...missing]);
        return;
      }
    } catch {}
    setOrder(ids);
  }, [storageKey, ids]);

  const persist = (next: string[]) => {
    setOrder(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const onDrop = (targetId: string) => {
    setOverId(null);
    if (!dragId || dragId === targetId) return;
    const next = order.filter((id) => id !== dragId);
    next.splice(next.indexOf(targetId) < 0 ? next.length : next.indexOf(targetId), 0, dragId);
    persist(next);
    setDragId(null);
  };

  const byId = new Map(items.map((i) => [i.id, i]));

  return (
    <div className={className}>
      {order.map((id) => {
        const item = byId.get(id);
        if (!item) return null;
        return (
          <div
            key={id}
            draggable={armed === id}
            onDragStart={(e) => {
              setDragId(id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragId(null);
              setArmed(null);
              setOverId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragId && dragId !== id) setOverId(id);
            }}
            onDragLeave={() => setOverId((o) => (o === id ? null : o))}
            onDrop={() => onDrop(id)}
            className={cn(
              "group/drag relative rounded-lg transition-all",
              dragId === id && "opacity-40",
              overId === id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              item.className,
            )}
          >
            <button
              type="button"
              title="Tahan & geser untuk atur posisi"
              onMouseDown={() => setArmed(id)}
              onMouseUp={() => setArmed(null)}
              onTouchStart={() => setArmed(id)}
              className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 cursor-grab place-items-center rounded-lg border border-border/60 bg-[hsl(var(--card)/0.8)] text-muted-foreground opacity-60 shadow-soft backdrop-blur-sm transition hover:bg-muted hover:opacity-100 active:cursor-grabbing group-hover/drag:opacity-100"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            {item.node}
          </div>
        );
      })}
    </div>
  );
}
