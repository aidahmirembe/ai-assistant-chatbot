import { NextRequest } from "next/server";
import { VELA_SYSTEM_PROMPT, buildUserContext } from "@/lib/prompts";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

interface ChatBody {
  messages: ChatMessage[];
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  context?: {
    userName?: string;
    focusAreas?: string;
    openTasks?: { title: string; priority: string; status: string }[];
    recentNotes?: { title: string }[];
  };
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // If the visitor pasted their own key in Settings, use their key/model/URL.
  // Otherwise use the server's environment variables (for a deployed demo),
  // and ignore the client's default model/base URL so they cannot clash.
  const clientKey = body.apiKey?.trim() || "";
  const useServerConfig = !clientKey;

  const apiKey = useServerConfig ? process.env.OPENAI_API_KEY || "" : clientKey;
  const model = useServerConfig
    ? process.env.OPENAI_MODEL || "gpt-4o-mini"
    : body.model?.trim() || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = (
    useServerConfig
      ? process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
      : body.baseUrl?.trim() || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  if (!apiKey) {
    return Response.json(
      {
        error: "NO_API_KEY",
        message:
          "No API key configured. Add one in Settings or set OPENAI_API_KEY in .env.local.",
      },
      { status: 401 }
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 });
  }

  const contextBlock = buildUserContext({
    userName: body.context?.userName || "",
    focusAreas: body.context?.focusAreas || "",
    openTasks: body.context?.openTasks || [],
    recentNotes: body.context?.recentNotes || [],
  });

  const systemContent = VELA_SYSTEM_PROMPT + contextBlock;

  const payload = {
    model,
    stream: true,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemContent },
      ...body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return Response.json(
      {
        error: "UPSTREAM_UNREACHABLE",
        message: err instanceof Error ? err.message : "Failed to reach model provider",
      },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");

    // The provider rejected the key. Report it clearly instead of reusing
    // status 401, which the client treats as "no key configured".
    if (upstream.status === 401 || upstream.status === 403) {
      return Response.json(
        {
          error: "INVALID_API_KEY",
          message:
            "The model provider rejected your API key. Check the key, model, and base URL in Settings.",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error: "UPSTREAM_ERROR",
        message: detail || `Provider returned ${upstream.status}`,
      },
      { status: upstream.status || 502 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const token = json.choices?.[0]?.delta?.content;
              if (token) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: token })}\n\n`)
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}