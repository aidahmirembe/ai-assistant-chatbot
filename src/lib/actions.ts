import type { AssistantAction, TaskPriority } from "./types";

const ACTION_BLOCK = /```vela-actions\s*([\s\S]*?)```/i;

export function stripActionBlock(content: string): string {
  return content.replace(ACTION_BLOCK, "").trim();
}

export function parseAssistantActions(content: string): AssistantAction[] {
  const match = content.match(ACTION_BLOCK);
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1].trim()) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeAction)
      .filter((a): a is AssistantAction => a !== null);
  } catch {
    return [];
  }
}

function normalizePriority(value: unknown): TaskPriority {
  if (value === "high" || value === "low" || value === "medium") return value;
  return "medium";
}

function normalizeAction(raw: unknown): AssistantAction | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const type = item.type;

  switch (type) {
    case "create_task": {
      if (typeof item.title !== "string" || !item.title.trim()) return null;
      return {
        type: "create_task",
        title: item.title.trim(),
        priority: normalizePriority(item.priority),
        dueDate: typeof item.dueDate === "string" ? item.dueDate : undefined,
        notes: typeof item.notes === "string" ? item.notes : undefined,
      };
    }
    case "complete_task": {
      if (typeof item.title !== "string" || !item.title.trim()) return null;
      return { type: "complete_task", title: item.title.trim() };
    }
    case "create_note": {
      if (typeof item.title !== "string" || !item.title.trim()) return null;
      if (typeof item.content !== "string") return null;
      const tags = Array.isArray(item.tags)
        ? item.tags.filter((t): t is string => typeof t === "string")
        : [];
      return {
        type: "create_note",
        title: item.title.trim(),
        content: item.content,
        tags,
      };
    }
    case "insight": {
      if (typeof item.label !== "string" || typeof item.value !== "string") return null;
      return {
        type: "insight",
        label: item.label.trim(),
        value: item.value.trim(),
        detail: typeof item.detail === "string" ? item.detail : undefined,
      };
    }
    default:
      return null;
  }
}

/** Lightweight offline assistant when no API key is configured */
export function generateOfflineReply(
  userMessage: string,
  context: { openTaskCount: number; noteCount: number; userName: string }
): { content: string; actions: AssistantAction[] } {
  const text = userMessage.trim();
  const lower = text.toLowerCase();
  const name = context.userName || "there";
  const actions: AssistantAction[] = [];

  if (
    /brain.?dump|capture|remind me|add (a )?task|todo|to-do|create (a )?task/i.test(
      lower
    )
  ) {
    const lines = text
      .split(/[\n,;]+/)
      .map((l) => l.replace(/^(please |can you |add |create |remind me to )/i, "").trim())
      .filter((l) => l.length > 3 && !/brain.?dump|help me sort/i.test(l));

    const titles = lines.slice(0, 5).length
      ? lines.slice(0, 5)
      : ["Clarify top priority for today"];

    titles.forEach((title, i) => {
      actions.push({
        type: "create_task",
        title: title.slice(0, 120),
        priority: i === 0 ? "high" : "medium",
      });
    });

    actions.push({
      type: "insight",
      label: "Capture mode",
      value: `${titles.length} items filed`,
      detail: "Turned your dump into scannable tasks",
    });

    const content = `Got it, ${name}. I pulled **${titles.length}** actionable item${titles.length === 1 ? "" : "s"} out of that dump and queued them in Tasks.

**Next move**
1. Mark the first one as your focus for the next 25 minutes
2. Park the rest until that focus block ends
3. Tell me what still feels fuzzy and I’ll refine priorities

Add an OpenAI-compatible API key in Settings for richer, context-aware planning.`;

    return { content, actions };
  }

  if (/daily brief|brief me|good morning|start (my )?day/i.test(lower)) {
    actions.push({
      type: "insight",
      label: "Focus signal",
      value: context.openTaskCount ? `${context.openTaskCount} open` : "Clear board",
      detail: "Protect one deep-work block before noon",
    });

    const content = `Here’s your **daily brief**, ${name}.

### Top 3 priorities
1. ${context.openTaskCount ? "Knock out your highest-priority open task first" : "Define one outcome that would make today a win"}
2. Clear one bottleneck (decision, waiting, or unclear next step)
3. Capture stray thoughts into Tasks/Notes so they stop taxing attention

### Suggested focus blocks
- **0:00–0:50** — Deep work on priority #1 (notifications off)
- **0:50–1:00** — Break + quick capture
- **1:00–1:40** — Communications & admin batch
- **1:40–2:00** — Review & set tomorrow’s first move

You have **${context.openTaskCount}** open tasks and **${context.noteCount}** notes. Want me to turn this into concrete tasks?`;

    return { content, actions };
  }

  if (/stuck|bottleneck|overwhelm|spinning|unstick/i.test(lower)) {
    actions.push({
      type: "create_note",
      title: "Bottleneck diagnosis",
      content:
        "Questions: What is the single outcome that matters most in the next 2 hours? What is blocking it — clarity, energy, waiting, or tools? What can be dropped or delegated?",
      tags: ["review", "focus"],
    });

    const content = `Let’s unstick this fast.

**3 diagnostic questions**
1. If you only finished **one** thing in the next 2 hours, what must it be?
2. What’s actually blocking it — unclear next step, waiting on someone, energy, or tools?
3. What are you doing *instead* that feels productive but isn’t?

**Recovery plan**
1. Name the one outcome out loud
2. Write the *next physical action* (opens a doc, sends a message, drafts an outline)
3. Set a 25-minute timer and protect it
4. Afterward, capture leftovers as tasks — don’t keep them in your head

Reply with your answers and I’ll build the exact task list.`;

    return { content, actions };
  }

  if (/plan (my |the )?week|weekly/i.test(lower)) {
    const themes = [
      "Ship / create",
      "Deep problem-solving",
      "People & coordination",
      "Admin & ops",
      "Learning & review",
    ];
    themes.forEach((theme, i) => {
      actions.push({
        type: "create_task",
        title: `Week theme — Day ${i + 1}: ${theme}`,
        priority: i < 2 ? "high" : "medium",
      });
    });

    const content = `Here’s a **week skeleton** you can actually stick to:

| Day | Theme | Guardrail |
|---|---|---|
| Mon | Ship / create | One deliverable before noon |
| Tue | Deep problem-solving | 2× 50-min focus blocks |
| Wed | People & coordination | Batch meetings; async first |
| Thu | Admin & ops | Clear queues; no new big starts |
| Fri | Learning & review | Weekly review + next-week commits |

I created 5 theme tasks. Tell me your real deadlines and I’ll rewrite this around them.`;

    return { content, actions };
  }

  // Default helpful reply
  const content = `I’m **Vela**, your workflow co-pilot.

I can help you:
- Turn messy thoughts into **tasks** and **notes**
- Run a **daily brief** or **weekly review**
- Diagnose **bottlenecks** and rebuild momentum
- Draft messages, plans, and checklists

Try a quick prompt on the left, or just talk naturally — e.g. *“I need to prep for Friday’s client call and stop checking email every 10 minutes.”*

${context.openTaskCount || context.noteCount ? `Workspace pulse: **${context.openTaskCount}** open tasks · **${context.noteCount}** notes.` : "Your workspace is empty — perfect time for a brain dump."}

> For full AI depth, add an OpenAI-compatible API key in **Settings** (OpenAI, Groq, OpenRouter, etc.). Offline mode still captures tasks and structure.`;

  return { content, actions };
}
