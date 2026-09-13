import "server-only";
import type { BioArtKind } from "@/components/bio-art";
import type { VisualTone } from "@/components/visual";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { toBioArtKind, toVisualTone } from "@/lib/visual-tone";

export const weeklyFactStatuses = ["draft", "approved", "published"] as const;

export type WeeklyFactStatus = (typeof weeklyFactStatuses)[number];

export const weeklyFactCategories = [
  "Selle & weefsel",
  "Genetika",
  "Plante",
  "Menslike liggaam",
  "Mikro-organismes",
  "Ekologie",
  "Senuweestelsel",
  "Chemie van lewe",
] as const;

export type WeeklyFact = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  grade: number;
  weekLabel: string;
  weekStart: string | null;
  tone: VisualTone;
  art: BioArtKind;
  imagePath: string | null;
  status: WeeklyFactStatus;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
};

type WeeklyFactRow = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  category: string | null;
  grade: number;
  week_label: string | null;
  week_start: string | null;
  tone: string;
  art: string;
  image_path: string | null;
  status: string;
  sort_order: number;
  published_at: string | null;
  created_at: string;
};

const columns =
  "id, slug, title, body, category, grade, week_label, week_start, tone, art, image_path, status, sort_order, published_at, created_at";

function toStatus(value: string): WeeklyFactStatus {
  return weeklyFactStatuses.find((status) => status === value) ?? "draft";
}

function toFact(row: WeeklyFactRow): WeeklyFact {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body ?? "",
    category: row.category ?? "",
    grade: row.grade,
    weekLabel: row.week_label ?? "",
    weekStart: row.week_start,
    tone: toVisualTone(row.tone),
    art: toBioArtKind(row.art),
    imagePath: row.image_path,
    status: toStatus(row.status),
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

export function weeklyFactStatusLabel(status: WeeklyFactStatus) {
  switch (status) {
    case "draft":
      return "Konsep";
    case "approved":
      return "Goedgekeur";
    case "published":
      return "Live";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function weeklyFactStatusTone(status: WeeklyFactStatus) {
  switch (status) {
    case "draft":
      return "draft" as const;
    case "approved":
      return "wait" as const;
    case "published":
      return "live" as const;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function byNewest(a: WeeklyFact, b: WeeklyFact) {
  const aKey = a.publishedAt ?? a.weekStart ?? a.createdAt;
  const bKey = b.publishedAt ?? b.weekStart ?? b.createdAt;
  return bKey.localeCompare(aKey);
}

export async function getPublishedWeeklyFacts(): Promise<WeeklyFact[]> {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("weekly_facts")
    .select(columns)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("week_start", { ascending: false, nullsFirst: false })
    .returns<WeeklyFactRow[]>();

  if (error) {
    console.error("Failed to load weekly facts:", error.message);
    return [];
  }

  return data.map(toFact).sort(byNewest);
}

export async function getAllWeeklyFacts(): Promise<WeeklyFact[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("weekly_facts")
    .select(columns)
    .order("created_at", { ascending: false })
    .returns<WeeklyFactRow[]>();

  if (error) {
    console.error("Failed to load weekly facts:", error.message);
    return [];
  }

  return data.map(toFact);
}

export async function getAdminWeeklyFact(slug: string): Promise<WeeklyFact | null> {
  const facts = await getAllWeeklyFacts();
  return facts.find((fact) => fact.slug === slug) ?? null;
}