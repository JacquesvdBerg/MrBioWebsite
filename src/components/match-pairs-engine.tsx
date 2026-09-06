"use client";

import { useMemo, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import type { PairItem } from "@/lib/pairs";
import type { ActivitySlug } from "@/lib/site";

type MatchPairsEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  pairs: PairItem[];
  kind?: Extract<ActivitySlug, "match-the-pairs" | "memory-cards">;
};

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    const other = next[swap];
    if (current !== undefined && other !== undefined) {
      next[index] = other;
      next[swap] = current;
    }
  }
  return next;
}

export function MatchPairsEngine({
  title,
  topic,
  grade,
  pairs,
  kind = "match-the-pairs",
}: MatchPairsEngineProps) {
  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);
  const [chosenLeft, setChosenLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function pickRight(id: string) {
    if (!chosenLeft || matched.includes(id)) {
      return;
    }
    if (chosenLeft === id) {
      const next = [...matched, id];
      setMatched(next);
      if (next.length >= pairs.length) {
        setDone(true);
      }
    }
    setChosenLeft(null);
  }

  if (done) {
    return (
      <PlayDone
        kind={kind}
        grade={grade}
        score={matched.length}
        total={pairs.length}
        onRestart={() => {
          setMatched([]);
          setChosenLeft(null);
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PlayHeader
          kind={kind}
          title={title}
          topic={topic}
          grade={grade}
          index={matched.length}
          total={pairs.length}
          asCount
        />
        <div className="quiz-board rounded-[1.75rem] p-5 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              {left.map((item) => (
                <button
                  key={`l-${item.id}`}
                  type="button"
                  disabled={matched.includes(item.id)}
                  className={`quiz-option ${
                    matched.includes(item.id)
                      ? "quiz-option-right"
                      : chosenLeft === item.id
                        ? "quiz-option-right"
                        : "quiz-option-idle"
                  }`}
                  onClick={() => setChosenLeft(item.id)}
                >
                  {item.left}
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              {right.map((item) => (
                <button
                  key={`r-${item.id}`}
                  type="button"
                  disabled={matched.includes(item.id)}
                  className={`quiz-option ${
                    matched.includes(item.id)
                      ? "quiz-option-right"
                      : "quiz-option-idle"
                  }`}
                  onClick={() => pickRight(item.id)}
                >
                  {item.right}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
