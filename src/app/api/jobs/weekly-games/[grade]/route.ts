import { runScheduledGrade } from "@/lib/daily-route";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ grade: string }> };

export async function GET(request: Request, { params }: Context) {
  return runScheduledGrade(request, Number((await params).grade));
}

export async function POST(request: Request, { params }: Context) {
  return runScheduledGrade(request, Number((await params).grade));
}
