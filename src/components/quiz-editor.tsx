"use client";

import { useMemo, useState } from "react";
import { saveQuiz } from "@/app/(admin)/admin/actions";
import { deskField } from "@/components/admin-ui";
import {
  emptyQuizQuestion,
  optionLetters,
  type QuizQuestion,
} from "@/lib/quiz";
import { grades } from "@/lib/site";

type QuizEditorProps = {
  slug?: string;
  title?: string;
  description?: string;
  grade?: number | null;
  topic?: string;
  themeSlug?: string | null;
  published?: boolean;
  questions?: QuizQuestion[];
  themeOptions: { slug: string; title: string }[];
};

export function QuizEditor({
  slug,
  title = "",
  description = "",
  grade = 10,
  topic = "",
  themeSlug = "",
  published = true,
  questions: initialQuestions,
  themeOptions,
}: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions && initialQuestions.length > 0
      ? initialQuestions
      : [emptyQuizQuestion()],
  );

  const payload = useMemo(() => JSON.stringify({ questions }), [questions]);

  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  }

  function updateOption(questionId: string, optionId: string, text: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, text } : option,
              ),
            }
          : question,
      ),
    );
  }

  return (
    <form action={saveQuiz} className="space-y-6">
      {slug ? <input type="hidden" name="existingSlug" value={slug} /> : null}
      <input type="hidden" name="payload" value={payload} />

      <section className="desk-panel desk-panel-body grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold md:col-span-2">
          Titel
          <input
            className={deskField}
            name="title"
            defaultValue={title}
            required
          />
        </label>
        {slug ? null : (
          <label className="text-sm font-semibold">
            Slug (opsioneel)
            <input className={deskField} name="slug" />
          </label>
        )}
        <label className="text-sm font-semibold md:col-span-2">
          Beskrywing
          <input
            className={deskField}
            name="description"
            defaultValue={description}
          />
        </label>
        <label className="text-sm font-semibold">
          Graad
            <select className={deskField} name="grade" defaultValue={grade ?? ""}>
            <option value="">—</option>
            {grades.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Onderwerp
          <input className={deskField} name="topic" defaultValue={topic} />
        </label>
        <label className="text-sm font-semibold">
          Tema
          <select
            className={deskField}
            name="theme_slug"
            defaultValue={themeSlug ?? ""}
          >
            <option value="">—</option>
            {themeOptions.map((theme) => (
              <option key={theme.slug} value={theme.slug}>
                {theme.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={published}
          />
          Publiseer
        </label>
      </section>

      {questions.map((question, index) => (
        <section
          key={question.id}
          className="desk-panel desk-panel-body space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-white">
              Vraag {index + 1}
            </h2>
            {questions.length > 1 ? (
              <button
                type="button"
                className="text-xs font-semibold text-orange"
                onClick={() =>
                  setQuestions((current) =>
                    current.filter((item) => item.id !== question.id),
                  )
                }
              >
                Verwyder
              </button>
            ) : null}
          </div>
          <label className="block text-sm font-semibold">
            Vraag
            <textarea
              className={`${deskField} min-h-20`}
              value={question.prompt}
              onChange={(event) =>
                updateQuestion(question.id, { prompt: event.target.value })
              }
            />
          </label>
          <div className="grid gap-2">
            {question.options.map((option, optionIndex) => (
              <label
                key={option.id}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctId === option.id}
                  onChange={() =>
                    updateQuestion(question.id, { correctId: option.id })
                  }
                />
                <span className="w-5">{optionLetters[optionIndex]}</span>
                <input
                  className={deskField}
                  value={option.text}
                  onChange={(event) =>
                    updateOption(question.id, option.id, event.target.value)
                  }
                  placeholder="Antwoord"
                />
              </label>
            ))}
          </div>
          <label className="block text-sm font-semibold">
            Verduideliking
            <textarea
              className={`${deskField} min-h-16`}
              value={question.explanation}
              onChange={(event) =>
                updateQuestion(question.id, {
                  explanation: event.target.value,
                })
              }
            />
          </label>
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="desk-btn desk-btn-ghost"
          onClick={() =>
            setQuestions((current) => [...current, emptyQuizQuestion()])
          }
        >
          Voeg vraag by
        </button>
        <button
          type="submit"
          className="desk-btn desk-btn-navy"
        >
          Stoor vasvra
        </button>
      </div>
    </form>
  );
}
