import { johannesburgDate } from "@/lib/dates";
import { grades, isActivitySlug, isGrade, type ActivitySlug } from "@/lib/site";

export type DailyJobResult = {
  kind: ActivitySlug;
  grade: number;
  status: "created" | "skipped" | "failed";
  slug?: string;
  topic?: string;
  questions?: number;
  error?: string;
};

export type DailyJobOptions = {
  date?: string;
  grade?: number;
  kinds?: ActivitySlug[];
};

export function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function parseDailyJobRequest(body: {
  date?: string;
  grade?: number | string;
  kinds?: unknown;
}): DailyJobOptions {
  const parsedGrade = Number(body.grade);
  const kinds = Array.isArray(body.kinds)
    ? body.kinds.filter(
        (item): item is ActivitySlug =>
          typeof item === "string" && isActivitySlug(item),
      )
    : undefined;

  return {
    date:
      typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
        ? body.date
        : undefined,
    grade: isGrade(parsedGrade) ? parsedGrade : undefined,
    kinds: kinds && kinds.length > 0 ? kinds : undefined,
  };
}

export function selectedGrades(grade?: number) {
  return grade && isGrade(grade) ? [grade] : [...grades];
}

export function resolveJobDate(date?: string) {
  return date ?? johannesburgDate();
}

export async function mapPool<T, R>(
  items: T[],
  size: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    const chunk = items.slice(index, index + size);
    results.push(...(await Promise.all(chunk.map(mapper))));
  }
  return results;
}
