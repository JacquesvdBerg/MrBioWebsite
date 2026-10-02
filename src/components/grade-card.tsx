import Link from "next/link";
import type { ReactNode } from "react";
import { GradeIcon } from "@/components/grade-icon";
import { Arrow } from "@/components/ui";
import { gradeBlurbs, gradeColors, type Grade } from "@/lib/site";

type GradeCardProps = {
  grade: Grade;
  href: string;
  meta: ReactNode;
  cta?: string;
  className?: string;
};

export function GradeCard({ grade, href, meta, cta = "Verken", className = "" }: GradeCardProps) {
  const [from, to] = gradeColors[grade];

  return (
    <Link
      href={href}
      className={`grade-card h-full ${className}`}
      style={{ ["--c1" as string]: from, ["--c2" as string]: to }}
    >
      <GradeIcon grade={grade} className="grade-card-mark" />
      <span className="relative text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/80">
        Graad
      </span>
      <span className="grade-card-num">{grade}</span>
      <span className="grade-card-art">
        <GradeIcon grade={grade} className="h-14 w-14" />
      </span>
      <span className="relative text-[14px] leading-5 text-white/90">{gradeBlurbs[grade]}</span>
      <span className="relative mb-4 mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70">
        {meta}
      </span>
      <span className="grade-card-btn">
        {cta}
        <Arrow className="h-4 w-4" />
      </span>
    </Link>
  );
}
