"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow } from "@/components/ui";
import { gradeAccents } from "@/lib/site";
import {
  isSeniorGrade,
  seniorGrades,
  syllabus,
  type SeniorGrade,
} from "@/lib/syllabus";

type SyllabusExplorerProps = {
  initialGrade?: number;
  /** Hide the grade tabs when the page already fixes the grade. */
  lockGrade?: boolean;
};

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.6-.5-5.3a2.8 2.8 0 0 0-2-2C18.9 4.3 12 4.3 12 4.3s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3a2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2c.5-1.7.5-5.3.5-5.3ZM9.8 15.3V8.7l5.8 3.3-5.8 3.3Z" />
    </svg>
  );
}

export function SyllabusExplorer({ initialGrade = 10, lockGrade = false }: SyllabusExplorerProps) {
  const [grade, setGrade] = useState<SeniorGrade>(
    isSeniorGrade(initialGrade) ? initialGrade : 10,
  );
  const data = syllabus[grade];
  const accent = gradeAccents[grade];

  return (
    <div className="syllabus" style={{ ["--accent" as string]: accent }}>
      {!lockGrade ? (
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Kies ’n graad">
          {seniorGrades.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={item === grade}
              onClick={() => setGrade(item)}
              className={`chip ${item === grade ? "is-active" : ""}`}
              style={
                item === grade
                  ? { background: gradeAccents[item], borderColor: gradeAccents[item] }
                  : undefined
              }
            >
              Graad {item}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`${lockGrade ? "" : "mt-6"} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
        {data.terms.map((term, index) => (
          <article
            key={`${grade}-${term.term}`}
            className="syllabus-term rise glass flex h-full flex-col rounded-[1.6rem] p-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: accent }}>
                Kwartaal {term.term}
              </span>
              <span className="syllabus-num font-display text-3xl font-extrabold leading-none tracking-[-0.05em]">
                {term.term}
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">
              {term.title}
            </h3>
            <ul className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
              {term.topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[12px] font-semibold text-white/70"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-6 text-white/65">
          <span className="font-bold text-white">Graad {grade}:</span> {data.summary}{" "}
          Al die videolesse vir hierdie graad is in een speellys.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={data.playlist}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm bg-[#ff0033] text-white hover:bg-[#e6002e]"
          >
            <YoutubeIcon />
            Graad {grade} speellys
          </a>
          <Link href={`/shop#graad-${grade}`} className="btn btn-ghost btn-sm">
            Notas vir graad {grade}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
