"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  AppState,
  AssistantAction,
  Conversation,
  Message,
  Note,
  PanelId,
  Settings,
  Task,
  TaskStatus,
} from "./types";

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1",
  userName: "",
  focusAreas: "",
};

interface VelaStore extends AppState {
  createConversation: (seedTitle?: string) => string;
  setActiveConversation: (id: string | null) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  togglePinConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt"> & { id?: string }) => string;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  applyActions: (actions: AssistantAction[], sourceMessageId?: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setActivePanel: (panel: PanelId) => void;
  setSidebarOpen: (open: boolean) => void;
  clearWorkspace: () => void;
}

function titleFromMessage(content: string): string {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New conversation";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

export const useVelaStore = create<VelaStore>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      tasks: [],
      notes: [],
      insights: [],
      settings: defaultSettings,
      activePanel: "chat",
      sidebarOpen: true,

      createConversation: (seedTitle) => {
        const id = nanoid();
        const now = Date.now();
        const conversation: Conversation = {
          id,
          title: seedTitle || "New conversation",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          conversations: [conversation, ...s.conversations],
          activeConversationId: id,
          activePanel: "chat",
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id, activePanel: "chat" }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        })),

      deleteConversation: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          const activeConversationId =
            s.activeConversationId === id
              ? conversations[0]?.id ?? null
              : s.activeConversationId;
          return { conversations, activeConversationId };
        }),

      togglePinConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      addMessage: (conversationId, message) => {
        const id = message.id || nanoid();
        const createdAt = Date.now();
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const isFirstUser =
              message.role === "user" && c.messages.filter((m) => m.role === "user").length === 0;
            return {
              ...c,
              title: isFirstUser ? titleFromMessage(message.content) : c.title,
              messages: [...c.messages, { ...message, id, createdAt }],
              updatedAt: createdAt,
            };
          }),
        }));
        return id;
      },

      updateMessage: (conversationId, messageId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m
                  ),
                  updatedAt: Date.now(),
                }
          ),
        })),

      applyActions: (actions, sourceMessageId) => {
        if (!actions.length) return;
        const now = Date.now();
        set((s) => {
          let tasks = [...s.tasks];
          let notes = [...s.notes];
          let insights = [...s.insights];

          for (const action of actions) {
            if (action.type === "create_task") {
              const exists = tasks.some(
                (t) =>
                  t.title.toLowerCase() === action.title.toLowerCase() &&
                  t.status !== "done"
              );
              if (!exists) {
                tasks = [
                  {
                    id: nanoid(),
                    title: action.title,
                    notes: action.notes,
                    priority: action.priority || "medium",
                    status: "todo",
                    dueDate: action.dueDate,
                    createdAt: now,
                    updatedAt: now,
                    sourceMessageId,
                  },
                  ...tasks,
                ];
              }
            }

            if (action.type === "complete_task") {
              const needle = action.title.toLowerCase();
              tasks = tasks.map((t) =>
                t.title.toLowerCase().includes(needle) || needle.includes(t.title.toLowerCase())
                  ? { ...t, status: "done" as const, updatedAt: now }
                  : t
              );
            }

            if (action.type === "create_note") {
              notes = [
                {
                  id: nanoid(),
                  title: action.title,
                  content: action.content,
                  tags: action.tags || [],
                  createdAt: now,
                  updatedAt: now,
                  sourceMessageId,
                },
                ...notes,
              ];
            }

            if (action.type === "insight") {
              insights = [
                {
                  id: nanoid(),
                  label: action.label,
                  value: action.value,
                  detail: action.detail,
                  createdAt: now,
                },
                ...insights,
              ].slice(0, 24);
            }
          }

          return { tasks, notes, insights };
        });
      },

      addTask: (task) => {
        const now = Date.now();
        set((s) => ({
          tasks: [{ ...task, id: nanoid(), createdAt: now, updatedAt: now }, ...s.tasks],
        }));
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
          ),
        })),

      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: Date.now() } : t
          ),
        })),

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addNote: (note) => {
        const now = Date.now();
        set((s) => ({
          notes: [{ ...note, id: nanoid(), createdAt: now, updatedAt: now }, ...s.notes],
        }));
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
          ),
        })),

      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setActivePanel: (panel) => set({ activePanel: panel }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      clearWorkspace: () =>
        set({
          conversations: [],
          activeConversationId: null,
          tasks: [],
          notes: [],
          insights: [],
        }),
    }),
    {
      name: "vela-workspace-v1",
      skipHydration: true,
      partialize: (s) => ({
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        tasks: s.tasks,
        notes: s.notes,
        insights: s.insights,
        settings: s.settings,
      }),
    }
  )
);

export function getActiveConversation() {
  const { conversations, activeConversationId } = useVelaStore.getState();
  return conversations.find((c) => c.id === activeConversationId) ?? null;
}