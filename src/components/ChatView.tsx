"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, FileText, Lightbulb, Sparkles } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { WelcomeHero } from "@/components/WelcomeHero";
import { useVelaStore } from "@/lib/store";
import type { AssistantAction, Message } from "@/lib/types";

export function ChatView({
  onPrompt,
  isStreaming,
}: {
  onPrompt: (prompt: string) => void;
  isStreaming: boolean;
}) {
  const conversations = useVelaStore((s) => s.conversations);
  const activeId = useVelaStore((s) => s.activeConversationId);
  const userName = useVelaStore((s) => s.settings.userName);
  const conversation = conversations.find((c) => c.id === activeId);
  const messages = conversation?.messages ?? [];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (!conversation || messages.length === 0) {
    return <WelcomeHero userName={userName} onPrompt={onPrompt} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
      <div className="mx-auto w-full max-w-3xl space-y-5 py-6">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <MessageRow
              key={m.id}
              message={m}
              streaming={
                isStreaming &&
                m.role === "assistant" &&
                idx === messages.length - 1
              }
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageRow({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[92%] sm:max-w-[85%] ${
          isUser
            ? "rounded-[1.35rem] rounded-br-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] px-4 py-3 text-white shadow-md"
            : "rounded-[1.35rem] rounded-bl-md border border-[var(--stroke)] bg-[var(--surface)]/90 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-md"
        }`}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-deep)]">
            <Sparkles className="h-3.5 w-3.5" />
            Vela
            {streaming && <span className="typing-dots ml-1" aria-hidden />}
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        ) : message.content ? (
          <div className="text-[15px]">
            <Markdown content={message.content} />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Thinking…</p>
        )}
        {!isUser && message.actions && message.actions.length > 0 && (
          <ActionChips actions={message.actions} />
        )}
      </div>
    </motion.div>
  );
}

function ActionChips({ actions }: { actions: AssistantAction[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--stroke)] pt-3">
      {actions.map((a, i) => {
        if (a.type === "create_task") {
          return (
            <Chip key={i} icon={<CheckSquare className="h-3 w-3" />} label={`Task · ${a.title}`} />
          );
        }
        if (a.type === "complete_task") {
          return (
            <Chip key={i} icon={<CheckSquare className="h-3 w-3" />} label={`Done · ${a.title}`} />
          );
        }
        if (a.type === "create_note") {
          return (
            <Chip key={i} icon={<FileText className="h-3 w-3" />} label={`Note · ${a.title}`} />
          );
        }
        return (
          <Chip key={i} icon={<Lightbulb className="h-3 w-3" />} label={`${a.label}: ${a.value}`} />
        );
      })}
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-deep)]">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}
