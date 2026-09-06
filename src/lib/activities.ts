import "server-only";
import { parseQuizPayload, type QuizPayload } from "@/lib/quiz";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { ActivitySlug } from "@/lib/site";
import { parseCrosswordPayload, type CrosswordPayload } from "@/lib/crossword";
import { parseDiagramPayload, type DiagramPayload } from "@/lib/diagram";
import { parsePairsPayload, type PairsPayload } from "@/lib/pairs";
import {
  parsePutInOrderPayload,
  type PutInOrderPayload,
} from "@/lib/put-in-order";
import { parseSortingPayload, type SortingPayload } from "@/lib/sorting";
import {
  parseTrueOrFalsePayload,
  type TrueOrFalsePayload,
} from "@/lib/true-or-false";
import {
  parseWordSearchPayload,
  type WordSearchPayload,
} from "@/lib/word-search";

export type ActivityRecord = {
  id: string;
  kind: ActivitySlug;
  slug: string;
  title: string;
  description: string;
  grade: number | null;
  topic: string;
  themeSlug: string | null;
  sortOrder: number;
  isPublished: boolean;
  payload: unknown;
  source: "manual" | "ai-daily";
  playOn: string | null;
  topicId: string | null;
};

type ActivityRow = {
  id: string;
  kind: ActivitySlug;
  slug: string;
  title: string;
  description: string | null;
  grade: number | null;
  topic: string | null;
  theme_slug: string | null;
  sort_order: number;
  is_published: boolean;
  payload: unknown;
  source: "manual" | "ai-daily" | null;
  play_on: string | null;
  topic_id: string | null;
};

const columns =
  "id, kind, slug, title, description, grade, topic, theme_slug, sort_order, is_published, payload, source, play_on, topic_id";

function toActivity(row: ActivityRow): ActivityRecord {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    grade: row.grade,
    topic: row.topic ?? "",
    themeSlug: row.theme_slug,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    payload: row.payload,
    source: row.source === "ai-daily" ? "ai-daily" : "manual",
    playOn: row.play_on,
    topicId: row.topic_id,
  };
}

export type QuizActivity = ActivityRecord & {
  kind: "quiz";
  quiz: QuizPayload;
};

export function asQuiz(activity: ActivityRecord): QuizActivity | null {
  if (activity.kind !== "quiz") {
    return null;
  }

  return {
    ...activity,
    kind: "quiz",
    quiz: parseQuizPayload(activity.payload),
  };
}

export type TrueOrFalseActivity = ActivityRecord & {
  kind: "true-or-false";
  quiz: TrueOrFalsePayload;
};

export function asTrueOrFalse(
  activity: ActivityRecord,
): TrueOrFalseActivity | null {
  if (activity.kind !== "true-or-false") {
    return null;
  }

  return {
    ...activity,
    kind: "true-or-false",
    quiz: parseTrueOrFalsePayload(activity.payload),
  };
}

export function asSpeedQuiz(activity: ActivityRecord) {
  if (activity.kind !== "speed-quiz") {
    return null;
  }
  return {
    ...activity,
    kind: "speed-quiz" as const,
    quiz: parseQuizPayload(activity.payload),
  };
}

export function asWordSearch(activity: ActivityRecord) {
  if (activity.kind !== "word-search") {
    return null;
  }
  return {
    ...activity,
    kind: "word-search" as const,
    game: parseWordSearchPayload(activity.payload),
  };
}

export function asCrossword(activity: ActivityRecord) {
  if (activity.kind !== "crossword") {
    return null;
  }
  return {
    ...activity,
    kind: "crossword" as const,
    game: parseCrosswordPayload(activity.payload) as CrosswordPayload,
  };
}

export function asPairs(activity: ActivityRecord) {
  if (activity.kind !== "match-the-pairs" && activity.kind !== "memory-cards") {
    return null;
  }
  return {
    ...activity,
    kind: activity.kind,
    game: parsePairsPayload(activity.payload) as PairsPayload,
  };
}

export function asPutInOrder(activity: ActivityRecord) {
  if (activity.kind !== "put-in-order") {
    return null;
  }
  return {
    ...activity,
    kind: "put-in-order" as const,
    game: parsePutInOrderPayload(activity.payload) as PutInOrderPayload,
  };
}

export function asDiagram(activity: ActivityRecord) {
  if (activity.kind !== "diagram") {
    return null;
  }
  return {
    ...activity,
    kind: "diagram" as const,
    game: parseDiagramPayload(activity.payload) as DiagramPayload,
  };
}

