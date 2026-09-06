"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { optionLetters, type QuizQuestion } from "@/lib/quiz";
import { gradeTypePath } from "@/lib/site";

type QuizEngineProps = {
  title: string;
  topic: string;
  grade: number | null;
  questions: QuizQuestion[];
  kind?: "quiz" | "speed-quiz";
  secondsPerQuestion?: number;
};

type Phase = "ask" | "reveal" | "done";

function tapFeedback() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}

function ScoreRing({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--line-2)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--lime)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-extrabold text-white">
          {percent}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
          persent
        </span>
      </p>
    </div>
  );
}

export function QuizEngine({
  title,
  topic,
  grade,
  questions,
  kind = "quiz",
  secondsPerQuestion = 20,
}: QuizEngineProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("ask");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(secondsPerQuestion);
  const listHref = grade ? gradeTypePath(grade, kind) : "/play-and-learn";
  const timed = kind === "speed-quiz";

  const question = questions[index];
  const total = questions.length;
  const score = useMemo(
    () =>
      questions.filter((item) => answers[item.id] === item.correctId).length,
    [answers, questions],
  );

  const selectOption = useCallback(
    (optionId: string) => {
      if (phase !== "ask" || !question) {
        return;
      }

      tapFeedback();
      setPicked(optionId);
      setAnswers((current) => ({ ...current, [question.id]: optionId }));
      setPhase("reveal");
    },
    [phase, question],
  );

  const goNext = useCallback(() => {
    if (index + 1 >= total) {
      setPhase("done");
      return;
    }

    setIndex((current) => current + 1);
    setPicked(null);
    setPhase("ask");
    setRemaining(secondsPerQuestion);
  }, [index, secondsPerQuestion, total]);

  const restart = useCallback(() => {
    setIndex(0);
    setPicked(null);
    setPhase("ask");
    setAnswers({});
    setRemaining(secondsPerQuestion);
  }, [secondsPerQuestion]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!question || event.metaKey || event.ctrlKey) {
        return;
      }

      if (phase === "ask") {
        const letterIndex = optionLetters.indexOf(
          event.key.toUpperCase() as (typeof optionLetters)[number],
        );
        const numberIndex = Number(event.key) - 1;
        const option =
          question.options[letterIndex] ?? question.options[numberIndex];
        if (option) {
          event.preventDefault();
          selectOption(option.id);
        }
      }

      if (phase === "reveal" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, phase, question, selectOption]);

  useEffect(() => {
    if (!timed || phase !== "ask" || !question) {
      return;
    }

    setRemaining(secondsPerQuestion);
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setAnswers((existing) => ({
            ...existing,
            [question.id]: existing[question.id] ?? "",
          }));
          setPhase("reveal");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, question, secondsPerQuestion, timed]);

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">
        Hierdie vasvra het nog geen vrae nie.
      </div>
    );
  }

  if (phase === "done") {
    const percent = Math.round((score / total) * 100);
    const message =
      percent === 100
        ? "Skoonblad. Jy ken hierdie werk."
        : percent >= 70
          ? "Sterk werk. Lees die verduidelikings vir die paar missers."
          : percent >= 40
            ? "Jy is op pad. Probeer weer nadat jy die feite nagegaan het."
            : "Geen stres. Gaan kyk die les en probeer weer.";

    return (
      <div className="quiz-play px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
        <div className="mx-auto max-w-2xl">
          <Link href={listHref} className="quiz-back">
            ← {grade ? `Graad ${grade} ${kind === "speed-quiz" ? "spoedvasvrae" : "vasvrae"}` : "Aktiwiteite"}
          </Link>
          <div className="quiz-shell mt-4 overflow-hidden rounded-[2rem] p-6 text-center sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              Klaar
            </p>
            <div className="mt-6">
              <ScoreRing percent={percent} />
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-white">
              {score}
              <span className="text-xl text-white/45">/{total}</span>
            </p>
            <p className="mx-auto mt-3 max-w-md text-white/75">{message}</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button type="button" className="quiz-cta" onClick={restart}>
                Probeer weer
              </button>
              <Link href={listHref} className="quiz-cta-ghost">
                Ander aktiwiteite
              </Link>
            </div>
          </div>

          <ol className="mt-6 space-y-3">
            {questions.map((item, questionIndex) => {
              const chosen = answers[item.id];
              const correct = chosen === item.correctId;

              return (
                <li key={item.id} className="quiz-review">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                    Vraag {questionIndex + 1} · {correct ? "Reg" : "Verkeerd"}
                  </p>
                  <p className="mt-1 font-semibold text-white">{item.prompt}</p>
                  <ul className="quiz-review-options">
                    {item.options.map((option, optionIndex) => {
                      const letter =
                        optionLetters[optionIndex] ?? String(optionIndex + 1);
                      const isCorrect = option.id === item.correctId;
                      const isChosen = option.id === chosen;
                      const state = isCorrect
                        ? "right"
                        : isChosen
                          ? "wrong"
                          : "idle";

                      return (
                        <li
                          key={option.id}
                          className={`quiz-option quiz-option-${state}`}
                        >
                          <span className="quiz-letter">{letter}</span>
                          <span className="flex-1 text-left text-[15px] font-semibold leading-6">
                            {option.text}
                          </span>
                          {isCorrect ? (
                            <span className="quiz-review-tag">Reg</span>
                          ) : null}
                          {isChosen && !isCorrect ? (
                            <span className="quiz-review-tag quiz-review-tag-wrong">
                              Jou antwoord
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  {item.explanation ? (
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {item.explanation}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const correct = picked === question.correctId;
  const progress = ((index + (phase === "reveal" ? 1 : 0)) / total) * 100;

  return (
    <div className="quiz-play flex min-h-[calc(100svh-4.75rem)] flex-col px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <Link href={listHref} className="quiz-back">
              ← {grade ? `Graad ${grade} ${kind === "speed-quiz" ? "spoedvasvrae" : "vasvrae"}` : "Aktiwiteite"}
            </Link>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-lime">
              {kind === "speed-quiz" ? "Spoedvasvra" : "Vasvra"}
              {grade ? ` · Graad ${grade}` : ""}
              {topic ? ` · ${topic}` : ""}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              {title}
            </h1>
          </div>
          <p className="shrink-0 text-right font-display text-lg font-bold text-white">
            {timed && phase === "ask" ? (
              <span className="mb-1 block text-sm text-gold">{remaining}s</span>
            ) : null}
            {index + 1}
            <span className="text-white/40">/{total}</span>
          </p>
        </div>

        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="quiz-progress" style={{ width: `${progress}%` }} />
        </div>

        <div
          key={question.id}
          className="quiz-board flex flex-1 flex-col rounded-[1.75rem] p-5 sm:p-8"
        >
          <p className="quiz-prompt font-display text-[1.55rem] font-bold leading-snug text-navy sm:text-3xl">
            {question.prompt}
          </p>

          <div className="mt-6 grid gap-3">
            {question.options.map((option, optionIndex) => {
              const letter =
                optionLetters[optionIndex] ?? String(optionIndex + 1);
              const isPicked = picked === option.id;
              const isCorrect = option.id === question.correctId;
              let state: "idle" | "right" | "wrong" | "dim" = "idle";

              if (phase === "reveal") {
                if (isCorrect) {
                  state = "right";
                } else if (isPicked) {
                  state = "wrong";
                } else {
                  state = "dim";
                }
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={phase !== "ask"}
                  aria-pressed={isPicked}
                  onClick={() => selectOption(option.id)}
                  style={{ animationDelay: `${optionIndex * 55}ms` }}
                  className={`quiz-option quiz-option-${state} min-h-14`}
                >
                  <span className="quiz-letter">{letter}</span>
                  <span className="text-left text-[15px] font-semibold leading-6 sm:text-base">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {phase === "reveal" ? (
            <div className="quiz-explain mt-5">
              <p className="text-sm font-bold uppercase tracking-wide text-green">
                {correct ? "Reg" : "Nie heeltemal nie"}
              </p>
              {question.explanation ? (
                <p className="mt-2 leading-7 text-navy">
                  {question.explanation}
                </p>
              ) : null}
              <button type="button" className="quiz-cta mt-4 w-full sm:w-auto" onClick={goNext}>
                {index + 1 >= total ? "Sien telling" : "Volgende vraag"}
              </button>
            </div>
          ) : (
            <p className="mt-auto hidden pt-6 text-xs text-muted md:block">
              Tik ’n antwoord, of gebruik A–D op die sleutelbord.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
