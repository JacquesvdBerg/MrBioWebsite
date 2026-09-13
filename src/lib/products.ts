import "server-only";
import type { VisualTone } from "@/components/visual";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { toVisualTone } from "@/lib/visual-tone";

export const productListingKinds = ["item", "bundle"] as const;

export type ProductListingKind = (typeof productListingKinds)[number];

export const productKindOptions = [
  "Notas",
  "Werkkaarte",
  "Volledige pak",
  "Eksamenpak",
  "Opsomming",
  "Bundel",
] as const;

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