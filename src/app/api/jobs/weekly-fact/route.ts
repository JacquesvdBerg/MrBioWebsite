import { runScheduledFact } from "@/lib/daily-route";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export const GET = runScheduledFact;
export const POST = runScheduledFact;