export function asSorting(activity: ActivityRecord) {
  if (activity.kind !== "sorting") {
    return null;
  }
  return {
    ...activity,
    kind: "sorting" as const,
    game: parseSortingPayload(activity.payload) as SortingPayload,
  };
}

export function activityItemCount(activity: ActivityRecord) {
  switch (activity.kind) {
    case "quiz":
      return asQuiz(activity)?.quiz.questions.length ?? 0;
    case "true-or-false":
      return asTrueOrFalse(activity)?.quiz.questions.length ?? 0;
    case "speed-quiz":
      return asSpeedQuiz(activity)?.quiz.questions.length ?? 0;
    case "word-search":
      return asWordSearch(activity)?.game.words.length ?? 0;
    case "crossword":
      return asCrossword(activity)?.game.entries.length ?? 0;
    case "match-the-pairs":
    case "memory-cards":
      return asPairs(activity)?.game.pairs.length ?? 0;
    case "put-in-order":
      return asPutInOrder(activity)?.game.items.length ?? 0;
    case "diagram":
      return asDiagram(activity)?.game.parts.length ?? 0;
    case "sorting":
      return asSorting(activity)?.game.items.length ?? 0;
    default: {
      const _exhaustive: never = activity.kind;
      return _exhaustive;
    }
  }
}

export async function getPublishedActivities(kind: ActivitySlug) {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("kind", kind)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .returns<ActivityRow[]>();

  if (error || !data) {
    console.error("Failed to load activities:", error?.message);
    return [];
  }

  return data.map(toActivity);
}

export async function getAllPublishedActivities() {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("is_published", true)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .returns<ActivityRow[]>();

  if (error || !data) {
    console.error("Failed to load activities:", error?.message);
    return [];
  }

  return data.map(toActivity);
}

export async function getPublishedActivitiesByGrade(grade: number) {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("is_published", true)
    .eq("grade", grade)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .returns<ActivityRow[]>();

  if (error || !data) {
    console.error("Failed to load activities:", error?.message);
    return [];
  }

  return data.map(toActivity);
}

export function activityPlayHref(activity: ActivityRecord) {
  switch (activity.kind) {
    case "quiz":
    case "true-or-false":
    case "word-search":
    case "crossword":
    case "match-the-pairs":
    case "put-in-order":
    case "diagram":
    case "memory-cards":
    case "sorting":
    case "speed-quiz":
      return `/play-and-learn/${activity.kind}/${activity.slug}`;
    default: {
      const _exhaustive: never = activity.kind;
      return _exhaustive;
    }
  }
}

export function isLiveActivityKind(kind: ActivitySlug) {
  switch (kind) {
    case "quiz":
    case "true-or-false":
    case "word-search":
    case "crossword":
    case "match-the-pairs":
    case "put-in-order":
    case "diagram":
    case "memory-cards":
    case "sorting":
    case "speed-quiz":
      return true;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export async function getPublishedActivitiesByGradeAndKind(
  grade: number,
  kind: ActivitySlug,
) {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("is_published", true)
    .eq("grade", grade)
    .eq("kind", kind)
    .order("sort_order", { ascending: true })
    .returns<ActivityRow[]>();

  if (error || !data) {
    console.error("Failed to load activities:", error?.message);
    return [];
  }

  return data.map(toActivity);
}

export async function getPublishedActivity(kind: ActivitySlug, slug: string) {
  const supabase = createAnonClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("kind", kind)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toActivity(data as ActivityRow);
}

export async function getAllActivities() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .returns<ActivityRow[]>();

  if (error || !data) {
    console.error("Failed to load activities:", error?.message);
    return [];
  }

  return data.map(toActivity);
}

export async function getAdminActivity(kind: ActivitySlug, slug: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toActivity(data as ActivityRow);
}

export async function getDailyActivity(
  grade: number,
  playOn: string,
  kind: ActivitySlug,
) {
  const supabase = createAnonClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("kind", kind)
    .eq("source", "ai-daily")
    .eq("grade", grade)
    .eq("play_on", playOn)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toActivity(data as ActivityRow);
}

export async function getDailyArchive(
  grade: number,
  before: string,
  kind: ActivitySlug,
) {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("activities")
    .select(columns)
    .eq("kind", kind)
    .eq("source", "ai-daily")
    .eq("grade", grade)
    .eq("is_published", true)
    .lt("play_on", before)
    .order("play_on", { ascending: false })
    .returns<ActivityRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(toActivity);
}
