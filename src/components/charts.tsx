"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Snapshot } from "@/lib/types";
import { STATUS_META, TASK_STATUS_META } from "@/lib/utils";
import { PROJECT_STATUSES, TASK_STATUSES } from "@/lib/types";

export function ProjectStatusDonut({ snapshot }: { snapshot: Snapshot }) {
  const data = PROJECT_STATUSES.map((s) => ({
    name: s,
    value: snapshot.projects.filter((p) => p.status === s).length,
    color: STATUS_META[s].chart,
  })).filter((d) => d.value > 0);

  const total = snapshot.projects.length;

  if (!total) return <Empty label="Belum ada project" />;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, n: string) => [`${v} project`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">projects</span>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {PROJECT_STATUSES.map((s) => {
          const v = snapshot.projects.filter((p) => p.status === s).length;
          return (
            <li key={s} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_META[s].chart }} />
              <span className="text-muted-foreground">{s}</span>
              <span className="ml-auto font-semibold">{v}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TaskStatusBar({ snapshot }: { snapshot: Snapshot }) {
  const data = TASK_STATUSES.map((s) => ({
    name: s,
    value: snapshot.tasks.filter((t) => t.status === s).length,
    color: TASK_STATUS_META[s].chart,
  }));
  const total = snapshot.tasks.length;
  if (!total) return <Empty label="Belum ada task" />;

  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
};

function Empty({ label }: { label: string }) {
  return (
    <div className="grid h-[150px] place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}
