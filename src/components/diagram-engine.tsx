"use client";

import { useMemo, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import type { DiagramPart } from "@/lib/diagram";

type DiagramEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  parts: DiagramPart[];
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

export function DiagramEngine({
  title,
  topic,
  grade,
  parts,
}: DiagramEngineProps) {
  const labels = useMemo(() => shuffle(parts), [parts]);
  const [selected, setSelected] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const unused = labels.filter((part) => !Object.values(assigned).includes(part.id));
  const score = parts.filter((part) => assigned[part.id] === part.id).length;

  function assign(slotId: string) {
    if (!selected) {
      return;
    }
    setAssigned((current) => ({ ...current, [slotId]: selected }));
    setSelected(null);
  }

  if (done) {
    return (
      <PlayDone
        kind="diagram"
        grade={grade}
        score={score}
        total={parts.length}
        onRestart={() => {
          setAssigned({});
          setSelected(null);
          setDone(false);
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PlayHeader kind="diagram" title={title} topic={topic} grade={grade} />
        <div className="quiz-board rounded-[1.75rem] p-5 sm:p-8">
          <p className="text-sm text-muted">
            Kies ’n etiket, dan die genommerde deel waar dit hoort.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {unused.map((part) => (
              <button
                key={part.id}
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-bold ${
                  selected === part.id
                    ? "bg-navy text-white"
                    : "bg-white text-navy"
                }`}
                onClick={() => setSelected(part.id)}
              >
                {part.label}
              </button>
            ))}
          </div>
          <ol className="mt-6 grid gap-3">
            {parts.map((part, index) => {
              const chosenId = assigned[part.id];
              const chosen = parts.find((item) => item.id === chosenId);
              return (
                <li key={part.id}>
                  <button
                    type="button"
                    className="quiz-option quiz-option-idle w-full"
                    onClick={() => assign(part.id)}
                  >
                    <span className="quiz-letter">{index + 1}</span>
                    <span className="flex-1 text-left">
                      <span className="block font-semibold">{part.hint}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {chosen ? chosen.label : "Kies ’n etiket"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            className="quiz-cta mt-6"
            onClick={() => setDone(true)}
          >
            Kontroleer
          </button>
        </div>
      </div>
    </div>
  );
}
