import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { gradeAccents, gradeBlurbs, gradePath, grades } from "@/lib/site";

export const metadata = {
  title: "Grade",
  description: "Graad 8 tot 12, elk met vier kwartale.",
};

export default function GradesIndexPage() {
  return (
    <SectionPage
      eyebrow="Grade"
      title="Kies jou graad."
      description="Die werf is om die graad gebou. Elke graad het vier kwartale — dis hoe notas, werk en speletjies later saamval."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/graad", label: "Grade" },
      ]}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {grades.map((grade, index) => (
          <Reveal key={grade} delay={index * 50}>
            <Link
              href={gradePath(grade)}
              className="grade-orb h-full min-h-[14rem]"
              style={{ ["--accent" as string]: gradeAccents[grade] }}
            >
              <span className="grade-orb-num">{grade}</span>
              <span className="mt-3 font-display text-lg font-bold">Graad {grade}</span>
              <span className="mt-1 text-[13px] leading-5 text-white/55">{gradeBlurbs[grade]}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionPage>
  );
}
