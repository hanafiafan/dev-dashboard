"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getProvider } from "./api";
import type {
  EventInput,
  Profile,
  ProjectInput,
  RequestInput,
  RequestStatus,
  Snapshot,
  TaskInput,
} from "./types";

const KEY = ["snapshot"] as const;

export function useSnapshot() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => getProvider().getSnapshot(),
    staleTime: 30_000,
  });
}

export function useDataMode() {
  return getProvider().mode;
}

function useInvalidating<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateProject() {
  const p = getProvider();
  return useInvalidating((input: ProjectInput) => p.createProject(input));
}
export function useUpdateProject() {
  const p = getProvider();
  return useInvalidating((id: string, patch: Partial<ProjectInput>) => p.updateProject(id, patch));
}
export function useDeleteProject() {
  const p = getProvider();
  return useInvalidating((id: string) => p.deleteProject(id));
}
export function useCreateTask() {
  const p = getProvider();
  return useInvalidating((input: TaskInput) => p.createTask(input));
}
export function useUpdateTask() {
  const p = getProvider();
  return useInvalidating((id: string, patch: Partial<TaskInput>) => p.updateTask(id, patch));
}
export function useDeleteTask() {
  const p = getProvider();
  return useInvalidating((id: string) => p.deleteTask(id));
}
export function useUpdateProfile() {
  const p = getProvider();
  return useInvalidating((patch: Partial<Profile>) => p.updateProfile(patch));
}
export function useCreateRequest() {
  const p = getProvider();
  return useInvalidating((input: RequestInput, files: File[]) => p.createRequest(input, files));
}
export function useUpdateRequest() {
  const p = getProvider();
  return useInvalidating((id: string, status: RequestStatus) => p.updateRequest(id, status));
}
export function useDeleteRequest() {
  const p = getProvider();
  return useInvalidating((id: string) => p.deleteRequest(id));
}
export function useCreateEvent() {
  const p = getProvider();
  return useInvalidating((input: EventInput) => p.createEvent(input));
}
export function useUpdateEvent() {
  const p = getProvider();
  return useInvalidating((id: string, patch: Partial<EventInput>) => p.updateEvent(id, patch));
}
export function useDeleteEvent() {
  const p = getProvider();
  return useInvalidating((id: string) => p.deleteEvent(id));
}

// Derived selectors -------------------------------------------------
export function deriveStats(s?: Snapshot) {
  if (!s) {
    return { inProgress: 0, planning: 0, completed: 0, onHold: 0, totalTasks: 0, openTasks: 0, overdue: 0 };
  }
  const today = new Date().toISOString().slice(0, 10);
  return {
    inProgress: s.projects.filter((p) => p.status === "In Progress").length,
    planning: s.projects.filter((p) => p.status === "Planning").length,
    completed: s.projects.filter((p) => p.status === "Completed").length,
    onHold: s.projects.filter((p) => p.status === "On Hold").length,
    totalTasks: s.tasks.length,
    openTasks: s.tasks.filter((t) => t.status !== "Done").length,
    overdue: s.tasks.filter((t) => t.status !== "Done" && t.dueDate && t.dueDate < today).length,
  };
}
