export type TrueOrFalseQuestion = {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
};

export type TrueOrFalsePayload = {
  questions: TrueOrFalseQuestion[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseTrueOrFalsePayload(value: unknown): TrueOrFalsePayload {
  if (!value || typeof value !== "object") {
    return { questions: [] };
  }

  const raw = value as { questions?: unknown };
  if (!Array.isArray(raw.questions)) {
    return { questions: [] };
  }

  const questions = raw.questions.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const question = item as Record<string, unknown>;
    const statement = asString(question.statement).trim();
    if (!statement) {
      return [];
    }

    return [
      {
        id: asString(question.id) || `q-${index}`,
        statement,
        isTrue: question.isTrue === true,
        explanation: asString(question.explanation).trim(),
      },
    ];
  });

  return { questions };
}

export function emptyTrueOrFalseQuestion(): TrueOrFalseQuestion {
  return {
    id: crypto.randomUUID(),
    statement: "",
    isTrue: true,
    explanation: "",
  };
}
