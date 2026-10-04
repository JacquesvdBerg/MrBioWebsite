import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { GradeIcon } from "@/components/grade-icon";
import { Arrow } from "@/components/ui";
import { gradeBlurbs, gradeColors, gradeImages, type Grade } from "@/lib/site";

type GradeCardProps = {
  grade: Grade;
  href: string;
  meta: ReactNode;
  cta?: string;
  className?: string;
};

// The teacher's illustration for the grade fills the card; the grade colour
// fades in from the bottom so the text stays readable over it.
export function GradeCard({ grade, href, meta, cta = "Verken", className = "" }: GradeCardProps) {
  const [from, to] = gradeColors[grade];

  return (
    <Link
      href={href}
      className={`grade-card h-full ${className}`}
      style={{ ["--c1" as string]: from, ["--c2" as string]: to }}
    >
      <span className="grade-card-img" aria-hidden>
        <Image
          src={gradeImages[grade]}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover object-top"
        />
      </span>
      <span className="grade-card-shade" aria-hidden />
      <span className="grade-card-chip" aria-hidden>
        <GradeIcon grade={grade} className="h-6 w-6" />
      </span>

      <span className="relative mt-auto text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/85">
        Graad
      </span>
      <span className="grade-card-num">{grade}</span>
      <span className="grade-card-blurb relative mt-2 text-[14px] leading-5 text-white/95">{gradeBlurbs[grade]}</span>
      <span className="relative mb-4 mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/75">
        {meta}
      </span>
      <span className="grade-card-btn">
        {cta}
        <Arrow className="h-4 w-4" />
      </span>
    </Link>
  );
}
