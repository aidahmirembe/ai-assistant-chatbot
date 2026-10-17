"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Play, Trash2 } from "lucide-react";
import { useVelaStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-sky-100 text-sky-800",
};

export function TaskPanel() {
  const tasks = useVelaStore((s) => s.tasks);
  const setTaskStatus = useVelaStore((s) => s.setTaskStatus);
  const deleteTask = useVelaStore((s) => s.deleteTask);
  const addTask = useVelaStore((s) => s.addTask);
  const updateTask = useVelaStore((s) => s.updateTask);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const submitNew = () => {
    const title = draft.trim();
    if (title) addTask({ title, priority: "medium", status: "todo" });
    setDraft("");
    setAdding(false);
  };

  const saveEdit = (task: Task) => {
    const title = editValue.trim();
    if (title && title !== task.title) updateTask(task.id, { title });
    setEditingId(null);
  };

  const cyclePriority = (task: Task) => {
    const next: TaskPriority =
      task.priority === "low" ? "medium" : task.priority === "medium" ? "high" : "low";
    updateTask(task.id, { priority: next });
  };

  const groups: { status: TaskStatus; label: string; items: Task[] }[] = [
    { status: "doing", label: "In focus", items: tasks.filter((t) => t.status === "doing") },
    { status: "todo", label: "Up next", items: tasks.filter((t) => t.status === "todo") },
    { status: "done", label: "Done", items: tasks.filter((t) => t.status === "done") },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <Header
          title="Tasks"
          subtitle="Captured from conversation — your actionable queue"
          actionLabel={adding ? "Cancel" : "Add task"}
          onAction={() => {
            setAdding((v) => !v);
            setDraft("");
          }}
        />

        {adding && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 p-3 shadow-[var(--shadow-sm)]">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNew();
                if (e.key === "Escape") {
                  setAdding(false);
                  setDraft("");
                }
              }}
              placeholder="What needs to get done?"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              aria-label="New task title"
            />
            <button type="button" onClick={submitNew} className="btn-ghost shrink-0">
              Save
            </button>
          </div>
        )}

        {tasks.length === 0 ? (
          <Empty
            title="No tasks yet"
            body="Ask Vela to capture a brain dump or create tasks from your goals."
          />
        ) : (
          <div className="space-y-6">
            {groups.map(
              (g) =>
                g.items.length > 0 && (
                  <section key={g.status}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {g.label}
                    </h3>
                    <div className="space-y-2">
                      {g.items.map((task) => (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 p-3.5 shadow-[var(--shadow-sm)]"
                        >
                          <StatusButton
                            status={task.status}
                            onCycle={() => {
                              const next: TaskStatus =
                                task.status === "todo"
                                  ? "doing"
                                  : task.status === "doing"
                                    ? "done"
                                    : "todo";
                              setTaskStatus(task.id, next);
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            {editingId === task.id ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => saveEdit(task)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(task);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-full rounded-md border border-[var(--stroke-strong)] bg-transparent px-2 py-0.5 font-medium text-[var(--ink)] outline-none"
                                aria-label="Edit task title"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(task.id);
                                  setEditValue(task.title);
                                }}
                                title="Click to edit"
                                className={cn(
                                  "block w-full cursor-text text-left font-medium text-[var(--ink)]",
                                  task.status === "done" && "text-[var(--muted)] line-through"
                                )}
                              >
                                {task.title}
                              </button>
                            )}
                            {task.notes && (
                              <p className="mt-1 text-sm text-[var(--muted)]">{task.notes}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => cyclePriority(task)}
                                title="Click to change priority"
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                  PRIORITY_STYLE[task.priority]
                                )}
                              >
                                {task.priority}
                              </button>
                              {task.dueDate && (
                                <span className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                                  Due {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--chip)] hover:text-red-600"
                            aria-label="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusButton({
  status,
  onCycle,
}: {
  status: TaskStatus;
  onCycle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCycle}
      className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
        status === "done"
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : status === "doing"
            ? "border-[var(--accent)] text-[var(--accent)]"
            : "border-[var(--stroke-strong)] text-[var(--muted)]"
      )}
      aria-label="Cycle task status"
    >
      {status === "done" ? (
        <Check className="h-3.5 w-3.5" />
      ) : status === "doing" ? (
        <Play className="h-3 w-3 fill-current" />
      ) : (
        <Circle className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function Header({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-ghost shrink-0">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] bg-[var(--surface)]/50 px-6 py-16 text-center">
      <p className="font-medium text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}