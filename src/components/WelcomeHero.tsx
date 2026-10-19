"use client";

import { motion } from "framer-motion";
import { QUICK_PROMPTS } from "@/lib/prompts";

export function WelcomeHero({
  userName,
  onPrompt,
}: {
  userName: string;
  onPrompt: (prompt: string) => void;
}) {
  const greeting = userName ? `Ready when you are, ${userName}` : "Your day, in flow";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--accent)]/15 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[18%] h-48 w-48 rounded-full bg-[var(--sky)]/25 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 m-auto flex w-full flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] font-[family-name:var(--font-display)] text-2xl font-bold text-white shadow-[0_20px_40px_-18px_rgba(15,118,110,0.65)]"
          >
            V
          </motion.div>

          <p className="mb-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            Vela
          </p>
          <h1 className="mb-3 text-xl font-medium text-[var(--ink-soft)] sm:text-2xl">
            {greeting}
          </h1>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
            Streamline workflows, capture what matters, and clear productive bottlenecks —
            through natural conversation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="relative z-10 mt-6 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2"
        >
          {QUICK_PROMPTS.slice(0, 4).map((q, i) => (
            <motion.button
              key={q.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => onPrompt(q.prompt)}
              className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/75 px-4 py-3.5 text-left shadow-[var(--shadow-sm)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-md)]"
            >
              <div className="text-sm font-semibold text-[var(--ink)]">{q.label}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                {q.prompt}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
