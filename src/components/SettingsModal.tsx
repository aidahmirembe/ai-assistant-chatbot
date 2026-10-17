"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, Sparkles } from "lucide-react";
import { useVelaStore } from "@/lib/store";

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settings = useVelaStore((s) => s.settings);
  const setSettings = useVelaStore((s) => s.setSettings);
  const [draft, setDraft] = useState(settings);

  // Refresh the draft each time the modal opens (adjusting state during render,
  // the pattern React recommends instead of setState inside an effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(settings);
  }

  const save = () => {
    setSettings(draft);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-sm"
            aria-label="Close settings"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="settings-title" className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]">
                    Settings
                  </h2>
                  <p className="text-sm text-[var(--muted)]">Tune Vela to your stack and style</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-[var(--muted)] transition hover:bg-[var(--chip)] hover:text-[var(--ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              <Field label="Your name">
                <input
                  value={draft.userName}
                  onChange={(e) => setDraft({ ...draft, userName: e.target.value })}
                  placeholder="Alex"
                  className="field"
                />
              </Field>
              <Field label="Focus areas">
                <input
                  value={draft.focusAreas}
                  onChange={(e) => setDraft({ ...draft, focusAreas: e.target.value })}
                  placeholder="Product, writing, deep work…"
                  className="field"
                />
              </Field>

              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface-2)] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                  <KeyRound className="h-4 w-4 text-[var(--accent)]" />
                  Model provider
                </div>
                <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
                  Works with any OpenAI-compatible API — OpenAI, Groq, OpenRouter, Azure, local
                  gateways. Key stays in your browser (and is sent only to this app’s chat route).
                </p>
                <div className="space-y-3">
                  <Field label="API key">
                    <input
                      type="password"
                      value={draft.apiKey}
                      onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                      placeholder="sk-…"
                      className="field font-mono text-sm"
                      autoComplete="off"
                    />
                  </Field>
                  <Field label="Base URL">
                    <input
                      value={draft.baseUrl}
                      onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="field font-mono text-sm"
                    />
                  </Field>
                  <Field label="Model">
                    <input
                      value={draft.model}
                      onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                      placeholder="gpt-4o-mini"
                      className="field font-mono text-sm"
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--stroke)] px-6 py-4">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={save} className="btn-primary">
                Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
