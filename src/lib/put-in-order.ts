export type OrderItem = {
  id: string;
  prompt: string;
  steps: string[];
};

export type PutInOrderPayload = {
  items: OrderItem[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parsePutInOrderPayload(value: unknown): PutInOrderPayload {
  if (!value || typeof value !== "object") {
    return { items: [] };
  }

  const raw = value as { items?: unknown; sequences?: unknown };
  const source = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.sequences)
      ? raw.sequences
      : [];

  const items = source.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    const prompt = asString(row.prompt || row.title).trim();
    const steps = Array.isArray(row.steps)
      ? row.steps.map((step) => asString(step).trim()).filter(Boolean)
      : [];
    if (!prompt || steps.length < 3) {
      return [];
    }
    return [{ id: asString(row.id) || `o-${index}`, prompt, steps }];
  });

  return { items };
}
