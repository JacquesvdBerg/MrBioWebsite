import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { slugify } from "@/lib/slug";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const commentKinds = ["Voorstel", "Vraag", "Gedagte", "Lof", "Fout gevind"] as const;

export type CommentKind = (typeof commentKinds)[number];

/** Articles about the subject: written by the teacher, or shared by visitors with a link. */
export const articleKind = "Artikel" as const;

export type PostKind = CommentKind | typeof articleKind;

export const commentStatuses = ["pending", "approved", "rejected"] as const;

export type CommentStatus = (typeof commentStatuses)[number];

export type CommentAuthorRole = "visitor" | "teacher";

export type SiteComment = {
  id: string;
  authorName: string;
  kind: PostKind;
  body: string;
  grade: number | null;
  audience: "ander" | null;
  status: CommentStatus;
  createdAt: string;
  parentId: string | null;
  authorRole: CommentAuthorRole;
  /** Article fields; empty on ordinary posts. */
  title: string | null;
  linkUrl: string | null;
  imagePath: string | null;
  slug: string | null;
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
  title?: string | null;
  link_url?: string | null;
  image_path?: string | null;
  slug?: string | null;
};

// Every column, so the forum keeps working on a database that does not have
// the article columns yet.
const columns = "*";

const commentAccents = ["#b8f542", "#5ad1ff", "#ffc857", "#9d8cff", "#ff6a4d"] as const;

export function isCommentKind(value: string): value is CommentKind {
  return commentKinds.some((kind) => kind === value);
}

function toCommentKind(value: string): PostKind {
  return value === articleKind ? articleKind : isCommentKind(value) ? value : "Gedagte";
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
    title: row.title ?? null,
    linkUrl: row.link_url ?? null,
    imagePath: row.image_path ?? null,
    slug: row.slug ?? null,
  };
}

export function isArticle(comment: Pick<SiteComment, "kind" | "slug">) {
  return comment.kind === articleKind && Boolean(comment.slug);
}

export function articlePath(slug: string) {
  return `/comments/${slug}`;
}

export function articleExcerpt(body: string, length = 180) {
  const text = body
    .replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)\]]/g, (url) => linkHost(url))
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length - 1).replace(/\s+\S*$/, "")}…` : text;
}

/** Only plain web links: no javascript:, mailto: or bare text. */
export function isWebLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function linkHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

/** A readable address from the title, with a short tail so two articles never clash. */
export function articleSlug(title: string) {
  let base = "";
  for (const word of slugify(title).split("-")) {
    if (`${base}-${word}`.length > 60) {
      break;
    }
    base = base ? `${base}-${word}` : word;
  }
  return `${base || "artikel"}-${Math.random().toString(36).slice(2, 6)}`;
}

/** A missing column means the forum-articles migration has not run yet. */
export function isMissingArticleColumn(error: { code?: string; message?: string } | null) {
  return Boolean(error && (error.code === "PGRST204" || error.code === "42703" || /column/i.test(error.message ?? "")));
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

export function commentAccent(kind: PostKind) {
  const index = commentKinds.indexOf(kind as CommentKind);
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

/** One approved article with its approved replies, for the article page. */
export async function getApprovedArticle(slug: string): Promise<ThreadedComment | null> {
  const supabase = createAnonClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("comments")
    .select(columns)
    .eq("slug", slug)
    .eq("kind", articleKind)
    .eq("status", "approved")
    .maybeSingle<CommentRow>();

  if (error || !data) {
    return null;
  }

  const { data: replies } = await supabase
    .from("comments")
    .select(columns)
    .eq("parent_id", data.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .returns<CommentRow[]>();

  return { ...toComment(data), replies: (replies ?? []).map(toComment) };
}
