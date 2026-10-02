import { GradeCard } from "@/components/grade-card";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { gradePath, grades, isJobGrade } from "@/lib/site";

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
          <Reveal
            key={grade}
            delay={index * 50}
            className={index === grades.length - 1 ? "col-span-2 sm:col-span-1" : ""}
          >
            <GradeCard
              grade={grade}
              href={gradePath(grade)}
              meta={isJobGrade(grade) ? "4 kwartale" : "Jaarplan binnekort"}
              className="min-h-[15.5rem]"
            />
          </Reveal>
        ))}
      </div>
    </SectionPage>
  );
}
