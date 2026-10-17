"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { ChatView } from "@/components/ChatView";
import { Composer } from "@/components/Composer";
import { InsightsPanel } from "@/components/InsightsPanel";
import { KnowledgePanel } from "@/components/KnowledgePanel";
import { SettingsModal } from "@/components/SettingsModal";
import { Sidebar } from "@/components/Sidebar";
import { TaskPanel } from "@/components/TaskPanel";
import { useChat } from "@/hooks/useChat";
import { useVelaStore } from "@/lib/store";

export function VelaApp() {
  const [draft, setDraft] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { sendMessage, stop, isStreaming } = useChat();
  const activePanel = useVelaStore((s) => s.activePanel);
  const sidebarOpen = useVelaStore((s) => s.sidebarOpen);
  const setSidebarOpen = useVelaStore((s) => s.setSidebarOpen);
  const setActivePanel = useVelaStore((s) => s.setActivePanel);
  const createConversation = useVelaStore((s) => s.createConversation);
  const activeId = useVelaStore((s) => s.activeConversationId);

  const submit = async (text?: string) => {
    const value = (text ?? draft).trim();
    if (!value) return;
    if (!activeId) createConversation();
    setActivePanel("chat");
    setDraft("");
    await sendMessage(value);
  };

  const onQuickPrompt = (prompt: string) => {
    setSidebarOpen(false);
    void submit(prompt);
  };

  return (
    <div className="relative flex h-dvh overflow-hidden">
      <div className="atmosphere" aria-hidden />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-[var(--ink)]/30 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} onQuickPrompt={onQuickPrompt} />
      </div>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--stroke)]/70 px-4 py-3 lg:px-6">
          <button
            type="button"
            className="rounded-xl p-2 text-[var(--ink-soft)] transition hover:bg-[var(--chip)] lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">
              {activePanel === "chat"
                ? "Conversation"
                : activePanel === "tasks"
                  ? "Task board"
                  : activePanel === "knowledge"
                    ? "Knowledge vault"
                    : "Insight signals"}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              AI personal assistant for workflows, information & focus
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="status-pill">
              <span className="status-dot" />
              {isStreaming ? "Thinking" : "Ready"}
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          {activePanel === "chat" && (
            <>
              <ChatView onPrompt={onQuickPrompt} isStreaming={isStreaming} />
              <Composer
                value={draft}
                onChange={setDraft}
                onSubmit={() => void submit()}
                onStop={stop}
                isStreaming={isStreaming}
              />
            </>
          )}
          {activePanel === "tasks" && <TaskPanel />}
          {activePanel === "knowledge" && <KnowledgePanel />}
          {activePanel === "insights" && <InsightsPanel />}
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
