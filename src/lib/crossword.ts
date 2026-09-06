import { gridWord } from "@/lib/grid-word";

export type CrosswordEntry = {
  id: string;
  clue: string;
  answer: string;
  hint?: string;
};

export type CrosswordPayload = {
  entries: CrosswordEntry[];
};

export type CrosswordPlacement = CrosswordEntry & {
  row: number;
  col: number;
  direction: "across" | "down";
  number: number;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseCrosswordPayload(value: unknown): CrosswordPayload {
  if (!value || typeof value !== "object") {
    return { entries: [] };
  }

  const raw = value as { entries?: unknown };
  const source = Array.isArray(raw.entries) ? raw.entries : [];

  const entries = source.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    const clue = asString(row.clue).trim();
    const answer = asString(row.answer).trim();
    const hint = asString(row.hint).trim();
    if (!clue || gridWord(answer).length < 2) {
      return [];
    }
    return [
      {
        id: asString(row.id) || `c-${index}`,
        clue,
        answer,
        hint: hint || undefined,
      },
    ];
  });

  return { entries };
}

function canPlace(
  grid: Map<string, string>,
  answer: string,
  row: number,
  col: number,
  direction: "across" | "down",
) {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  let overlap = 0;

  for (let index = 0; index < answer.length; index += 1) {
    const key = `${row + dr * index},${col + dc * index}`;
    const existing = grid.get(key);
    const letter = answer[index];
    if (existing && existing !== letter) {
      return false;
    }
    if (existing && existing === letter) {
      overlap += 1;
    }
  }

  return overlap > 0 || grid.size === 0;
}

function writeWord(
  grid: Map<string, string>,
  answer: string,
  row: number,
  col: number,
  direction: "across" | "down",
) {
  const dr = direction === "down" ? 1 : 0;
  const dc = direction === "across" ? 1 : 0;
  for (let index = 0; index < answer.length; index += 1) {
    const letter = answer[index];
    if (letter) {
      grid.set(`${row + dr * index},${col + dc * index}`, letter);
    }
  }
}

export function packCrossword(entries: CrosswordEntry[]): CrosswordPlacement[] {
  const prepared = entries
    .map((entry) => ({ ...entry, key: gridWord(entry.answer) }))
    .filter((entry) => entry.key.length >= 2)
    .sort((left, right) => right.key.length - left.key.length);

  const grid = new Map<string, string>();
  const placed: Array<
    Omit<CrosswordPlacement, "number"> & { key: string }
  > = [];

  const first = prepared[0];
  if (!first) {
    return [];
  }

  writeWord(grid, first.key, 0, 0, "across");
  placed.push({
    ...first,
    answer: first.answer,
    row: 0,
    col: 0,
    direction: "across",
    key: first.key,
  });

  for (const entry of prepared.slice(1)) {
    let found:
      | { row: number; col: number; direction: "across" | "down" }
      | null = null;

    outer: for (const existing of placed) {
      for (let existingIndex = 0; existingIndex < existing.key.length; existingIndex += 1) {
        const letter = existing.key[existingIndex];
        if (!letter) {
          continue;
        }
        for (let nextIndex = 0; nextIndex < entry.key.length; nextIndex += 1) {
          if (entry.key[nextIndex] !== letter) {
            continue;
          }

          const across = {
            row: existing.row + (existing.direction === "down" ? existingIndex : 0) - 0,
            col:
              existing.col +
              (existing.direction === "across" ? existingIndex : 0) -
              nextIndex,
            direction: "across" as const,
          };
          const down = {
            row:
              existing.row +
              (existing.direction === "down" ? existingIndex : 0) -
              nextIndex,
            col: existing.col + (existing.direction === "across" ? existingIndex : 0),
            direction: "down" as const,
          };

          for (const candidate of [across, down]) {
            if (
              canPlace(
                grid,
                entry.key,
                candidate.row,
                candidate.col,
                candidate.direction,
              )
            ) {
              found = candidate;
              break outer;
            }
          }
        }
      }
    }

    if (!found) {
      continue;
    }

    writeWord(grid, entry.key, found.row, found.col, found.direction);
    placed.push({
      ...entry,
      row: found.row,
      col: found.col,
      direction: found.direction,
      key: entry.key,
    });
  }

  const numbered = [...placed].sort((left, right) =>
    left.row === right.row ? left.col - right.col : left.row - right.row,
  );
  const numbers = new Map<string, number>();
  let nextNumber = 1;
  return numbered.map((item) => {
    const key = `${item.row},${item.col}`;
    const existing = numbers.get(key);
    const number = existing ?? nextNumber;
    if (!existing) {
      numbers.set(key, nextNumber);
      nextNumber += 1;
    }
    return {
      id: item.id,
      clue: item.clue,
      answer: item.answer,
      hint: item.hint,
      row: item.row,
      col: item.col,
      direction: item.direction,
      number,
    };
  });
}

export type CrosswordCell = {
  key: string;
  row: number;
  col: number;
  letter: string;
  number?: number;
  acrossId?: string;
  downId?: string;
};

export function crosswordHint(entry: Pick<CrosswordEntry, "hint" | "answer">) {
  const stored = entry.hint?.trim();
  if (stored) {
    return stored;
  }
  const word = gridWord(entry.answer);
  if (!word) {
    return "";
  }
  return `${word.length} letters, begin met ${word[0]}`;
}

export function wordCells(placement: CrosswordPlacement) {
  const answer = gridWord(placement.answer);
  const dr = placement.direction === "down" ? 1 : 0;
  const dc = placement.direction === "across" ? 1 : 0;
  return answer.split("").map((letter, index) => ({
    row: placement.row + dr * index,
    col: placement.col + dc * index,
    letter,
  }));
}

export function buildCrosswordBoard(entries: CrosswordEntry[]) {
  const placements = packCrossword(entries);
  if (placements.length === 0) {
    return {
      placements,
      rows: 0,
      cols: 0,
      cells: [] as Array<CrosswordCell | null>,
    };
  }

  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -Infinity;
  let maxCol = -Infinity;
  const raw = new Map<string, CrosswordCell>();

  for (const placement of placements) {
    for (const cell of wordCells(placement)) {
      minRow = Math.min(minRow, cell.row);
      minCol = Math.min(minCol, cell.col);
      maxRow = Math.max(maxRow, cell.row);
      maxCol = Math.max(maxCol, cell.col);
      const key = `${cell.row},${cell.col}`;
      const existing = raw.get(key);
      raw.set(key, {
        key,
        row: cell.row,
        col: cell.col,
        letter: cell.letter,
        number: cell.row === placement.row && cell.col === placement.col
          ? placement.number
          : existing?.number,
        acrossId:
          placement.direction === "across"
            ? placement.id
            : existing?.acrossId,
        downId:
          placement.direction === "down" ? placement.id : existing?.downId,
      });
    }
  }

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  const shifted = placements.map((placement) => ({
    ...placement,
    row: placement.row - minRow,
    col: placement.col - minCol,
  }));
  const cells: Array<CrosswordCell | null> = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const source = raw.get(`${row + minRow},${col + minCol}`);
      cells.push(
        source
          ? {
              ...source,
              key: `${row},${col}`,
              row,
              col,
            }
          : null,
      );
    }
  }

  return { placements: shifted, rows, cols, cells };
}
