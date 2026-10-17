# Vela — AI Personal Assistant (ai-assistant-chatbot)

Vela is an AI-powered personal assistant that helps you streamline daily workflows, manage information, and clear productive bottlenecks through natural conversation.

## Features

- **Conversational productivity** — plan days, unstick bottlenecks, draft messages, run reviews
- **Streaming chat** — fast, markdown-rich replies with OpenAI-compatible models
- **Smart actions** — auto-creates tasks, notes, and insights from conversation
- **Workspace panels** — Tasks, Knowledge vault, and Insight signals
- **Quick flows** — Daily brief, brain dump, weekly plan, and more
- **Offline capture mode** — still useful without an API key
- **Persistent local workspace** — chats, tasks, and notes saved in your browser
- **Bring your own key** — OpenAI, Groq, OpenRouter, or any OpenAI-compatible endpoint

## Screenshots

### AI chat: a 4-week revision plan from one message
![Vela chat](docs/screenshots/chat.png)

### Tasks created automatically from the conversation
![Vela tasks](docs/screenshots/tasks.png)

### Knowledge vault: notes saved by the assistant
![Vela knowledge vault](docs/screenshots/knowledge.png)

### Insights: live workspace stats and focus signals
![Vela insights](docs/screenshots/insights.png)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Connect a model

1. Open **Settings & API** in the sidebar, or
2. Copy `.env.example` → `.env.local` and set:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

For Groq:

```env
OPENAI_API_KEY=gsk_...
OPENAI_MODEL=llama-3.3-70b-versatile
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand (persisted workspace)
- OpenAI-compatible chat completions (streaming)

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm run start` | Run production server  |

## Security notes

- Keys entered in **Settings** are stored in your browser's `localStorage`. Use this only on your own device.
- For a public deployment (for example Vercel), set `OPENAI_API_KEY` as a **server-side environment variable** and leave the Settings key empty.
- Never commit `.env` or `.env.local`. They are already listed in `.gitignore`.

## How it works

1. You send a message in natural language.
2. `/api/chat` forwards it, with your tasks and notes as context, to an OpenAI-compatible model and streams the reply.
3. The model can append a hidden `vela-actions` JSON block. The app parses it and creates tasks, notes, and insights automatically.
4. With no API key, a lightweight offline mode still captures tasks and plans.