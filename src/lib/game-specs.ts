import { formatAiTermsPrompt, type AiSettings } from "@/lib/ai-settings";
import { parseCrosswordPayload, type CrosswordPayload } from "@/lib/crossword";
import { parseDiagramPayload, type DiagramPayload } from "@/lib/diagram";
import { parsePairsPayload, type PairsPayload } from "@/lib/pairs";
import {
  parsePutInOrderPayload,
  type PutInOrderPayload,
} from "@/lib/put-in-order";
import { parseQuizPayload, type QuizPayload } from "@/lib/quiz";
import { parseSortingPayload, type SortingPayload } from "@/lib/sorting";
import type { ActivitySlug } from "@/lib/site";
import type { ActivityTopic } from "@/lib/topics";
import {
  parseWordSearchPayload,
  type WordSearchPayload,
} from "@/lib/word-search";

export type GeneratedContent = {
  title: string;
  description: string;
  payload: unknown;
  count: number;
};

function capsRules(settings: AiSettings, extra: string) {
  const house = settings.houseRules
    ? `\n\nEkstra huisreëls van die onderwyser:\n${settings.houseRules}`
    : "";

  return `Jy is ’n Lewenswetenskappe-onderwyser vir Suid-Afrikaanse leerders (CAPS).
Jy skryf DAAGLIKSE Oefen & toets-inhoud vir MrBio.

Harde reëls:
- Skryf ALLES in Afrikaans.
- Net Lewenswetenskappe. Geen Natuurwetenskappe, fisika of chemie buite die LW-sillabus.
- Bly by CAPS vir die gegewe graad.
- Gebruik klaskamer-vakterme.
- Geen mediese advies, geen godsdiensdebat, geen politiek.
- Antwoord slegs met die gevraagde JSON.
Vlak: ${settings.difficulty}.${extra}${formatAiTermsPrompt(settings.terms)}${house}`;
}

function userPrompt(input: {
  grade: number;
  date: string;
  topic: ActivityTopic;
  task: string;
}) {
  const notes = input.topic.notes
    ? `\nFokus vir hierdie onderwerp: ${input.topic.notes}`
    : "";
  return `Datum: ${input.date} (Afrika/Johannesburg)
Graad: ${input.grade}
Onderwerp: ${input.topic.title}${notes}

${input.task}`;
}

const titleFields = {
  title: { type: "string" },
  description: { type: "string" },
} as const;

export type GameSpec = {
  kind: ActivitySlug;
  slugPrefix: string;
  schemaName: string;
  schema: Record<string, unknown>;
  system: (settings: AiSettings) => string;
  user: (input: {
    grade: number;
    date: string;
    topic: ActivityTopic;
  }) => string;
  toContent: (model: Record<string, unknown>, topic: string) => GeneratedContent;
};

const quizQuestionSchema = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["prompt", "options", "correctIndex", "explanation"],
    properties: {
      prompt: { type: "string" },
      options: { type: "array", items: { type: "string" } },
      correctIndex: { type: "integer" },
      explanation: { type: "string" },
    },
  },
} as const;

function quizFromModel(
  model: Record<string, unknown>,
  topic: string,
  fallback: string,
): GeneratedContent {
  const rawQuestions = Array.isArray(model.questions) ? model.questions : [];
  const questions = rawQuestions.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as {
      prompt?: string;
      options?: string[];
      correctIndex?: number;
      explanation?: string;
    };
    const options = (row.options ?? [])
      .map((text) => text.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((text, optionIndex) => ({
        id: `q${index}-o${optionIndex}`,
        text,
      }));
    const prompt = (row.prompt ?? "").trim();
    if (!prompt || options.length < 2) {
      return [];
    }
    const correctIndex = Math.min(
      Math.max(0, Number(row.correctIndex) || 0),
      options.length - 1,
    );
    return [
      {
        id: `q${index}`,
        prompt,
        options,
        correctId: options[correctIndex]?.id ?? options[0]?.id ?? "",
        explanation: (row.explanation ?? "").trim(),
      },
    ];
  });
  const payload: QuizPayload = parseQuizPayload({ questions });
  return {
    title: String(model.title ?? "").trim() || `${topic} ${fallback}`,
    description: String(model.description ?? "").trim(),
    payload,
    count: payload.questions.length,
  };
}

