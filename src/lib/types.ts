export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  actions?: AssistantAction[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: number;
  updatedAt: number;
  sourceMessageId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  sourceMessageId?: string;
}

export interface Insight {
  id: string;
  label: string;
  value: string;
  detail?: string;
  createdAt: number;
}

export type AssistantAction =
  | { type: "create_task"; title: string; priority?: TaskPriority; dueDate?: string; notes?: string }
  | { type: "complete_task"; title: string }
  | { type: "create_note"; title: string; content: string; tags?: string[] }
  | { type: "insight"; label: string; value: string; detail?: string };

export type PanelId = "chat" | "tasks" | "knowledge" | "insights";

export interface Settings {
  apiKey: string;
  model: string;
  baseUrl: string;
  userName: string;
  focusAreas: string;
}

export interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  tasks: Task[];
  notes: Note[];
  insights: Insight[];
  settings: Settings;
  activePanel: PanelId;
  sidebarOpen: boolean;
}
