"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { activityTypes, gradeTypePath, type ActivitySlug } from "@/lib/site";

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

export function playLabel(kind: ActivitySlug, grade: number | null) {
  const title =
    activityTypes.find((item) => item.slug === kind)?.title ?? "Aktiwiteite";
  return grade ? `Graad ${grade} ${title.toLowerCase()}` : title;
}

export function PlayHeader(props: {
  kind: ActivitySlug;
  title: string;
  topic: string;
  grade: number | null;
  index?: number;
  total?: number;
  asCount?: boolean;
}) {
  const listHref = props.grade
    ? gradeTypePath(props.grade, props.kind)
    : "/play-and-learn";
  const meta = activityTypes.find((item) => item.slug === props.kind);

  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <Link href={listHref} className="quiz-back">
          ← {playLabel(props.kind, props.grade)}
        </Link>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-lime">
          {meta?.title}
          {props.grade ? ` · Graad ${props.grade}` : ""}
          {props.topic ? ` · ${props.topic}` : ""}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
          {props.title}
        </h1>
      </div>
      {props.total ? (
        <p className="shrink-0 font-display text-lg font-bold text-white">
          {props.asCount ? (props.index ?? 0) : (props.index ?? 0) + 1}
          <span className="text-white/40">/{props.total}</span>
        </p>
      ) : null}
    </div>
  );
}

export function PlayDone(props: {
  kind: ActivitySlug;
  grade: number | null;
  score: number;
  total: number;
  onRestart: () => void;
  children?: ReactNode;
}) {
  const percent = props.total
    ? Math.round((props.score / props.total) * 100)
    : 0;
  const listHref = props.grade
    ? gradeTypePath(props.grade, props.kind)
    : "/play-and-learn";
  const message =
    percent === 100
      ? "Perfek! Jy het alles reg."
      : percent >= 80
        ? "Uitstekend. Amper foutloos."
        : percent >= 50
          ? "Goed gedoen. Kyk wat jy gemis het."
          : "Goeie probeerslag. Nog een keer?";

  return (
    <div className="quiz-play px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href={listHref} className="quiz-back">
          ← {playLabel(props.kind, props.grade)}
        </Link>
        <div className="quiz-shell mt-4 overflow-hidden rounded-[2rem] p-6 text-center sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sun">
            Klaar
          </p>
          <div className="mt-6">
            <ScoreRing percent={percent} />
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-white">
            {props.score}
            <span className="text-xl text-white/45">/{props.total}</span>
          </p>
          <p className="mt-2 font-display text-lg font-bold text-white/70">{message}</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className="quiz-cta" onClick={props.onRestart}>
              Probeer weer
            </button>
            <Link href={listHref} className="quiz-cta-ghost">
              Ander aktiwiteite
            </Link>
          </div>
        </div>
        {props.children}
      </div>
    </div>
  );
}