export const gameSpecs: GameSpec[] = [
  {
    kind: "speed-quiz",
    slugPrefix: "spoed-g",
    schemaName: "daily_speed_quiz",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "questions"],
      properties: {
        ...titleFields,
        questions: quizQuestionSchema,
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep presies 25 meerkeusevrae (4 opsies, een reg). Kort, duidelik, goed vir ’n spoedronde.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se spoedvasvra." }),
    toContent: (model, topic) => quizFromModel(model, topic, "spoedvasvra"),
  },
  {
    kind: "word-search",
    slugPrefix: "woordsoektog-g",
    schemaName: "daily_word_search",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "words"],
      properties: {
        ...titleFields,
        words: { type: "array", items: { type: "string" } },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 20 CAPS-vakterme. Enkele woorde of kort saamgestelde woorde. Geen sinne.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se woordsoektog-woorde." }),
    toContent: (model, topic) => {
      const payload: WordSearchPayload = parseWordSearchPayload({
        words: model.words,
      });
      return {
        title: String(model.title ?? "").trim() || `${topic} woordsoektog`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.words.length,
      };
    },
  },
  {
    kind: "crossword",
    slugPrefix: "kruiswoord-g",
    schemaName: "daily_crossword",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "entries"],
      properties: {
        ...titleFields,
        entries: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["clue", "answer", "hint"],
            properties: {
              clue: { type: "string" },
              answer: { type: "string" },
              hint: { type: "string" },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 12 kruiswoord-items. Antwoorde is enkele Afrikaanse vakterme sonder spasies. hint is ’n kort wenk wat die antwoord nie gee nie — ’n eienskap, konteks of eerste letter.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se kruiswoord." }),
    toContent: (model, topic) => {
      const payload: CrosswordPayload = parseCrosswordPayload({
        entries: model.entries,
      });
      return {
        title: String(model.title ?? "").trim() || `${topic} kruiswoord`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.entries.length,
      };
    },
  },
  {
    kind: "match-the-pairs",
    slugPrefix: "pare-g",
    schemaName: "daily_pairs",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "pairs"],
      properties: {
        ...titleFields,
        pairs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["left", "right"],
            properties: {
              left: { type: "string" },
              right: { type: "string" },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 12 pare: term (left) en betekenis (right).",
      ),
    user: (input) => userPrompt({ ...input, task: "Skep vandag se pare." }),
    toContent: (model, topic) => {
      const payload: PairsPayload = parsePairsPayload({ pairs: model.pairs });
      return {
        title: String(model.title ?? "").trim() || `${topic} pare`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.pairs.length,
      };
    },
  },
  {
    kind: "memory-cards",
    slugPrefix: "geheue-g",
    schemaName: "daily_memory",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "pairs"],
      properties: {
        ...titleFields,
        pairs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["left", "right"],
            properties: {
              left: { type: "string" },
              right: { type: "string" },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 8 geheue-pare: kort term (left) en kort betekenis (right).",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se geheuekaarte." }),
    toContent: (model, topic) => {
      const payload: PairsPayload = parsePairsPayload({ pairs: model.pairs });
      return {
        title: String(model.title ?? "").trim() || `${topic} geheue`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.pairs.length,
      };
    },
  },
  {
    kind: "put-in-order",
    slugPrefix: "volgorde-g",
    schemaName: "daily_order",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "items"],
      properties: {
        ...titleFields,
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["prompt", "steps"],
            properties: {
              prompt: { type: "string" },
              steps: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 8 prosesse. Elke proses het 4 tot 6 stappe in die REGTE volgorde.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se volgorde-aktiwiteite." }),
    toContent: (model, topic) => {
      const payload: PutInOrderPayload = parsePutInOrderPayload({
        items: model.items,
      });
      return {
        title: String(model.title ?? "").trim() || `${topic} volgorde`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.items.length,
      };
    },
  },
  {
    kind: "diagram",
    slugPrefix: "diagram-g",
    schemaName: "daily_diagram",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "parts"],
      properties: {
        ...titleFields,
        parts: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "hint"],
            properties: {
              label: { type: "string" },
              hint: { type: "string" },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 10 genommerde onderdele van EEN bekende CAPS-struktuur. label is die naam, hint beskryf waar dit sit / wat dit doen.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se diagram-etikette." }),
    toContent: (model, topic) => {
      const payload: DiagramPayload = parseDiagramPayload({
        parts: model.parts,
      });
      return {
        title: String(model.title ?? "").trim() || `${topic} diagram`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.parts.length,
      };
    },
  },
  {
    kind: "sorting",
    slugPrefix: "sorteer-g",
    schemaName: "daily_sorting",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description", "categories", "items"],
      properties: {
        ...titleFields,
        categories: { type: "array", items: { type: "string" } },
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["text", "category"],
            properties: {
              text: { type: "string" },
              category: { type: "string" },
            },
          },
        },
      },
    },
    system: (settings) =>
      capsRules(
        settings,
        "\nSkep 4 kategorieë en 20 items. Elke item se category moet EXAK een van die kategorie-name wees.",
      ),
    user: (input) =>
      userPrompt({ ...input, task: "Skep vandag se sorteer-aktiwiteit." }),
    toContent: (model, topic) => {
      const categories = Array.isArray(model.categories)
        ? model.categories
        : [];
      const payload: SortingPayload = parseSortingPayload({
        categories,
        items: Array.isArray(model.items)
          ? model.items.map((item) => {
              const row = item as { text?: string; category?: string };
              const categoryTitle = row.category ?? "";
              const categoryIndex = categories.findIndex(
                (name) => name === categoryTitle,
              );
              return {
                text: row.text,
                categoryId:
                  categoryIndex >= 0
                    ? `cat-${categoryIndex}`
                    : categoryTitle,
              };
            })
          : [],
      });
      return {
        title: String(model.title ?? "").trim() || `${topic} sorteer`,
        description: String(model.description ?? "").trim(),
        payload,
        count: payload.items.length,
      };
    },
  },
];

export function specForKind(kind: ActivitySlug) {
  return gameSpecs.find((item) => item.kind === kind);
}
