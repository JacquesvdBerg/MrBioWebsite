import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { johannesburgDate } from "@/lib/dates";
import { isGrade, type Grade } from "@/lib/site";
import { lifeScienceTopics, termOf } from "@/lib/syllabus";

export type ActivityTopic = {
  id: string;
  grade: Grade;
  title: string;
  notes: string;
  themeSlug: string | null;
  sortOrder: number;
  isActive: boolean;
  lastUsedOn: string | null;
};

type TopicRow = {
  id: string;
  grade: number;
  title: string;
  notes: string | null;
  theme_slug: string | null;
  sort_order: number;
  is_active: boolean;
  last_used_on: string | null;
};

function toTopic(row: TopicRow): ActivityTopic {
  return {
    id: row.id,
    grade: row.grade as Grade,
    title: row.title,
    notes: row.notes ?? "",
    themeSlug: row.theme_slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    lastUsedOn: row.last_used_on,
  };
}

export async function getAllTopics() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_topics")
    .select(
      "id, grade, title, notes, theme_slug, sort_order, is_active, last_used_on",
    )
    .order("grade", { ascending: true })
    .order("sort_order", { ascending: true })
    .returns<TopicRow[]>();

  if (error || !data) {
    console.error("Kon nie onderwerpe laai nie:", error?.message);
    return [];
  }

  return data.map(toTopic);
}

/**
 * The active topic used longest ago, preferring this quarter's topics so the
 * games follow the classroom. Quarters without topics of their own (revision,
 * or Gr 8 and 9 outside biology) rotate through the whole year.
 */
export async function pickNextTopic(grade: number, date = johannesburgDate()) {
  const supabase = createServiceClient() ?? (await createClient());
  const { data, error } = await supabase
    .from("activity_topics")
    .select(
      "id, grade, title, notes, theme_slug, sort_order, is_active, last_used_on",
    )
    .eq("grade", grade)
    .eq("is_active", true)
    .order("last_used_on", { ascending: true, nullsFirst: true })
    .order("sort_order", { ascending: true })
    .returns<TopicRow[]>();

  if (error || !data || data.length === 0) {
    return null;
  }

  const term = termOf(date);
  const thisTerm = new Set(
    isGrade(grade) ? lifeScienceTopics(grade).filter((topic) => topic.term === term).map((topic) => topic.title) : [],
  );
  const topics = data.map(toTopic);
  return topics.find((topic) => thisTerm.has(topic.title)) ?? topics[0];
}
