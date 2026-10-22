import { revalidatePath } from "next/cache";
import { isValidCronRequest } from "@/lib/cron-auth";
import { parseDailyJobRequest } from "@/lib/daily-job";
import { runDailyAllJob } from "@/lib/generate-daily-all";
import { runDailyKindJob } from "@/lib/generate-daily-kind";
import { runDailyQuizJob } from "@/lib/generate-daily-quiz";
import { runDailyTrueOrFalseJob } from "@/lib/generate-daily-true-or-false";
import { runWeeklyFactJob } from "@/lib/generate-weekly-fact";
import { activityTypes, isJobGrade, type ActivitySlug } from "@/lib/site";

export const dailyJobRuntime = {
  runtime: "nodejs" as const,
  maxDuration: 300,
  dynamic: "force-dynamic" as const,
};

function revalidateDaily(kind: ActivitySlug, grade: number, slug?: string) {
  revalidatePath("/play-and-learn");
  revalidatePath(`/play-and-learn/graad/${grade}`);
  revalidatePath(`/play-and-learn/graad/${grade}/${kind}`);
  if (slug) {
    revalidatePath(`/play-and-learn/${kind}/${slug}`);
  }
}

async function readBody(request: Request) {
  try {
    return (await request.json()) as {
      date?: string;
      grade?: number | string;
      kinds?: unknown;
    };
  } catch {
    return {};
  }
}

function usage(kind: ActivitySlug | "all") {
  return {
    ok: false,
    error: "Use POST, not GET.",
    expectSeconds:
      kind === "all"
        ? "One grade, all games: about 1–3 minutes. All grades can approach 5 minutes."
        : "About 30–90s. Grades run in parallel.",
    endpoint:
      kind === "all" ? "/api/jobs/daily-all" : `/api/jobs/daily-${kind}`,
    headers: {
      Authorization: "Bearer CRON_SECRET",
      "Content-Type": "application/json",
    },
    body: {
      date: "2026-08-31",
      grade: 10,
      kinds:
        kind === "all"
          ? activityTypes.map((item) => item.slug)
          : undefined,
    },
  };
}

async function authorize(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is missing from env" },
      { status: 503 },
    );
  }

  if (!isValidCronRequest(request)) {
    return Response.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  return null;
}

export function dailyKindHandlers(kind: ActivitySlug) {
  return {
    GET() {
      return Response.json(usage(kind));
    },
    async POST(request: Request) {
      const denied = await authorize(request);
      if (denied) {
        return denied;
      }

      const options = parseDailyJobRequest(await readBody(request));
      const result =
        kind === "quiz"
          ? await runDailyQuizJob(options)
          : kind === "true-or-false"
            ? await runDailyTrueOrFalseJob(options)
            : await runDailyKindJob(kind, options);

      const rows =
        "results" in result
          ? result.results.map((item) => ({
              ...item,
              kind: "kind" in item ? item.kind : kind,
              grade: item.grade,
              status: item.status,
              slug: item.slug,
            }))
          : [];

      for (const item of rows) {
        if (item.status === "created") {
          revalidateDaily(kind, item.grade, item.slug);
        }
      }

      return Response.json(result, { status: result.ok ? 200 : 422 });
    },
  };
}

export function dailyAllHandlers() {
  return {
    GET() {
      return Response.json(usage("all"));
    },
    async POST(request: Request) {
      const denied = await authorize(request);
      if (denied) {
        return denied;
      }

      const options = parseDailyJobRequest(await readBody(request));
      const result = await runDailyAllJob(options);

      for (const item of result.results) {
        if (item.status === "created") {
          revalidateDaily(item.kind, item.grade, item.slug);
        }
      }

      return Response.json(result, { status: result.ok ? 200 : 422 });
    },
  };
}

/** Vercel Cron: GET with the CRON_SECRET bearer token, one grade per call so each gets the full time limit. */
export async function runScheduledGrade(request: Request, grade: number) {
  const denied = await authorize(request);
  if (denied) {
    return denied;
  }
  if (!isJobGrade(grade)) {
    return Response.json({ ok: false, error: "This grade has no weekly games" }, { status: 404 });
  }

  const result = await runDailyAllJob({ grade });

  for (const item of result.results) {
    if (item.status === "created") {
      revalidateDaily(item.kind, item.grade, item.slug);
    }
  }

  return Response.json(result, { status: result.ok ? 200 : 422 });
}

/** Vercel Cron: the weekly fact. Also accepts POST for a manual run. */
export async function runScheduledFact(request: Request) {
  const denied = await authorize(request);
  if (denied) {
    return denied;
  }

  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? "";
  const result = await runWeeklyFactJob({
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    dryRun: params.get("dry") === "1",
  });
  return Response.json(result, { status: result.ok ? 200 : 422 });
}
