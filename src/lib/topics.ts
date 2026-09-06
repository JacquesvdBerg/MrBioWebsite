import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Grade } from "@/lib/site";

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

export async function pickNextTopic(grade: number) {
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
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toTopic(data as TopicRow);
}
