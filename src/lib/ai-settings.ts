import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type AiDifficulty = "hersiening" | "eksamen" | "uitdaging";

export type AiTerm = {
  id: string;
  use: string;
  never: string;
  exam: string;
};

export type AiSettings = {
  houseRules: string;
  paused: boolean;
  difficulty: AiDifficulty;
  terms: AiTerm[];
};

const defaults: AiSettings = {
  houseRules: "",
  paused: false,
  difficulty: "hersiening",
  terms: [],
};

function parseTerm(value: unknown, index: number): AiTerm | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const use = typeof row.use === "string" ? row.use.trim() : "";
  const never = typeof row.never === "string" ? row.never.trim() : "";

  if (!use || !never) {
    return null;
  }

  return {
    id: typeof row.id === "string" && row.id ? row.id : `term-${index}`,
    use,
    never,
    exam: typeof row.exam === "string" ? row.exam.trim() : "",
  };
}

function parseSettings(value: unknown): AiSettings {
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const row = value as Record<string, unknown>;
  const difficulty = row.difficulty;
  const terms = Array.isArray(row.terms)
    ? row.terms.flatMap((item, index) => {
        const term = parseTerm(item, index);
        return term ? [term] : [];
      })
    : [];

  return {
    houseRules:
      typeof row.houseRules === "string" ? row.houseRules.trim() : "",
    paused: row.paused === true,
    difficulty:
      difficulty === "eksamen" || difficulty === "uitdaging"
        ? difficulty
        : "hersiening",
    terms,
  };
}

export function formatAiTermsPrompt(terms: AiTerm[]) {
  if (terms.length === 0) {
    return "";
  }

  const lines = terms.map((term) => {
    const exam = term.exam ? ` (eksamen-Engels in hakies: ${term.exam})` : "";
    return `- Sê “${term.use}”, nooit “${term.never}” nie${exam}.`;
  });

  return `\n\nVakterme (verpligtend — moenie Engels direk vertaal as die lys ’n term gee nie):\n${lines.join("\n")}`;
}

export async function getAiSettings() {
  const supabase = createServiceClient() ?? (await createClient());
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ai")
    .maybeSingle();

  if (error || !data) {
    return defaults;
  }

  return parseSettings((data as { value: unknown }).value);
}

export async function saveAiSettings(settings: AiSettings) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "ai",
    value: settings,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Kon nie instellings stoor nie:", error.message);
  }
}
