import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { TiltCard } from "@/components/tilt-card";
import { Arrow, ButtonLink } from "@/components/ui";
import { Visual } from "@/components/visual";
import { getPublishedCatalogue } from "@/lib/products";
import {
  gradeAccents,
  gradeActivitiesPath,
  gradeBlurbs,
  grades,
  isGrade,
  isJobGrade,
} from "@/lib/site";
import { syllabus } from "@/lib/syllabus";

export const revalidate = 300;

type GradePageProps = {
  params: Promise<{ grade: string }>;
};

export function generateStaticParams() {
  return grades.map((grade) => ({ grade: String(grade) }));
}

export async function generateMetadata({ params }: GradePageProps) {
  const grade = Number((await params).grade);
  if (!isGrade(grade)) {
    return { title: "Graad" };
  }
  return {
    title: `Graad ${grade}`,
    description: gradeBlurbs[grade],
  };
}

export default async function GradePage({ params }: GradePageProps) {
  const grade = Number((await params).grade);
  if (!isGrade(grade)) {
    notFound();
  }

  const plan = syllabus[grade];
  const { items } = await getPublishedCatalogue();
  const notes = items.filter((product) => product.grade === grade);

  return (
    <SectionPage
      eyebrow={`Graad ${grade}`}
      title={<>Vier kwartale. <span className="gradient-text">Een jaar.</span></>}
      description={plan.summary}
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/graad", label: "Grade" },
        { href: `/graad/${grade}`, label: `Graad ${grade}` },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {plan.terms.map((term, index) => (
          <Reveal key={term.term} delay={index * 60}>
            <article
              className="glass h-full rounded-[1.75rem] p-6"
              style={{ ["--accent" as string]: gradeAccents[grade] }}
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                Kwartaal {term.term}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">{term.title}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-white/65">
                {term.topics.map((topic) => (
                  <li key={topic} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                    {topic}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href={`/shop?graad=${grade}`} tone="lime">
          Winkel vir graad {grade}
          <Arrow />
        </ButtonLink>
        {isJobGrade(grade) ? (
          <ButtonLink href={gradeActivitiesPath(grade)} tone="ghost">
            Speletjies
            <Arrow />
          </ButtonLink>
        ) : null}
      </div>

      {notes.length > 0 ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((product) => (
            <TiltCard key={product.slug} className="group relative h-full" max={5}>
              <article className="glass flex h-full flex-col overflow-hidden rounded-[1.8rem]">
                <Visual file={product.imagePath} alt="" ratio="4/3" tone={product.tone} />
                <div className="p-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                    {product.kind}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">{product.title}</h3>
                  <Link href={`/contact?produk=${product.slug}`} className="btn btn-white btn-sm mt-4">
                    Doen navraag
                  </Link>
                </div>
              </article>
            </TiltCard>
          ))}
        </div>
      ) : null}
    </SectionPage>
  );
}
