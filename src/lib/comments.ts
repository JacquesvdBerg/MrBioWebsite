import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const commentKinds = ["Voorstel", "Vraag", "Gedagte", "Lof", "Fout gevind"] as const;

export type CommentKind = (typeof commentKinds)[number];

export const commentStatuses = ["pending", "approved", "rejected"] as const;

export type CommentStatus = (typeof commentStatuses)[number];

export type CommentAuthorRole = "visitor" | "teacher";

export type SiteComment = {
  id: string;
  authorName: string;
  kind: CommentKind;
  body: string;
  grade: number | null;
  audience: "ander" | null;
  status: CommentStatus;
  createdAt: string;
  parentId: string | null;
  authorRole: CommentAuthorRole;
};

export type ThreadedComment = SiteComment & { replies: SiteComment[] };

type CommentRow = {
  id: string;
  author_name: string;
  kind: string;
  body: string;
  grade: number | null;
  audience: string | null;
  status: string;
  created_at: string;
  parent_id: string | null;
  author_role: string | null;
};

const columns =
  "id, author_name, kind, body, grade, audience, status, created_at, parent_id, author_role";

const commentAccents = ["#b8f542", "#5ad1ff", "#ffc857", "#9d8cff", "#ff6a4d"] as const;

export function isCommentKind(value: string): value is CommentKind {
  return commentKinds.some((kind) => kind === value);
}

function toCommentKind(value: string): CommentKind {
  return isCommentKind(value) ? value : "Gedagte";
}

export function toCommentStatus(value: string): CommentStatus {
  return commentStatuses.find((status) => status === value) ?? "pending";
}

function toComment(row: CommentRow): SiteComment {
  return {
    id: row.id,
    authorName: row.author_name,
    kind: toCommentKind(row.kind),
    body: row.body,
    grade: row.grade,
    audience: row.audience === "ander" ? "ander" : null,
    status: toCommentStatus(row.status),
    createdAt: row.created_at,
    parentId: row.parent_id,
    authorRole: row.author_role === "teacher" ? "teacher" : "visitor",
  };
}

export function threadComments(comments: SiteComment[]): ThreadedComment[] {
  const replies = new Map<string, SiteComment[]>();
  const roots: SiteComment[] = [];

  for (const comment of comments) {
    if (!comment.parentId) {
      roots.push(comment);
      continue;
    }

    const list = replies.get(comment.parentId);
    if (list) {
      list.push(comment);
    } else {
      replies.set(comment.parentId, [comment]);
    }
  }

  return roots.map((root) => ({
    ...root,
    replies: (replies.get(root.id) ?? []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));
}

export function commentStatusLabel(status: CommentStatus) {
  switch (status) {
    case "pending":
      return "Hangend";
    case "approved":
      return "Goedgekeur";
    case "rejected":
      return "Afgekeur";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function commentStatusTone(status: CommentStatus) {
  switch (status) {
    case "pending":
      return "wait" as const;
    case "approved":
      return "live" as const;
    case "rejected":
      return "draft" as const;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function commentAccent(kind: CommentKind) {
  const index = commentKinds.indexOf(kind);
  return commentAccents[index] ?? commentAccents[0];
}

export function commentAuthorLine(comment: Pick<SiteComment, "authorName" | "grade" | "audience">) {
  if (comment.audience === "ander") {
    return `${comment.authorName} · Ander`;
  }
  return comment.grade ? `${comment.authorName} · Gr. ${comment.grade}` : comment.authorName;
}

export async function getApprovedComments(): Promise<SiteComment[]> {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("comments")
    .select(columns)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<CommentRow[]>();

  if (error) {
    console.error("Failed to load comments:", error.message);
    return [];
  }

  return data.map(toComment);
}

export async function getAllComments(): Promise<SiteComment[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select(columns)
    .order("created_at", { ascending: false })
    .returns<CommentRow[]>();

  if (error) {
    console.error("Failed to load comments:", error.message);
    return [];
  }

  return data.map(toComment);
}

export async function countCommentsByStatus(status: CommentStatus) {
  const supabase = await createServerClient();
  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    console.error("Failed to count comments:", error.message);
    return 0;
  }

  return count ?? 0;
}