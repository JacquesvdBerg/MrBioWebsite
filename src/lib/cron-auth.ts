import { timingSafeEqual } from "crypto";

export function isValidCronRequest(request: Request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return false;
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : (request.headers.get("x-cron-secret") ?? "").trim();

  const left = Buffer.from(provided);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
