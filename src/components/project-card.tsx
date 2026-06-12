"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import type { Project, Task } from "@/lib/types";
import { Card } from "./ui";
import { Chip, PriorityBadge, ProgressBar } from "./common";
import { ProjectIcon } from "./icons";
import { formatDate } from "@/lib/utils";

export function ProjectCard({ project, tasks }: { project: Project; tasks: Task[] }) {
  const mine = tasks.filter((t) => t.projectId === project.id);
  const done = mine.filter((t) => t.status === "Done").length;
  return (
    <Link href={`/app/projects/${project.id}`}>
      <Card className="glass-hover h-full p-4 hover:shadow-glass-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <ProjectIcon iconKey={project.emoji} />
            <span className="truncate font-semibold">{project.name}</span>
          </div>
          <PriorityBadge priority={project.priority} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          {project.techStack.length > 3 && <Chip>+{project.techStack.length - 3}</Chip>}
        </div>

        {project.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={project.progress} />
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">{project.progress}%</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(project.deadline)}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {done}/{mine.length} tasks
          </span>
        </div>
      </Card>
    </Link>
  );
}
