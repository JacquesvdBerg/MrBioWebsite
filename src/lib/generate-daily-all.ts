import "server-only";
import { getAiSettings } from "@/lib/ai-settings";
import {
  mapPool,
  resolveJobDate,
  selectedGrades,
  type DailyJobOptions,
  type DailyJobResult,
} from "@/lib/daily-job";
import { generateDailyKindForGrade } from "@/lib/generate-daily-kind";
import { runDailyQuizJob } from "@/lib/generate-daily-quiz";
import { runDailyTrueOrFalseJob } from "@/lib/generate-daily-true-or-false";
import { activityTypes, type ActivitySlug } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/service";
import { pickNextTopic } from "@/lib/topics";

const generatedKinds = activityTypes.map((item) => item.slug);

function withKind(
  kind: ActivitySlug,
  results: Array<Omit<DailyJobResult, "kind"> & { kind?: ActivitySlug }>,
): DailyJobResult[] {
  return results.map((item) => ({
    ...item,
    kind: item.kind ?? kind,
  }));
}

export async function runDailyAllJob(options: DailyJobOptions) {
  const settings = await getAiSettings();
  const date = resolveJobDate(options.date);
  const kinds = options.kinds ?? generatedKinds;

  if (settings.paused) {
    return {
      ok: false as const,
      date,
      error: "Generation is paused in settings",
      results: [] as DailyJobResult[],
    };
  }

  const gradesToRun = selectedGrades(options.grade);
  const results: DailyJobResult[] = [];

  for (const grade of gradesToRun) {
    const topic = await pickNextTopic(grade);
    const jobs = kinds.map((kind) => ({ grade, kind }));

    const chunk = await mapPool(jobs, 4, async ({ kind }) => {
      console.info(`[daily-all] ${kind} grade ${grade} for ${date}`);
      if (kind === "quiz") {
        const quiz = await runDailyQuizJob({ date, grade });
        return withKind("quiz", quiz.results);
      }
      if (kind === "true-or-false") {
        const quiz = await runDailyTrueOrFalseJob({ date, grade });
        return withKind("true-or-false", quiz.results);
      }
      return [
        await generateDailyKindForGrade({
          kind,
          grade,
          date,
          topic: topic ?? undefined,
          touchTopic: false,
        }),
      ];
    });

    results.push(...chunk.flat());

    if (topic) {
      const supabase = createServiceClient();
      await supabase
        ?.from("activity_topics")
        .update({ last_used_on: date })
        .eq("id", topic.id);
    }
  }

  return {
    ok: !results.some((item) => item.status === "failed"),
    date,
    kinds,
    results,
  };
}
