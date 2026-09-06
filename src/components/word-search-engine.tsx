"use client";

import { useMemo, useRef, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import {
  buildWordSearchGrid,
  type WordSearchWord,
} from "@/lib/word-search";

type Cell = {
  row: number;
  col: number;
};

type WordSearchEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  slug: string;
  words: WordSearchWord[];
};

function cellKey(cell: Cell) {
  return `${cell.row}:${cell.col}`;
}

function cellsMatch(selected: Cell[], target: Cell[]) {
  if (selected.length !== target.length) {
    return false;
  }

  const wanted = new Set(target.map(cellKey));
  return selected.every((cell) => wanted.has(cellKey(cell)));
}

function lineCells(start: Cell, end: Cell) {
  const dr = Math.sign(end.row - start.row);
  const dc = Math.sign(end.col - start.col);
  const rows = Math.abs(end.row - start.row);
  const cols = Math.abs(end.col - start.col);

  if (rows !== 0 && cols !== 0 && rows !== cols) {
    return [];
  }

  const length = Math.max(rows, cols);
  const cells: Cell[] = [];
  for (let index = 0; index <= length; index += 1) {
    cells.push({
      row: start.row + dr * index,
      col: start.col + dc * index,
    });
  }
  return cells;
}

function cellFromPoint(clientX: number, clientY: number): Cell | null {
  const node = document.elementFromPoint(clientX, clientY);
  const target =
    node instanceof Element ? node.closest("[data-ws-row]") : null;
  if (!target) {
    return null;
  }

  const row = Number(target.getAttribute("data-ws-row"));
  const col = Number(target.getAttribute("data-ws-col"));
  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    return null;
  }

  return { row, col };
}

export function WordSearchEngine({
  title,
  topic,
  grade,
  slug,
  words,
}: WordSearchEngineProps) {
  const { grid, placements } = useMemo(
    () => buildWordSearchGrid(words, slug),
    [slug, words],
  );
  const dragStart = useRef<Cell | null>(null);
  const dragEnd = useRef<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [preview, setPreview] = useState<Cell[]>([]);
  const [done, setDone] = useState(false);

  function finishDrag() {
    const start = dragStart.current;
    const end = dragEnd.current ?? start;
    dragStart.current = null;
    dragEnd.current = null;
    setPreview([]);

    if (!start || !end || done) {
      return;
    }

    const selected = lineCells(start, end);
    const match = placements.find(
      (item) =>
        !found.includes(item.id) &&
        (cellsMatch(selected, item.cells) ||
          cellsMatch([...selected].reverse(), item.cells)),
    );

    if (!match) {
      return;
    }

    const next = [...found, match.id];
    setFound(next);
    if (next.length >= placements.length) {
      setDone(true);
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (done || event.button !== 0) {
      return;
    }

    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = cell;
    dragEnd.current = cell;
    setPreview([cell]);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start) {
      return;
    }

    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) {
      return;
    }

    const line = lineCells(start, cell);
    if (!line.length) {
      return;
    }

    dragEnd.current = cell;
    setPreview(line);
  }

  const foundCells = new Set(
    placements
      .filter((item) => found.includes(item.id))
      .flatMap((item) => item.cells.map(cellKey)),
  );
  const previewCells = new Set(preview.map(cellKey));

  if (done) {
    return (
      <PlayDone
        kind="word-search"
        grade={grade}
        score={found.length}
        total={placements.length}
        onRestart={() => {
          setFound([]);
          setDone(false);
          setPreview([]);
          dragStart.current = null;
          dragEnd.current = null;
        }}
      />
    );
  }

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <PlayHeader
          kind="word-search"
          title={title}
          topic={topic}
          grade={grade}
          index={found.length}
          total={placements.length}
          asCount
        />
        <div className="quiz-board rounded-[1.75rem] p-4 sm:p-6">
          <p className="text-sm text-muted">
            Sleep jou vinger of muis oor ’n woord in ’n reguit lyn.
          </p>
          <div className="mt-4 overflow-x-auto">
            <div
              role="grid"
              className="ws-grid"
              style={{
                ["--ws-cols" as string]: String(grid[0]?.length ?? 0),
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
            >
              {grid.map((line, row) =>
                line.map((letter, col) => {
                  const key = `${row}:${col}`;
                  return (
                    <div
                      key={key}
                      role="gridcell"
                      data-ws-row={row}
                      data-ws-col={col}
                      className={`ws-cell${foundCells.has(key) ? " is-found" : ""}${previewCells.has(key) ? " is-preview" : ""}`}
                    >
                      {letter}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {placements.map((item) => (
              <li
                key={item.id}
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  found.includes(item.id)
                    ? "bg-green text-white line-through"
                    : "bg-white text-navy"
                }`}
              >
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
