import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const chatThreadStatuses = ["open", "closed"] as const;

export type ChatThreadStatus = (typeof chatThreadStatuses)[number];

export const chatSenders = ["learner", "admin"] as const;

export type ChatSender = (typeof chatSenders)[number];

export type ChatThread = {
  id: string;
  userId: string | null;
  learnerName: string;
  grade: number | null;
  topic: string;
  status: ChatThreadStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadForAdmin: boolean;
  unreadForLearner: boolean;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: ChatSender;
  body: string;
  createdAt: string;
};

type ThreadRow = {
  id: string;
  user_id: string | null;
  learner_name: string | null;
  grade: number | null;
  topic: string | null;
  status: string;
  last_message: string | null;
  last_message_at: string;
  unread_for_admin: boolean;
  unread_for_learner: boolean;
  created_at: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender: string;
  body: string;
  created_at: string;
};

const threadColumns =
  "id, user_id, learner_name, grade, topic, status, last_message, last_message_at, unread_for_admin, unread_for_learner, created_at";

const messageColumns = "id, thread_id, sender, body, created_at";

export function toChatThreadStatus(value: string): ChatThreadStatus {
  return value === "closed" ? "closed" : "open";
}

function toSender(value: string): ChatSender {
  return value === "admin" ? "admin" : "learner";
}

function toThread(row: ThreadRow): ChatThread {
  return {
    id: row.id,
    userId: row.user_id,
    learnerName: row.learner_name ?? "",
    grade: row.grade,
    topic: row.topic ?? "",
    status: toChatThreadStatus(row.status),
    lastMessage: row.last_message ?? "",
    lastMessageAt: row.last_message_at,
    unreadForAdmin: row.unread_for_admin,
    unreadForLearner: row.unread_for_learner,
    createdAt: row.created_at,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    sender: toSender(row.sender),
    body: row.body,
    createdAt: row.created_at,
  };
}

export function chatStatusLabel(status: ChatThreadStatus) {
  switch (status) {
    case "open":
      return "Oop";
    case "closed":
      return "Klaar";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function previewChat(body: string, max = 72) {
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}

export async function getAllChatThreads(): Promise<ChatThread[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select(threadColumns)
    .order("last_message_at", { ascending: false })
    .returns<ThreadRow[]>();

  if (error) {
    console.error("Failed to load chat threads:", error.message);
    return [];
  }

  return data.map(toThread);
}

export async function getLearnerChatThreads(userId: string): Promise<ChatThread[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select(threadColumns)
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false })
    .returns<ThreadRow[]>();

  if (error) {
    console.error("Failed to load learner chat threads:", error.message);
    return [];
  }

  return data.map(toThread);
}

export async function getChatThread(id: string): Promise<ChatThread | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select(threadColumns)
    .eq("id", id)
    .maybeSingle<ThreadRow>();

  if (error) {
    console.error("Failed to load chat thread:", error.message);
    return null;
  }

  return data ? toThread(data) : null;
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select(messageColumns)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  if (error) {
    console.error("Failed to load chat messages:", error.message);
    return [];
  }

  return data.map(toMessage);
}

export async function countUnreadChatThreads() {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("chat_threads")
    .select("id", { count: "exact", head: true })
    .eq("unread_for_admin", true)
    .eq("status", "open");

  if (error) {
    console.error("Failed to count unread chat:", error.message);
    return 0;
  }

  return count ?? 0;
}

export const getAdminChatThread = getChatThread;
export const getAdminChatMessages = getChatMessages;
