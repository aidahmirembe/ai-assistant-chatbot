"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Empty, Header } from "@/components/TaskPanel";
import { useVelaStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/utils";
import type { Note } from "@/lib/types";

export function KnowledgePanel() {
  const notes = useVelaStore((s) => s.notes);
  const deleteNote = useVelaStore((s) => s.deleteNote);
  const addNote = useVelaStore((s) => s.addNote);
  const updateNote = useVelaStore((s) => s.updateNote);

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const resetNew = () => {
    setCreating(false);
    setNewTitle("");
    setNewContent("");
  };

  const saveNew = () => {
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!title && !content) {
      resetNew();
      return;
    }
    addNote({ title: title || "Untitled note", content, tags: ["inbox"] });
    resetNew();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = (note: Note) => {
    const title = editTitle.trim() || note.title;
    updateNote(note.id, { title, content: editContent.trim() });
    setEditingId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <Header
          title="Knowledge"
          subtitle="Durable notes distilled from your conversations"
          actionLabel={creating ? "Cancel" : "New note"}
          onAction={() => (creating ? resetNew() : setCreating(true))}
        />

        {creating && (
          <div className="mb-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 p-4 shadow-[var(--shadow-sm)]">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title"
              className="mb-2 w-full bg-transparent font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              aria-label="New note title"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write the idea while it's fresh…"
              rows={4}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--ink-soft)] outline-none placeholder:text-[var(--muted)]"
              aria-label="New note content"
            />
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={saveNew} className="btn-ghost">
                Save note
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !creating ? (
          <Empty
            title="Knowledge vault is empty"
            body="Ask Vela to summarize a meeting, save a decision, or file a weekly review."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((note) => (
              <motion.article
                key={note.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col rounded-2xl border border-[var(--stroke)] bg-[var(--surface)]/90 p-4 shadow-[var(--shadow-sm)]"
              >
                {editingId === note.id ? (
                  <>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mb-2 w-full rounded-md border border-[var(--stroke-strong)] bg-transparent px-2 py-0.5 font-semibold text-[var(--ink)] outline-none"
                      aria-label="Edit note title"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-md border border-[var(--stroke-strong)] bg-transparent px-2 py-1 text-sm leading-relaxed text-[var(--ink-soft)] outline-none"
                      aria-label="Edit note content"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-ghost"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(note)}
                        className="btn-ghost"
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[var(--ink)]">{note.title}</h3>
                      <div className="flex shrink-0 gap-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="rounded-lg p-1 text-[var(--muted)] hover:text-[var(--accent)]"
                          aria-label="Edit note"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          className="rounded-lg p-1 text-[var(--muted)] hover:text-red-600"
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-soft)] line-clamp-6">
                      {note.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-[var(--muted)]">
                        {formatRelativeTime(note.updatedAt)}
                      </span>
                    </div>
                  </>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}