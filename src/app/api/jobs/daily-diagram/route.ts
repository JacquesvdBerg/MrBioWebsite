import { dailyKindHandlers } from "@/lib/daily-route";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const { GET, POST } = dailyKindHandlers("diagram");
