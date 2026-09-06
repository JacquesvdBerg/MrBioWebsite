import "server-only";
import { getAiSettings } from "@/lib/ai-settings";
import {
  formatShortDate,
  resolveJobDate,
  selectedGrades,
  type DailyJobResult,
} from "@/lib/daily-job";
import { specForKind } from "@/lib/game-specs";
import { requestOpenAiJson } from "@/lib/openai-json";
import type { ActivitySlug } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { pickNextTopic, type ActivityTopic } from "@/lib/topics";

export async function generateDailyKindForGrade(input: {
  kind: ActivitySlug;
  grade: number;
  date: string;
  topic?: ActivityTopic;
  touchTopic?: boolean;
}): Promise<DailyJobResult> {
  const spec = specForKind(input.kind);
  if (!spec) {
    return {
      kind: input.kind,
      grade: input.grade,
      status: "failed",
      error: "No generator for this kind",
    };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return {
      kind: input.kind,
      grade: input.grade,
      status: "failed",
      error: "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is missing",
    };
  }

  const { data: existing } = await supabase
    .from("activities")
    .select("slug")
    .eq("kind", input.kind)
    .eq("source", "ai-daily")
    .eq("grade", input.grade)
    .eq("play_on", input.date)
    .maybeSingle();

  if (existing) {
    return {
      kind: input.kind,
      grade: input.grade,
      status: "skipped",
      slug: (existing as { slug: string }).slug,
    };
  }

  const topic = input.topic ?? (await pickNextTopic(input.grade));
  if (!topic) {
    return {
      kind: input.kind,
      grade: input.grade,
      status: "failed",
      error: "No active topic for this grade",
    };
  }

  try {
    const settings = await getAiSettings();
    const model = await requestOpenAiJson<Record<string, unknown>>({
      schemaName: spec.schemaName,
      schema: spec.schema,
      system: spec.system(settings),
      user: spec.user({
        grade: input.grade,
        date: input.date,
        topic,
      }),
    });
    const generated = spec.toContent(model, topic.title);
    if (generated.count < 3) {
      throw new Error("Too little valid content");
    }

    const slug = slugify(
      `${spec.slugPrefix}${input.grade}-${input.date}-${topic.title}`,
    );
    const title = `${formatShortDate(input.date)} · ${generated.title}`;

    const { error } = await supabase.from("activities").insert({
      kind: input.kind,
      slug,
      title,
      description: generated.description,
      grade: input.grade,
      topic: topic.title,
      theme_slug: topic.themeSlug,
      payload: generated.payload,
      is_published: true,
      source: "ai-daily",
      play_on: input.date,
      topic_id: topic.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (input.touchTopic !== false) {
      await supabase
        .from("activity_topics")
        .update({ last_used_on: input.date })
        .eq("id", topic.id);
    }

    return {
      kind: input.kind,
      grade: input.grade,
      status: "created",
      slug,
      topic: topic.title,
      questions: generated.count,
    };
  } catch (error) {
    return {
      kind: input.kind,
      grade: input.grade,
      status: "failed",
      topic: topic.title,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function runDailyKindJob(
  kind: ActivitySlug,
  options: { date?: string; grade?: number },
) {
  const settings = await getAiSettings();
  const date = resolveJobDate(options.date);
  if (settings.paused) {
    return {
      ok: false as const,
      date,
      error: "Generation is paused in settings",
      results: [] as DailyJobResult[],
    };
  }

  const results = await Promise.all(
    selectedGrades(options.grade).map((grade) => {
      console.info(`[daily-${kind}] generating grade ${grade} for ${date}`);
      return generateDailyKindForGrade({ kind, grade, date });
    }),
  );

  return {
    ok: !results.some((item) => item.status === "failed"),
    date,
    kind,
    results,
  };
}
