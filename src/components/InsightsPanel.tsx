"use client";

import { motion } from "framer-motion";
import { Empty, Header } from "@/components/TaskPanel";
import { useVelaStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/utils";

export function InsightsPanel() {
  const insights = useVelaStore((s) => s.insights);
  const tasks = useVelaStore((s) => s.tasks);
  const notes = useVelaStore((s) => s.notes);
  const conversations = useVelaStore((s) => s.conversations);

  const open = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const doing = tasks.filter((t) => t.status === "doing").length;

  const stats = [
    { label: "Open tasks", value: String(open) },
    { label: "In focus", value: String(doing) },
    { label: "Completed", value: String(done) },
    { label: "Notes", value: String(notes.length) },
    { label: "Chats", value: String(conversations.length) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <Header
          title="Insights"
          subtitle="Signals about where your attention and bottlenecks live"
        />

        <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 px-3 py-3 text-center shadow-[var(--shadow-sm)]"
            >
              <div className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--muted)]">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {insights.length === 0 ? (
          <Empty
            title="No live insights yet"
            body="Run a daily brief or bottleneck session — Vela will surface focus signals here."
          />
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 px-4 py-3.5 shadow-[var(--shadow-sm)]"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-deep)]">
                    {insight.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {insight.value}
                  </div>
                  {insight.detail && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{insight.detail}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-[var(--muted)]">
                  {formatRelativeTime(insight.createdAt)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
