"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseQuizLength, quizLengths } from "@/lib/quiz-length";
import type { ActivitySlug } from "@/lib/site";

type DailyQuizStartProps = {
  kind?: Extract<ActivitySlug, "quiz" | "true-or-false" | "speed-quiz">;
  slug: string;
  available: number;
};

export function DailyQuizStart({
  kind = "quiz",
  slug,
  available,
}: DailyQuizStartProps) {
  const router = useRouter();
  const options = useMemo(
    () => quizLengths.filter((length) => length <= available),
    [available],
  );
  const [length, setLength] = useState(() => parseQuizLength(10, available));
  const index = Math.max(0, options.indexOf(length));

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/play-and-learn/${kind}/${slug}?vrae=${length}`);
      }}
    >
      <p className="text-sm font-bold text-navy">Hoeveel vrae vandag?</p>
      <div className="quiz-length mt-3">
        <input
          type="range"
          min={0}
          max={Math.max(options.length - 1, 0)}
          step={1}
          value={index}
          aria-label="Aantal vrae"
          onChange={(event) => {
            const next = options[Number(event.target.value)];
            if (next) {
              setLength(next);
            }
          }}
        />
        <div className="quiz-length-marks">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              className={item === length ? "is-active" : ""}
              onClick={() => setLength(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">
        {length} vrae uit vandag se bank van {available}. Almal wat {length}{" "}
        kies, kry dieselfde vrae.
      </p>
      <button type="submit" className="quiz-cta mt-5 w-full sm:w-auto">
        Begin vandag
      </button>
    </form>
  );
}
