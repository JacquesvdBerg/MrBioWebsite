export type PairItem = {
  id: string;
  left: string;
  right: string;
};

export type PairsPayload = {
  pairs: PairItem[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parsePairsPayload(value: unknown): PairsPayload {
  if (!value || typeof value !== "object") {
    return { pairs: [] };
  }

  const raw = value as { pairs?: unknown };
  const source = Array.isArray(raw.pairs) ? raw.pairs : [];

  const pairs = source.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    const left = asString(row.left || row.term).trim();
    const right = asString(row.right || row.definition || row.match).trim();
    if (!left || !right) {
      return [];
    }
    return [{ id: asString(row.id) || `p-${index}`, left, right }];
  });

  return { pairs };
}
