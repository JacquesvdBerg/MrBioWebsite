export const optionLetters = ["A", "B", "C", "D", "E", "F"] as const;

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
};

export type QuizPayload = {
  questions: QuizQuestion[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function parseQuizPayload(value: unknown): QuizPayload {
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
    const optionsRaw = Array.isArray(question.options) ? question.options : [];
    const options = optionsRaw.flatMap((option, optionIndex) => {
      if (!option || typeof option !== "object") {
        return [];
      }

      const row = option as Record<string, unknown>;
      const text = asString(row.text).trim();
      if (!text) {
        return [];
      }

      return [
        {
          id: asString(row.id) || `opt-${optionIndex}`,
          text,
        },
      ];
    });

    const prompt = asString(question.prompt).trim();
    if (!prompt || options.length < 2) {
      return [];
    }

    const correctId =
      asString(question.correctId) || options[0]?.id || "";

    return [
      {
        id: asString(question.id) || `q-${index}`,
        prompt,
        options,
        correctId,
        explanation: asString(question.explanation).trim(),
      },
    ];
  });

  return { questions };
}

export function emptyQuizQuestion(): QuizQuestion {
  const options = [0, 1, 2, 3].map(() => ({
    id: crypto.randomUUID(),
    text: "",
  }));

  return {
    id: crypto.randomUUID(),
    prompt: "",
    options,
    correctId: options[0]?.id ?? "",
    explanation: "",
  };
}
