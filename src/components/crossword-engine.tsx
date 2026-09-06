"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayDone, PlayHeader } from "@/components/play-frame";
import {
  buildCrosswordBoard,
  crosswordHint,
  wordCells,
  type CrosswordEntry,
  type CrosswordPlacement,
} from "@/lib/crossword";
import { gridWord } from "@/lib/grid-word";

type CrosswordEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  entries: CrosswordEntry[];
};

type Direction = "across" | "down";

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

export function CrosswordEngine({
  title,
  topic,
  grade,
  entries,
}: CrosswordEngineProps) {
  const board = useMemo(() => buildCrosswordBoard(entries), [entries]);
  const [fill, setFill] = useState<Record<string, string>>({});
  const [focus, setFocus] = useState<{
    row: number;
    col: number;
    direction: Direction;
  } | null>(null);
  const [done, setDone] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(
    () => new Set(),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const activeWord = useMemo(() => {
    if (!focus) {
      return null;
    }
    const cell = board.cells[focus.row * board.cols + focus.col];
    const id =
      focus.direction === "across" ? cell?.acrossId : cell?.downId;
    return board.placements.find((item) => item.id === id) ?? null;
  }, [board, focus]);

  const activeKeys = useMemo(() => {
    if (!activeWord) {
      return new Set<string>();
    }
    return new Set(
      wordCells(activeWord).map((cell) => cellKey(cell.row, cell.col)),
    );
  }, [activeWord]);

  const solvedIds = useMemo(() => {
    return new Set(
      board.placements
        .filter((placement) =>
          wordCells(placement).every(
            (cell) => fill[cellKey(cell.row, cell.col)] === cell.letter,
          ),
        )
        .map((placement) => placement.id),
    );
  }, [board.placements, fill]);

  const lockedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const placement of board.placements) {
      if (!solvedIds.has(placement.id)) {
        continue;
      }
      for (const cell of wordCells(placement)) {
        keys.add(cellKey(cell.row, cell.col));
      }
    }
    return keys;
  }, [board.placements, solvedIds]);

  const score = solvedIds.size;

  const missed = useMemo(() => {
    return board.placements.filter((placement) => !solvedIds.has(placement.id));
  }, [board.placements, solvedIds]);

  function ownAttempt(placement: CrosswordPlacement) {
    const cells = wordCells(placement);
    const typedOwn = cells.some((cell) => {
      const key = cellKey(cell.row, cell.col);
      return Boolean(fill[key]) && !lockedKeys.has(key);
    });
    if (!typedOwn) {
      return "";
    }
    return cells
      .map((cell) => fill[cellKey(cell.row, cell.col)] || "·")
      .join("");
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [focus]);

  useEffect(() => {
    if (board.placements.length > 0 && solvedIds.size === board.placements.length) {
      setDone(true);
    }
  }, [board.placements.length, solvedIds.size]);

  function selectCell(row: number, col: number) {
    const cell = board.cells[row * board.cols + col];
    if (!cell) {
      return;
    }

    const same = focus?.row === row && focus?.col === col;
    let direction: Direction = focus?.direction ?? "across";
    if (same) {
      direction = direction === "across" ? "down" : "across";
    } else if (cell.acrossId && !cell.downId) {
      direction = "across";
    } else if (cell.downId && !cell.acrossId) {
      direction = "down";
    } else if (!cell.acrossId && cell.downId) {
      direction = "down";
    }

    if (direction === "across" && !cell.acrossId) {
      direction = "down";
    }
    if (direction === "down" && !cell.downId) {
      direction = "across";
    }

    setFocus({ row, col, direction });
  }

  function selectWord(placement: CrosswordPlacement) {
    const firstOpen =
      wordCells(placement).find(
        (cell) => !lockedKeys.has(cellKey(cell.row, cell.col)),
      ) ?? wordCells(placement)[0];
    if (!firstOpen) {
      return;
    }
    setFocus({
      row: firstOpen.row,
      col: firstOpen.col,
      direction: placement.direction,
    });
  }

  function move(
    row: number,
    col: number,
    direction: Direction,
    step: number,
    skipLocked = false,
  ) {
    let nextRow = row;
    let nextCol = col;
    for (let hop = 0; hop < 40; hop += 1) {
      nextRow += direction === "down" ? step : 0;
      nextCol += direction === "across" ? step : 0;
      const next = board.cells[nextRow * board.cols + nextCol];
      if (!next) {
        return;
      }
      if (!skipLocked || !lockedKeys.has(cellKey(nextRow, nextCol))) {
        setFocus({ row: nextRow, col: nextCol, direction });
        return;
      }
    }
  }

  function onKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!focus) {
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      const key = cellKey(focus.row, focus.col);
      if (lockedKeys.has(key)) {
        move(focus.row, focus.col, focus.direction, -1, true);
        return;
      }
      if (fill[key]) {
        setFill((current) => ({ ...current, [key]: "" }));
        return;
      }
      move(focus.row, focus.col, focus.direction, -1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(focus.row, focus.col, "across", 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(focus.row, focus.col, "across", -1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(focus.row, focus.col, "down", 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(focus.row, focus.col, "down", -1);
      return;
    }

    const letter = gridWord(event.key);
    if (letter.length !== 1) {
      return;
    }

    event.preventDefault();
    const key = cellKey(focus.row, focus.col);
    if (!lockedKeys.has(key)) {
      setFill((current) => ({
        ...current,
        [key]: letter,
      }));
    }
    move(focus.row, focus.col, focus.direction, 1, true);
  }

  if (done) {
    return (
      <PlayDone
        kind="crossword"
        grade={grade}
        score={score}
        total={board.placements.length}
        onRestart={() => {
          setFill({});
          setDone(false);
          setFocus(null);
          setRevealedHints(new Set());
        }}
      >
        {missed.length > 0 ? (
          <div className="mt-6 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
              Gemis of oopgelaat
            </p>
            <ol className="mt-3 space-y-3">
              {missed.map((item) => {
                const attempt = ownAttempt(item);
                return (
                  <li key={item.id} className="quiz-review">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      {item.number}{" "}
                      {item.direction === "across" ? "Dwars" : "Af"} ·{" "}
                      {attempt ? "Verkeerd" : "Oop gelaat"}
                    </p>
                    <p className="mt-1 font-semibold text-white">{item.clue}</p>
                    {attempt ? (
                      <p className="mt-2 text-sm text-white/70">
                        Jou poging:{" "}
                        <span className="font-bold tracking-[0.18em] text-orange">
                          {attempt}
                        </span>
                      </p>
                    ) : null}
                    <p className="mt-2 font-display text-lg font-extrabold text-lime">
                      {gridWord(item.answer)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/75">
                      Wenk: {crosswordHint(item)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </PlayDone>
    );
  }

  const across = board.placements.filter((item) => item.direction === "across");
  const down = board.placements.filter((item) => item.direction === "down");

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <PlayHeader
          kind="crossword"
          title={title}
          topic={topic}
          grade={grade}
          index={score}
          total={board.placements.length}
          asCount
        />
        <div className="quiz-board rounded-[1.75rem] p-4 sm:p-6">
          <p className="text-sm text-muted">
            Tik die letters in. ’n Regte woord word groen en bly vas. Gebruik
            ’n wenk as jy vashaak.
          </p>
          {activeWord && !solvedIds.has(activeWord.id) ? (
            <div className="mt-3">
              {revealedHints.has(activeWord.id) ? (
                <p className="text-sm font-semibold text-navy">
                  Wenk: {crosswordHint(activeWord)}
                </p>
              ) : (
                <button
                  type="button"
                  className="rounded-full border border-navy/15 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-navy"
                  onClick={() => {
                    setRevealedHints((current) => {
                      const next = new Set(current);
                      next.add(activeWord.id);
                      return next;
                    });
                  }}
                >
                  Wys wenk
                </button>
              )}
            </div>
          ) : null}
          <input
            ref={inputRef}
            className="sr-only"
            value=""
            onChange={() => undefined}
            onKeyDown={onKey}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Kruiswoord letters"
          />

          {board.rows > 0 ? (
            <div className="xw-wrap mt-4">
              <div
                className="xw-grid"
                style={{
                  ["--xw-cols" as string]: String(board.cols),
                }}
              >
                {board.cells.map((cell, index) => {
                  if (!cell) {
                    return <div key={`b-${index}`} className="xw-block" />;
                  }

                  const key = cellKey(cell.row, cell.col);
                  const isFocus =
                    focus?.row === cell.row && focus?.col === cell.col;
                  const isWord = activeKeys.has(key);
                  const isSolved = lockedKeys.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`xw-cell${isWord ? " is-word" : ""}${isFocus ? " is-focus" : ""}${isSolved ? " is-solved" : ""}`}
                      onClick={() => selectCell(cell.row, cell.col)}
                    >
                      {cell.number ? (
                        <span className="xw-num">{cell.number}</span>
                      ) : null}
                      <span className="xw-letter">{fill[key] ?? ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Hierdie kruiswoord kon nie ’n rooster bou nie.
            </p>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ClueList
              title="Dwars"
              items={across}
              activeId={activeWord?.id}
              solvedIds={solvedIds}
              onSelect={selectWord}
            />
            <ClueList
              title="Af"
              items={down}
              activeId={activeWord?.id}
              solvedIds={solvedIds}
              onSelect={selectWord}
            />
          </div>

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

function ClueList({
  title,
  items,
  activeId,
  solvedIds,
  onSelect,
}: {
  title: string;
  items: CrosswordPlacement[];
  activeId?: string;
  solvedIds: Set<string>;
  onSelect: (item: CrosswordPlacement) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green">
        {title}
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((item) => {
          const solved = solvedIds.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                  solved
                    ? "bg-green text-white"
                    : activeId === item.id
                      ? "bg-navy text-white"
                      : "bg-white text-navy"
                }`}
                onClick={() => onSelect(item)}
              >
                <span>
                  {item.number}. {item.clue}
                </span>
                {solved ? <span className="text-[11px] uppercase">Reg</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
