import "server-only";
import { getAiSettings } from "@/lib/ai-settings";
import { johannesburgDate } from "@/lib/dates";
import { selectedGrades } from "@/lib/daily-job";
import { quizBankSize } from "@/lib/quiz-length";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { pickNextTopic, type ActivityTopic } from "@/lib/topics";
import {
  parseTrueOrFalsePayload,
  type TrueOrFalsePayload,
} from "@/lib/true-or-false";
import {
  buildTrueOrFalseSystemPrompt,
  buildTrueOrFalseUserPrompt,
} from "@/lib/true-or-false-prompt";

const trueOrFalseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "questions"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["statement", "isTrue", "explanation"],
        properties: {
          statement: { type: "string" },
          isTrue: { type: "boolean" },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

type ModelTrueOrFalse = {
  title?: string;
  description?: string;
  questions?: Array<{
    statement?: string;
    isTrue?: boolean;
    explanation?: string;
  }>;
};

export type DailyTrueOrFalseResult = {
  grade: number;
  status: "created" | "skipped" | "failed";
  slug?: string;
  topic?: string;
  questions?: number;
  error?: string;
};

function toPayload(model: ModelTrueOrFalse): TrueOrFalsePayload {
  const questions = (model.questions ?? []).flatMap((item, index) => {
    const statement = (item.statement ?? "").trim();
    if (!statement) {
      return [];
    }

    return [
      {
        id: `q${index}`,
        statement,
        isTrue: item.isTrue === true,
        explanation: (item.explanation ?? "").trim(),
      },
    ];
  });

  return parseTrueOrFalsePayload({ questions });
}

async function requestTrueOrFalse(input: {
  grade: number;
  date: string;
  topic: ActivityTopic;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const settings = await getAiSettings();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.4,
      messages: [
        { role: "system", content: buildTrueOrFalseSystemPrompt(settings) },
        { role: "user", content: buildTrueOrFalseUserPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "daily_true_or_false",
          strict: true,
          schema: trueOrFalseSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI ${response.status}: ${detail.slice(0, 400)}`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty OpenAI response");
  }

  const parsed = JSON.parse(content) as ModelTrueOrFalse;
  const quiz = toPayload(parsed);

  if (quiz.questions.length < 5) {
    throw new Error("Too few valid statements");
  }

  return {
    title: (parsed.title ?? "").trim() || `${input.topic.title} waar of onwaar`,
    description: (parsed.description ?? "").trim(),
    quiz,
  };
}

async function generateForGrade(
  grade: number,
  date: string,
): Promise<DailyTrueOrFalseResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return {
      grade,
      status: "failed",
      error: "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is missing",
    };
  }

  const { data: existing } = await supabase
    .from("activities")
    .select("slug")
    .eq("kind", "true-or-false")
    .eq("source", "ai-daily")
    .eq("grade", grade)
    .eq("play_on", date)
    .maybeSingle();

  if (existing) {
    return {
      grade,
      status: "skipped",
      slug: (existing as { slug: string }).slug,
    };
  }

  const topic = await pickNextTopic(grade);
  if (!topic) {
    return {
      grade,
      status: "failed",
      error: "No active topic for this grade",
    };
  }

  try {
    const generated = await requestTrueOrFalse({ grade, date, topic });
    const slug = slugify(`waar-onwaar-g${grade}-${date}-${topic.title}`);
    const title = `${formatShortDate(date)} · ${generated.title}`;

    const { error } = await supabase.from("activities").insert({
      kind: "true-or-false",
      slug,
      title,
      description: generated.description,
      grade,
      topic: topic.title,
      theme_slug: topic.themeSlug,
      payload: generated.quiz,
      is_published: true,
      source: "ai-daily",
      play_on: date,
      topic_id: topic.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    await supabase
      .from("activity_topics")
      .update({ last_used_on: date })
      .eq("id", topic.id);

    return {
      grade,
      status: "created",
      slug,
      topic: topic.title,
      questions: generated.quiz.questions.length,
    };
  } catch (error) {
    return {
      grade,
      status: "failed",
      topic: topic.title,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export async function runDailyTrueOrFalseJob(options: {
  date?: string;
  grade?: number;
}) {
  const settings = await getAiSettings();
  if (settings.paused) {
    return {
      ok: false as const,
      date: options.date ?? johannesburgDate(),
      error: "Generation is paused in settings",
      results: [] as DailyTrueOrFalseResult[],
    };
  }

  const date = options.date ?? johannesburgDate();
  const selected = selectedGrades(options.grade);

  const results = await Promise.all(
    selected.map((grade) => {
      console.info(`[daily-true-or-false] generating grade ${grade} for ${date}`);
      return generateForGrade(grade, date);
    }),
  );

  const failed = results.some((item) => item.status === "failed");
  return {
    ok: !failed,
    date,
    bankSize: quizBankSize,
    results,
  };
}
