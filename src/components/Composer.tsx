"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-5 pt-2">
      <div className="composer-shell group relative overflow-hidden rounded-[1.6rem] border border-[var(--stroke)] bg-[var(--surface)]/90 p-2 shadow-[var(--shadow-md)] backdrop-blur-xl transition focus-within:border-[var(--accent)]/35 focus-within:shadow-[var(--shadow-focus)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 transition group-focus-within:opacity-100" />
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Ask Vela to plan, capture, unstick, or draft…"}
          className="max-h-[180px] min-h-[48px] w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (isStreaming) return;
              onSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-1">
          <p className="text-[11px] text-[var(--muted)]">
            Enter to send · Shift+Enter for newline
          </p>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-white transition hover:opacity-90"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!value.trim()}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition",
                value.trim()
                  ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-md hover:brightness-105"
                  : "bg-[var(--chip)] text-[var(--muted)]"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
