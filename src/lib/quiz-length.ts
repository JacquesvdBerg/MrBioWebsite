export const quizLengths = [5, 10, 15, 25] as const;
export const quizBankSize = 25;

export type QuizLength = (typeof quizLengths)[number];

export function parseQuizLength(value: unknown, available: number): QuizLength {
  const requested = Number(value);
  const allowed = quizLengths.filter((length) => length <= available);

  if (allowed.includes(requested as QuizLength)) {
    return requested as QuizLength;
  }

  return allowed.includes(10) ? 10 : (allowed[0] ?? 5);
}

export function sliceQuiz<T>(items: T[], length: number) {
  return items.slice(0, Math.min(length, items.length));
}
