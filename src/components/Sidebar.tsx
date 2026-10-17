"use client";

import { motion } from "framer-motion";
import {
  BookMarked,
  CheckSquare,
  Lightbulb,
  MessageSquarePlus,
  MessagesSquare,
  PanelLeftClose,
  Pin,
  Settings2,
  Trash2,
} from "lucide-react";
import { QUICK_PROMPTS } from "@/lib/prompts";
import { useVelaStore } from "@/lib/store";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { PanelId } from "@/lib/types";

const NAV: { id: PanelId; label: string; icon: typeof MessagesSquare }[] = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "knowledge", label: "Knowledge", icon: BookMarked },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

export function Sidebar({
  onOpenSettings,
  onQuickPrompt,
}: {
  onOpenSettings: () => void;
  onQuickPrompt: (prompt: string) => void;
}) {
  const conversations = useVelaStore((s) => s.conversations);
  const activeId = useVelaStore((s) => s.activeConversationId);
  const activePanel = useVelaStore((s) => s.activePanel);
  const tasks = useVelaStore((s) => s.tasks);
  const notes = useVelaStore((s) => s.notes);
  const createConversation = useVelaStore((s) => s.createConversation);
  const setActiveConversation = useVelaStore((s) => s.setActiveConversation);
  const deleteConversation = useVelaStore((s) => s.deleteConversation);
  const togglePin = useVelaStore((s) => s.togglePinConversation);
  const setActivePanel = useVelaStore((s) => s.setActivePanel);
  const setSidebarOpen = useVelaStore((s) => s.setSidebarOpen);

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const sorted = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-[var(--stroke)] bg-[var(--sidebar)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-[var(--accent)]/20 blur-md" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] font-[family-name:var(--font-display)] text-sm font-bold text-white shadow-md">
              V
            </span>
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg font-semibold leading-none tracking-tight text-[var(--ink)]">
              Vela
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--muted)]">Personal flow assistant</div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--chip)] hover:text-[var(--ink)] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={() => createConversation()}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <nav className="mt-4 grid grid-cols-2 gap-1.5 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const badge =
            item.id === "tasks" ? openTasks : item.id === "knowledge" ? notes.length : 0;
          const active = activePanel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto rounded-md bg-[var(--surface)] px-1.5 text-[10px] font-semibold text-[var(--muted)]">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 px-3">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Quick flows
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onQuickPrompt(q.prompt)}
              className="rounded-full border border-[var(--stroke)] bg-[var(--surface)]/70 px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-deep)]"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col px-2">
        <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Conversations
        </p>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-3 pr-1">
          {sorted.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-[var(--muted)]">
              No chats yet — start one above
            </p>
          )}
          {sorted.map((c) => (
            <motion.div
              key={c.id}
              layout
              className={cn(
                "group flex items-center gap-1 rounded-xl px-2 py-2 transition",
                activeId === c.id && activePanel === "chat"
                  ? "bg-[var(--chip)]"
                  : "hover:bg-[var(--chip)]/70"
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  setActiveConversation(c.id);
                  setActivePanel("chat");
                }}
              >
                <div className="truncate text-sm font-medium text-[var(--ink)]">{c.title}</div>
                <div className="text-[11px] text-[var(--muted)]">
                  {formatRelativeTime(c.updatedAt)}
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-lg p-1 opacity-0 transition group-hover:opacity-100",
                  c.pinned ? "text-[var(--accent)] opacity-100" : "text-[var(--muted)]"
                )}
                onClick={() => togglePin(c.id)}
                aria-label="Pin conversation"
              >
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="rounded-lg p-1 text-[var(--muted)] opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                onClick={() => deleteConversation(c.id)}
                aria-label="Delete conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--stroke)] p-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--ink-soft)] transition hover:bg-[var(--chip)]"
        >
          <Settings2 className="h-4 w-4" />
          Settings & API
        </button>
      </div>
    </aside>
  );
}
