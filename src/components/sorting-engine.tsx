"use client";

import { useMemo, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import type { SortingCategory, SortingItem } from "@/lib/sorting";

type SortingEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  categories: SortingCategory[];
  items: SortingItem[];
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

export function SortingEngine({
  title,
  topic,
  grade,
  categories,
  items,
}: SortingEngineProps) {
  const pile = useMemo(() => shuffle(items), [items]);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const remaining = pile.filter((item) => !placed[item.id]);
  const score = items.filter((item) => placed[item.id] === item.categoryId)
    .length;

  function drop(categoryId: string) {
    if (!selected) {
      return;
    }
    setPlaced((current) => ({ ...current, [selected]: categoryId }));
    setSelected(null);
    if (Object.keys(placed).length + 1 >= items.length) {
      setDone(true);
    }
  }

  if (done) {
    return (
      <PlayDone
        kind="sorting"
        grade={grade}
        score={score}
        total={items.length}
        onRestart={() => {
          setPlaced({});
          setSelected(null);
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PlayHeader
          kind="sorting"
          title={title}
          topic={topic}
          grade={grade}
          index={Object.keys(placed).length}
          total={items.length}
          asCount
        />
        <div className="quiz-board rounded-[1.75rem] p-5 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {remaining.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-bold ${
                  selected === item.id
                    ? "bg-navy text-white"
                    : "bg-white text-navy"
                }`}
                onClick={() => setSelected(item.id)}
              >
                {item.text}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="min-h-28 rounded-2xl border-2 border-dashed border-navy/20 bg-white p-4 text-left"
                onClick={() => drop(category.id)}
              >
                <p className="font-display text-xl font-bold text-navy">
                  {category.title}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {
                    items.filter((item) => placed[item.id] === category.id)
                      .length
                  }{" "}
                  items
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
