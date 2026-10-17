"use client";

import { useCallback, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { generateOfflineReply, parseAssistantActions, stripActionBlock } from "@/lib/actions";
import { useVelaStore } from "@/lib/store";

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (raw: string) => {
    const content = raw.trim();
    if (!content || isStreaming) return;

    const store = useVelaStore.getState();
    let conversationId = store.activeConversationId;
    if (!conversationId) {
      conversationId = store.createConversation();
    }

    store.addMessage(conversationId, { role: "user", content });
    const assistantId = nanoid();
    store.addMessage(conversationId, {
      id: assistantId,
      role: "assistant",
      content: "",
    });

    const refreshed = useVelaStore.getState();
    const conversation = refreshed.conversations.find((c) => c.id === conversationId);
    const settings = refreshed.settings;
    const openTasks = refreshed.tasks
      .filter((t) => t.status !== "done")
      .map((t) => ({ title: t.title, priority: t.priority, status: t.status }));
    const recentNotes = refreshed.notes.map((n) => ({ title: n.title }));

    const history =
      conversation?.messages
        .filter((m) => m.id !== assistantId && m.content)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })) || [];

    setIsStreaming(true);
    abortRef.current = new AbortController();

    // Always try the API first; fall back to offline if no key / failure with NO_API_KEY
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          messages: history,
          apiKey: settings.apiKey,
          model: settings.model,
          baseUrl: settings.baseUrl,
          context: {
            userName: settings.userName,
            focusAreas: settings.focusAreas,
            openTasks,
            recentNotes,
          },
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };

        // Only fall back to offline mode when NO key is configured.
        // A wrong/expired key must show an error, not silently go offline.
        if (err.error === "NO_API_KEY") {
          const offline = generateOfflineReply(content, {
            openTaskCount: openTasks.length,
            noteCount: recentNotes.length,
            userName: settings.userName,
          });
          useVelaStore.getState().updateMessage(conversationId!, assistantId, {
            content: offline.content,
            actions: offline.actions,
          });
          useVelaStore.getState().applyActions(offline.actions, assistantId);
          return;
        }

        const message =
          err.message ||
          "Something went wrong reaching the model. Check Settings and try again.";
        useVelaStore.getState().updateMessage(conversationId!, assistantId, {
          content: `I hit a snag talking to the model.\n\n${message}\n\nYou can still use offline capture mode by clearing the API key in Settings.`,
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n");
        buffer = chunks.pop() || "";

        for (const line of chunks) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data) as { content?: string; error?: string };
            if (json.error) throw new Error(json.error);
            if (json.content) {
              full += json.content;
              const display = full.includes("```vela-actions")
                ? full.slice(0, full.indexOf("```vela-actions")).trimEnd()
                : full;
              useVelaStore.getState().updateMessage(conversationId!, assistantId, {
                content: display,
              });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      const actions = parseAssistantActions(full);
      const clean = stripActionBlock(full) || "…";
      useVelaStore.getState().updateMessage(conversationId!, assistantId, {
        content: clean,
        actions,
      });
      useVelaStore.getState().applyActions(actions, assistantId);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        useVelaStore.getState().updateMessage(conversationId!, assistantId, {
          content: "(Stopped)",
        });
        return;
      }

      if (!settings.apiKey.trim()) {
        const offline = generateOfflineReply(content, {
          openTaskCount: openTasks.length,
          noteCount: recentNotes.length,
          userName: settings.userName,
        });
        useVelaStore.getState().updateMessage(conversationId!, assistantId, {
          content: offline.content,
          actions: offline.actions,
        });
        useVelaStore.getState().applyActions(offline.actions, assistantId);
      } else {
        useVelaStore.getState().updateMessage(conversationId!, assistantId, {
          content: `Connection issue: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, stop, isStreaming };
}