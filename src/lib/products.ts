import "server-only";
import type { VisualTone } from "@/components/visual";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { toVisualTone } from "@/lib/visual-tone";

export const productListingKinds = ["item", "bundle"] as const;

export type ProductListingKind = (typeof productListingKinds)[number];

export const productKindOptions = [
  "Opsommings",
  "Kernkaarte",
  "Skyfievertonings",
  "Notas",
  "Werkkaarte",
  "Volledige pak",
  "Eksamenpak",
  "Opsomming",
  "Bundel",
] as const;

/** Kinds sold per quarter with a full-year package, e.g. opsommings or kernkaarte. */
const summaryKinds = new Set(["Opsommings", "Kernkaarte", "Opsomming"]);
const slideKind = "Skyfievertonings";

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  listingKind: ProductListingKind;
  grade: number | null;
  price: number;
  wasPrice: number | null;
  bullets: string[];
  body: string;
  tone: VisualTone;
  badge: string | null;
  pages: number | null;
  imagePath: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  listing_kind: string;
  grade: number | null;
  price: number;
  was_price: number | null;
  bullets: string[] | null;
  body: string | null;
  tone: string;
  badge: string | null;
  pages: number | null;
  image_path: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
};

const columns =
  "id, slug, title, kind, listing_kind, grade, price, was_price, bullets, body, tone, badge, pages, image_path, is_published, is_featured, sort_order";

function toListingKind(value: string): ProductListingKind {
  return value === "bundle" ? "bundle" : "item";
}

function toProduct(row: ProductRow): ShopProduct {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    listingKind: toListingKind(row.listing_kind),
    grade: row.grade,
    price: row.price,
    wasPrice: row.was_price,
    bullets: row.bullets ?? [],
    body: row.body ?? "",
    tone: toVisualTone(row.tone),
    badge: row.badge,
    pages: row.pages,
    imagePath: row.image_path,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
  };
}

export async function getPublishedProducts(): Promise<ShopProduct[]> {
  const supabase = createAnonClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .returns<ProductRow[]>();

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }

  return data.map(toProduct);
}

export async function getPublishedCatalogue() {
  const products = await getPublishedProducts();
  return {
    items: products.filter((product) => product.listingKind === "item"),
    bundles: products.filter((product) => product.listingKind === "bundle"),
  };
}

export async function getFeaturedProducts(): Promise<ShopProduct[]> {
  const { items } = await getPublishedCatalogue();
  const featured = items.filter((product) => product.isFeatured);
  return (featured.length > 0 ? featured : items).slice(0, 3);
}

export async function getAllProducts(): Promise<ShopProduct[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .order("sort_order", { ascending: true })
    .returns<ProductRow[]>();

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }

  return data.map(toProduct);
}

export async function getAdminProduct(slug: string): Promise<ShopProduct | null> {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export function parseBulletLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Quarter number from a "-kw2" slug or a "Kwartaal 2" title. */
export function quarterOf(product: ShopProduct) {
  const match = product.slug.match(/-kw(\d)/) ?? product.title.match(/kwartaal\s*(\d)/i);
  return match ? Number(match[1]) : null;
}

export function productLabel(product: ShopProduct) {
  return [product.grade ? `Graad ${product.grade}` : null, product.kind, product.title]
    .filter(Boolean)
    .join(" · ");
}

export type GradeCatalogue = {
  grade: number;
  summary: {
    kind: string;
    body: string;
    quarters: ShopProduct[];
    full: ShopProduct | null;
  } | null;
  slides: {
    single: ShopProduct | null;
    full: ShopProduct | null;
  } | null;
  /** Anything that is not part of the quarter series, shown as plain cards. */
  other: ShopProduct[];
};

/** Group one grade's products into the price list from the teacher's document. */
export function catalogueForGrade(products: ShopProduct[], grade: number): GradeCatalogue {
  const own = products.filter((product) => product.grade === grade);
  const quarterSeries = (match: (kind: string) => boolean) =>
    own
      .filter((product) => match(product.kind) && product.listingKind === "item" && quarterOf(product))
      .sort((a, b) => (quarterOf(a) ?? 0) - (quarterOf(b) ?? 0));
  // Summaries are the usual per-quarter series; Gr 9 sells its slides per quarter instead.
  const summaryQuarters = quarterSeries((kind) => summaryKinds.has(kind));
  const quarters = summaryQuarters.length > 0 ? summaryQuarters : quarterSeries((kind) => kind === slideKind);
  const summaryFull =
    own.find((product) => summaryKinds.has(product.kind) && product.listingKind === "bundle") ?? null;
  const slideSingle =
    own.find((product) => product.kind === slideKind && product.listingKind === "item" && !quarterOf(product)) ??
    null;
  const slideFull = own.find((product) => product.kind === slideKind && product.listingKind === "bundle") ?? null;
  const used = new Set([...quarters, summaryFull, slideSingle, slideFull].filter(Boolean));
  const lead = quarters[0] ?? summaryFull;

  return {
    grade,
    summary: lead
      ? { kind: lead.kind, body: lead.body, quarters, full: summaryFull }
      : null,
    slides: slideSingle || slideFull ? { single: slideSingle, full: slideFull } : null,
    other: own.filter((product) => !used.has(product)),
  };
}

export function hasCatalogue(catalogue: GradeCatalogue) {
  return Boolean(catalogue.summary || catalogue.slides || catalogue.other.length > 0);
}
