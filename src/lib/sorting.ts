export type SortingCategory = {
  id: string;
  title: string;
};

export type SortingItem = {
  id: string;
  text: string;
  categoryId: string;
};

export type SortingPayload = {
  categories: SortingCategory[];
  items: SortingItem[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseSortingPayload(value: unknown): SortingPayload {
  if (!value || typeof value !== "object") {
    return { categories: [], items: [] };
  }

  const raw = value as { categories?: unknown; items?: unknown };
  const categories = (Array.isArray(raw.categories) ? raw.categories : [])
    .flatMap((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return [{ id: `cat-${index}`, title: item.trim() }];
      }
      if (!item || typeof item !== "object") {
        return [];
      }
      const row = item as Record<string, unknown>;
      const title = asString(row.title || row.name).trim();
      if (!title) {
        return [];
      }
      return [{ id: asString(row.id) || `cat-${index}`, title }];
    });

  const items = (Array.isArray(raw.items) ? raw.items : []).flatMap(
    (item, index) => {
      if (!item || typeof item !== "object") {
        return [];
      }
      const row = item as Record<string, unknown>;
      const text = asString(row.text || row.label).trim();
      const categoryId = asString(row.categoryId || row.category).trim();
      if (!text || !categoryId) {
        return [];
      }
      return [{ id: asString(row.id) || `s-${index}`, text, categoryId }];
    },
  );

  return { categories, items };
}
