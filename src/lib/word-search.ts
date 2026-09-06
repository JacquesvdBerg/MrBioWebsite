import { createRng, gridWord } from "@/lib/grid-word";

export type WordSearchWord = {
  id: string;
  text: string;
};

export type WordSearchPayload = {
  words: WordSearchWord[];
};

export type WordSearchPlacement = {
  id: string;
  text: string;
  cells: Array<{ row: number; col: number }>;
};

const directions = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: -1, dc: 1 },
] as const;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseWordSearchPayload(value: unknown): WordSearchPayload {
  if (!value || typeof value !== "object") {
    return { words: [] };
  }

  const raw = value as { words?: unknown };
  const source = Array.isArray(raw.words) ? raw.words : [];

  const words = source.flatMap((item, index) => {
    const text =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
          ? asString((item as { text?: unknown }).text)
          : "";
    const clean = text.trim();
    if (!clean || gridWord(clean).length < 3) {
      return [];
    }

    const id =
      item && typeof item === "object"
        ? asString((item as { id?: unknown }).id)
        : "";

    return [{ id: id || `w-${index}`, text: clean }];
  });

  return { words };
}

export function buildWordSearchGrid(
  words: WordSearchWord[],
  seed: string,
): { grid: string[][]; placements: WordSearchPlacement[] } {
  const rng = createRng(seed);
  const prepared = words
    .map((word) => ({ ...word, key: gridWord(word.text) }))
    .filter((word) => word.key.length >= 3)
    .sort((left, right) => right.key.length - left.key.length);

  const longest = prepared[0]?.key.length ?? 8;
  const size = Math.min(
    16,
    Math.max(10, longest + 1, Math.ceil(Math.sqrt(prepared.length * 8))),
  );
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ""),
  );
  const placements: WordSearchPlacement[] = [];

  for (const word of prepared) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt += 1) {
      const direction = directions[Math.floor(rng() * directions.length)];
      if (!direction) {
        continue;
      }
      const row = Math.floor(rng() * size);
      const col = Math.floor(rng() * size);
      const lastRow = row + direction.dr * (word.key.length - 1);
      const lastCol = col + direction.dc * (word.key.length - 1);
      if (lastRow < 0 || lastRow >= size || lastCol < 0 || lastCol >= size) {
        continue;
      }

      const cells: Array<{ row: number; col: number }> = [];
      let fits = true;
      for (let index = 0; index < word.key.length; index += 1) {
        const nextRow = row + direction.dr * index;
        const nextCol = col + direction.dc * index;
        const current = grid[nextRow]?.[nextCol];
        const letter = word.key[index];
        if (current && current !== letter) {
          fits = false;
          break;
        }
        cells.push({ row: nextRow, col: nextCol });
      }

      if (!fits) {
        continue;
      }

      cells.forEach((cell, index) => {
        const letter = word.key[index];
        if (letter && grid[cell.row]) {
          grid[cell.row][cell.col] = letter;
        }
      });
      placements.push({ id: word.id, text: word.text, cells });
      placed = true;
    }
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!grid[row]?.[col]) {
        const letter = alphabet[Math.floor(rng() * alphabet.length)];
        if (grid[row] && letter) {
          grid[row][col] = letter;
        }
      }
    }
  }

  return { grid, placements };
}
