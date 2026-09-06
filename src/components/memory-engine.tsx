"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import type { PairItem } from "@/lib/pairs";

type MemoryEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  pairs: PairItem[];
};

type Card = {
  key: string;
  pairId: string;
  text: string;
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

export function MemoryEngine({ title, topic, grade, pairs }: MemoryEngineProps) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        pairs.flatMap((pair) => [
          { key: `${pair.id}-a`, pairId: pair.id, text: pair.left },
          { key: `${pair.id}-b`, pairId: pair.id, text: pair.right },
        ]),
      ),
    [pairs],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  function flip(key: string, pairId: string) {
    if (
      matched.includes(pairId) ||
      open.includes(key) ||
      open.length === 2 ||
      wrong.length > 0
    ) {
      return;
    }

    const nextOpen = [...open, key];
    setOpen(nextOpen);
    if (nextOpen.length < 2) {
      return;
    }

    const first = cards.find((card) => card.key === nextOpen[0]);
    const second = cards.find((card) => card.key === nextOpen[1]);
    if (first && second && first.pairId === second.pairId) {
      const next = [...matched, first.pairId];
      setMatched(next);
      setOpen([]);
      if (next.length >= pairs.length) {
        timerRef.current = window.setTimeout(() => setDone(true), 700);
      }
      return;
    }

    setWrong(nextOpen);
    timerRef.current = window.setTimeout(() => {
      setOpen([]);
      setWrong([]);
    }, 800);
  }

  if (done) {
    return (
      <PlayDone
        kind="memory-cards"
        grade={grade}
        score={matched.length}
        total={pairs.length}
        onRestart={() => {
          window.clearTimeout(timerRef.current);
          setMatched([]);
          setOpen([]);
          setWrong([]);
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PlayHeader
          kind="memory-cards"
          title={title}
          topic={topic}
          grade={grade}
          index={matched.length}
          total={pairs.length}
          asCount
        />
        <div className="quiz-board rounded-[1.75rem] p-5 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map((card) => {
              const isMatched = matched.includes(card.pairId);
              const isWrong = wrong.includes(card.key);
              const revealed = open.includes(card.key) || isMatched;
              return (
                <button
                  key={card.key}
                  type="button"
                  className={`memory-card${revealed ? " is-open" : ""}${isMatched ? " is-matched" : ""}${isWrong ? " is-wrong" : ""}`}
                  onClick={() => flip(card.key, card.pairId)}
                >
                  {revealed ? card.text : "?"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
