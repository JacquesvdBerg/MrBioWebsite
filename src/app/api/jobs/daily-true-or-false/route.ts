import { revalidatePath } from "next/cache";
import { isValidCronRequest } from "@/lib/cron-auth";
import { runDailyTrueOrFalseJob } from "@/lib/generate-daily-true-or-false";
import { isGrade } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function revalidateDaily(grade: number, slug?: string) {
  revalidatePath("/play-and-learn");
  revalidatePath(`/play-and-learn/graad/${grade}`);
  revalidatePath(`/play-and-learn/graad/${grade}/true-or-false`);
  if (slug) {
    revalidatePath(`/play-and-learn/true-or-false/${slug}`);
  }
}

export async function GET() {
  return Response.json({
    ok: false,
    error: "Use POST, not GET.",
    expectSeconds:
      "About 30–90s. Grades run in parallel. OpenAI writes 25 true/false statements each.",
    endpoint: "/api/jobs/daily-true-or-false",
    headers: {
      Authorization: "Bearer CRON_SECRET",
      "Content-Type": "application/json",
    },
    body: {
      date: "2026-08-31",
      grade: 10,
    },
  });
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is missing from env" },
      { status: 503 },
    );
  }

  if (!isValidCronRequest(request)) {
    return Response.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  let body: { date?: string; grade?: number | string } = {};
  try {
    body = (await request.json()) as {
      date?: string;
      grade?: number | string;
    };
  } catch {
    body = {};
  }

  const parsedGrade = Number(body.grade);
  const grade = isGrade(parsedGrade) ? parsedGrade : undefined;
  const date =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : undefined;

  const result = await runDailyTrueOrFalseJob({ date, grade });

  for (const item of result.results) {
    if (item.status === "created") {
      revalidateDaily(item.grade, item.slug);
    }
  }

  return Response.json(result, { status: result.ok ? 200 : 422 });
}
