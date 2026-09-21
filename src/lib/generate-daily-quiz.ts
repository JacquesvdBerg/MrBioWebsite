import "server-only";
import { getAiSettings } from "@/lib/ai-settings";
import { johannesburgDate } from "@/lib/dates";
import { selectedGrades } from "@/lib/daily-job";
import { quizBankSize } from "@/lib/quiz-length";
import { parseQuizPayload, type QuizPayload } from "@/lib/quiz";
import { buildQuizSystemPrompt, buildQuizUserPrompt } from "@/lib/quiz-prompt";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { pickNextTopic, type ActivityTopic } from "@/lib/topics";

const quizSchema = {
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
        required: ["prompt", "options", "correctIndex", "explanation"],
        properties: {
          prompt: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
          },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

type ModelQuiz = {
  title?: string;
  description?: string;
  questions?: Array<{
    prompt?: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  }>;
};

export type DailyJobResult = {
  grade: number;
  status: "created" | "skipped" | "failed";
  slug?: string;
  topic?: string;
  questions?: number;
  error?: string;
};

function toPayload(model: ModelQuiz): QuizPayload {
  const questions = (model.questions ?? []).flatMap((item, index) => {
    const options = (item.options ?? [])
      .map((text) => text.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((text, optionIndex) => ({
        id: `q${index}-o${optionIndex}`,
        text,
      }));

    const prompt = (item.prompt ?? "").trim();
    if (!prompt || options.length < 2) {
      return [];
    }

    const correctIndex = Math.min(
      Math.max(0, Number(item.correctIndex) || 0),
      options.length - 1,
    );

    return [
      {
        id: `q${index}`,
        prompt,
        options,
        correctId: options[correctIndex]?.id ?? options[0]?.id ?? "",
        explanation: (item.explanation ?? "").trim(),
      },
    ];
  });

  return parseQuizPayload({ questions });
}

async function requestQuiz(input: {
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
        { role: "system", content: buildQuizSystemPrompt(settings) },
        { role: "user", content: buildQuizUserPrompt(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "daily_quiz",
          strict: true,
          schema: quizSchema,
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

  const parsed = JSON.parse(content) as ModelQuiz;
  const quiz = toPayload(parsed);

  if (quiz.questions.length < 5) {
    throw new Error("Too few valid questions");
  }

  return {
    title: (parsed.title ?? "").trim() || `${input.topic.title} vasvra`,
    description: (parsed.description ?? "").trim(),
    quiz,
  };
}

async function generateForGrade(
  grade: number,
  date: string,
): Promise<DailyJobResult> {
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
    .eq("kind", "quiz")
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
    const generated = await requestQuiz({ grade, date, topic });
    const slug = slugify(`vasvra-g${grade}-${date}-${topic.title}`);
    const title = `${formatShortDate(date)} · ${generated.title}`;

    const { error } = await supabase.from("activities").insert({
      kind: "quiz",
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

export async function runDailyQuizJob(options: {
  date?: string;
  grade?: number;
}) {
  const settings = await getAiSettings();
  if (settings.paused) {
    return {
      ok: false as const,
      date: options.date ?? johannesburgDate(),
      error: "Generation is paused in settings",
      results: [] as DailyJobResult[],
    };
  }

  const date = options.date ?? johannesburgDate();
  const selected = selectedGrades(options.grade);

  const results = await Promise.all(
    selected.map((grade) => {
      console.info(`[daily-quiz] generating grade ${grade} for ${date}`);
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
