import "server-only";
import type { VisualTone } from "@/components/visual";
import { imageFiles } from "@/lib/image-files";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  defaultThemePage,
  parseThemePage,
  type ThemePageContent,
} from "@/lib/theme-page";

export function themePath(slug: string) {
  return `/tema/${slug}`;
}

export type Theme = {
  slug: string;
  title: string;
  blurb: string;
  href: string;
  tone: VisualTone;
  file: string | null;
  page: ThemePageContent;
};

export type AdminTheme = Theme & {
  sortOrder: number;
  isPublished: boolean;
};

const columns =
  "slug, title, blurb, href, tone, image_path, sort_order, is_published, page";

type ThemeRow = {
  slug: string;
  title: string;
  blurb: string | null;
  href: string;
  tone: string;
  image_path: string | null;
  sort_order: number;
  is_published: boolean;
  page: unknown;
};

const tones: readonly VisualTone[] = [
  "green",
  "teal",
  "blue",
  "purple",
  "orange",
  "navy",
];

function toTone(value: string): VisualTone {
  return tones.find((tone) => tone === value) ?? "navy";
}

function toTheme(row: ThemeRow): Theme {
  const title = row.title;
  const blurb = row.blurb ?? "";

  return {
    slug: row.slug,
    title,
    blurb,
    href: themePath(row.slug),
    tone: toTone(row.tone),
    file: row.image_path,
    page: parseThemePage(row.page, { title, blurb }),
  };
}

// Shown when Supabase is not configured yet, or if the query fails, so the
// homepage never renders an empty theme section.
export const fallbackThemes: Theme[] = [
  {
    slug: "genetika",
    title: "Genetika",
    blurb: "DNA, oorerwing en genetiese kruisings.",
    href: themePath("genetika"),
    tone: "green",
    file: imageFiles.home.genetika,
    page: defaultThemePage({
      title: "Genetika",
      blurb: "DNA, oorerwing en genetiese kruisings.",
    }),
  },
  {
    slug: "selle-en-weefsel",
    title: "Selle & weefsel",
    blurb: "Selstruktuur, organelle en selverdeling.",
    href: themePath("selle-en-weefsel"),
    tone: "teal",
    file: imageFiles.home.lewenswetenskappe,
    page: defaultThemePage({
      title: "Selle & weefsel",
      blurb: "Selstruktuur, organelle en selverdeling.",
    }),
  },
  {
    slug: "ekosisteme",
    title: "Ekosisteme",
    blurb: "Voedselwebbe, siklusse en volhoubaarheid.",
    href: themePath("ekosisteme"),
    tone: "blue",
    file: imageFiles.home.ekosisteme,
    page: defaultThemePage({
      title: "Ekosisteme",
      blurb: "Voedselwebbe, siklusse en volhoubaarheid.",
    }),
  },
  {
    slug: "mikro-organismes",
    title: "Mikro-organismes",
    blurb: "Bakterieë, virusse en immuniteit.",
    href: themePath("mikro-organismes"),
    tone: "purple",
    file: imageFiles.home.mikroorganismes,
    page: defaultThemePage({
      title: "Mikro-organismes",
      blurb: "Bakterieë, virusse en immuniteit.",
    }),
  },
  {
    slug: "menslike-liggaam",
    title: "Menslike liggaam",
    blurb: "Stelsels, organe en homeostase.",
    href: themePath("menslike-liggaam"),
    tone: "orange",
    file: imageFiles.home.menslikeLiggaam,
    page: defaultThemePage({
      title: "Menslike liggaam",
      blurb: "Stelsels, organe en homeostase.",
    }),
  },
];

export async function getPublishedThemes(): Promise<Theme[]> {
  const supabase = createAnonClient();

  if (!supabase) {
    return fallbackThemes;
  }

  const { data, error } = await supabase
    .from("themes")
    .select(columns)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .returns<ThemeRow[]>();

  if (error) {
    console.error("Kon nie temas laai nie:", error.message);
    return fallbackThemes;
  }

  if (data.length === 0) {
    return fallbackThemes;
  }

  return data.map(toTheme);
}

export async function getAllThemes(): Promise<AdminTheme[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("themes")
    .select(columns)
    .order("sort_order", { ascending: true })
    .returns<ThemeRow[]>();

  if (error) {
    console.error("Kon nie temas laai nie:", error.message);
    return [];
  }

  return data.map((row) => ({
    ...toTheme(row),
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  }));
}

export async function getPublishedTheme(slug: string): Promise<Theme | null> {
  const themes = await getPublishedThemes();
  return themes.find((theme) => theme.slug === slug) ?? null;
}

export async function getAdminTheme(slug: string): Promise<AdminTheme | null> {
  const themes = await getAllThemes();
  return themes.find((theme) => theme.slug === slug) ?? null;
}
