"use client";

import { useMemo, useState } from "react";
import { saveTrueOrFalse } from "@/app/(admin)/admin/actions";
import { deskField } from "@/components/admin-ui";
import { grades } from "@/lib/site";
import {
  emptyTrueOrFalseQuestion,
  type TrueOrFalseQuestion,
} from "@/lib/true-or-false";

type TrueOrFalseEditorProps = {
  slug?: string;
  title?: string;
  description?: string;
  grade?: number | null;
  topic?: string;
  themeSlug?: string | null;
  published?: boolean;
  questions?: TrueOrFalseQuestion[];
  themeOptions: { slug: string; title: string }[];
};

export function TrueOrFalseEditor({
  slug,
  title = "",
  description = "",
  grade = 10,
  topic = "",
  themeSlug = "",
  published = true,
  questions: initialQuestions,
  themeOptions,
}: TrueOrFalseEditorProps) {
  const [questions, setQuestions] = useState<TrueOrFalseQuestion[]>(
    initialQuestions && initialQuestions.length > 0
      ? initialQuestions
      : [emptyTrueOrFalseQuestion()],
  );

  const payload = useMemo(() => JSON.stringify({ questions }), [questions]);

  function updateQuestion(id: string, patch: Partial<TrueOrFalseQuestion>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  }

  return (
    <form action={saveTrueOrFalse} className="space-y-6">
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
            <h2 className="flex items-center gap-2.5 font-display font-bold text-white">
              <span className="desk-qnum">{index + 1}</span>
              Stelling {index + 1}
            </h2>
            {questions.length > 1 ? (
              <button
                type="button"
                className="desk-btn desk-btn-danger"
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
            Stelling
            <textarea
              className={`${deskField} min-h-20`}
              value={question.statement}
              onChange={(event) =>
                updateQuestion(question.id, { statement: event.target.value })
              }
            />
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Regte antwoord</legend>
            <label className={`desk-option is-pill ${question.isTrue ? "is-correct" : ""}`}>
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={question.isTrue}
                onChange={() => updateQuestion(question.id, { isTrue: true })}
              />
              Waar
            </label>
            <label className={`desk-option is-pill ${!question.isTrue ? "is-wrong" : ""}`}>
              <input
                type="radio"
                name={`answer-${question.id}`}
                checked={!question.isTrue}
                onChange={() => updateQuestion(question.id, { isTrue: false })}
              />
              Onwaar
            </label>
          </fieldset>
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

      <div className="desk-savebar">
        <button
          type="button"
          className="desk-btn desk-btn-ghost"
          onClick={() =>
            setQuestions((current) => [...current, emptyTrueOrFalseQuestion()])
          }
        >
          Voeg stelling by
        </button>
        <span className="mr-auto text-sm font-semibold text-white/55">
          {questions.length} {questions.length === 1 ? "stelling" : "stellings"}
        </span>
        <button
          type="submit"
          className="desk-btn desk-btn-navy"
        >
          Stoor waar of onwaar
        </button>
      </div>
    </form>
  );
}
