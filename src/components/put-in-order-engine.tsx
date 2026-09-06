"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import type { OrderItem } from "@/lib/put-in-order";

type PutInOrderEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  items: OrderItem[];
};

type StepRow = {
  id: string;
  text: string;
};

function shuffle(items: string[]): StepRow[] {
  const next = items.map((text, index) => ({ id: `s-${index}`, text }));
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    const other = next[swap];
    if (current !== undefined && other !== undefined) {
      next[index] = other;
      next[swap] = current;
    }
  }
  const same =
    next.map((row) => row.text).join("\n") === items.join("\n");
  return same ? [...next].reverse() : next;
}

function moveRow(rows: StepRow[], from: number, to: number) {
  if (from === to || to < 0 || to >= rows.length) {
    return rows;
  }
  const next = [...rows];
  const [item] = next.splice(from, 1);
  if (!item) {
    return rows;
  }
  next.splice(to, 0, item);
  return next;
}

export function PutInOrderEngine({
  title,
  topic,
  grade,
  items,
}: PutInOrderEngineProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const current = items[index];
  const [order, setOrder] = useState<StepRow[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);
  const overRef = useRef<number | null>(null);

  useEffect(() => {
    setOrder(items[0] ? shuffle(items[0].steps) : []);
  }, [items]);

  const correct = useMemo(
    () =>
      current?.steps.join("\n") ===
      order.map((row) => row.text).join("\n"),
    [current, order],
  );

  function move(from: number, direction: -1 | 1) {
    setOrder((rows) => moveRow(rows, from, from + direction));
  }

  function rowFromPoint(clientX: number, clientY: number) {
    const node = document.elementFromPoint(clientX, clientY);
    const target =
      node instanceof Element ? node.closest("[data-order-index]") : null;
    if (!target) {
      return null;
    }
    const value = Number(target.getAttribute("data-order-index"));
    return Number.isInteger(value) ? value : null;
  }

  function onPointerDown(
    stepIndex: number,
    event: PointerEvent<HTMLLIElement>,
  ) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = stepIndex;
    overRef.current = stepIndex;
    setDragging(stepIndex);
    setOver(stepIndex);
  }

  function onPointerMove(event: PointerEvent<HTMLLIElement>) {
    if (dragFrom.current === null) {
      return;
    }
    const nextOver = rowFromPoint(event.clientX, event.clientY);
    if (nextOver !== null) {
      overRef.current = nextOver;
      setOver(nextOver);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLLIElement>) {
    const from = dragFrom.current;
    if (from === null) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    const to = overRef.current ?? rowFromPoint(event.clientX, event.clientY);
    if (to !== null) {
      setOrder((rows) => moveRow(rows, from, to));
    }
    dragFrom.current = null;
    overRef.current = null;
    setDragging(null);
    setOver(null);
  }

  function submit() {
    const earned = correct ? score + 1 : score;
    if (index + 1 >= items.length) {
      setScore(earned);
      setDone(true);
      return;
    }
    const next = items[index + 1];
    setScore(earned);
    setIndex((value) => value + 1);
    setOrder(next ? shuffle(next.steps) : []);
    dragFrom.current = null;
    overRef.current = null;
    setDragging(null);
    setOver(null);
  }

  if (done || !current) {
    return (
      <PlayDone
        kind="put-in-order"
        grade={grade}
        score={score}
        total={items.length}
        onRestart={() => {
          setIndex(0);
          setScore(0);
          setDone(false);
          setOrder(items[0] ? shuffle(items[0].steps) : []);
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <PlayHeader
          kind="put-in-order"
          title={title}
          topic={topic}
          grade={grade}
          index={index}
          total={items.length}
        />
        <div className="quiz-board rounded-[1.75rem] p-5 sm:p-8">
          <p className="quiz-prompt font-display text-2xl font-bold text-navy">
            {current.prompt}
          </p>
          <p className="mt-2 text-sm text-muted">
            Sleep die stappe in die regte volgorde.
          </p>
          <ol className="mt-5 grid gap-2">
            {order.map((step, stepIndex) => {
              const isDragging = dragging === stepIndex;
              const isOver =
                over === stepIndex && dragging !== null && dragging !== stepIndex;
              return (
                <li
                  key={step.id}
                  data-order-index={stepIndex}
                  className={`order-step${isDragging ? " is-dragging" : ""}${isOver ? " is-over" : ""}`}
                  onPointerDown={(event) => onPointerDown(stepIndex, event)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <span className="order-grip" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="w-6 font-display font-extrabold text-green">
                    {stepIndex + 1}
                  </span>
                  <span className="flex-1 font-semibold text-navy">
                    {step.text}
                  </span>
                  <button
                    type="button"
                    className="text-sm font-bold text-navy"
                    aria-label="Skuif op"
                    onClick={() => move(stepIndex, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold text-navy"
                    aria-label="Skuif af"
                    onClick={() => move(stepIndex, 1)}
                  >
                    ↓
                  </button>
                </li>
              );
            })}
          </ol>
          <button type="button" className="quiz-cta mt-6" onClick={submit}>
            {index + 1 >= items.length ? "Sien telling" : "Volgende"}
          </button>
        </div>
      </div>
    </div>
  );
}
