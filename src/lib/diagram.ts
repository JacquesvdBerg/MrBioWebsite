export type DiagramPart = {
  id: string;
  label: string;
  hint: string;
};

export type DiagramPayload = {
  parts: DiagramPart[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseDiagramPayload(value: unknown): DiagramPayload {
  if (!value || typeof value !== "object") {
    return { parts: [] };
  }

  const raw = value as { parts?: unknown };
  const source = Array.isArray(raw.parts) ? raw.parts : [];

  const parts = source.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    const label = asString(row.label).trim();
    const hint = asString(row.hint || row.description).trim();
    if (!label) {
      return [];
    }
    return [{ id: asString(row.id) || `d-${index}`, label, hint }];
  });

  return { parts };
}
