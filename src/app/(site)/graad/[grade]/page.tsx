import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeCatalogue } from "@/components/grade-catalogue";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { catalogueForGrade, getPublishedProducts, hasCatalogue, quarterOf } from "@/lib/products";
import {
  gradeAccents,
  gradeActivitiesPath,
  gradeColors,
  gradeBlurbs,
  grades,
  isGrade,
  isJobGrade,
} from "@/lib/site";
import { syllabus } from "@/lib/syllabus";

export const revalidate = 300;

const quarterWords: Record<number, string> = { 2: "Twee", 3: "Drie" };

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
  const catalogue = catalogueForGrade(await getPublishedProducts(), grade);
  const quarterProduct = (term: number) =>
    catalogue.summary?.quarters.find((product) => quarterOf(product) === term) ?? null;

  return (
    <SectionPage
      eyebrow={`Graad ${grade}`}
      title={
        plan.terms.length === 4 ? (
          <>
            Vier kwartale. <span className="gradient-text">Een jaar.</span>
          </>
        ) : (
          <>
            {plan.terms.length === 1 ? "Een kwartaal." : `${quarterWords[plan.terms.length] ?? plan.terms.length} kwartale.`}{" "}
            <span className="gradient-text">{plan.tagline}</span>
          </>
        )
      }
      description={plan.summary}
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/graad", label: "Grade" },
        { href: `/graad/${grade}`, label: `Graad ${grade}` },
      ]}
      aside={
        plan.playlist ? (
          <a
            href={plan.playlist}
            target="_blank"
            rel="noreferrer"
            className="yt-badge"
            aria-label={`Kyk die graad ${grade}-video’s op YouTube`}
          >
            <Image
              src="/images/brand/youtube-playlist.webp"
              alt=""
              width={640}
              height={640}
              sizes="(max-width: 1024px) 12rem, 15rem"
              priority
            />
          </a>
        ) : undefined
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {plan.terms.map((term, index) => {
          const product = quarterProduct(term.term);

          return (
            <Reveal key={term.term} delay={index * 60}>
              <article
                className="glass flex h-full flex-col rounded-[1.75rem] p-6"
                style={{
                  ["--accent" as string]: gradeAccents[grade],
                  ["--c1" as string]: gradeColors[grade][0],
                  ["--c2" as string]: gradeColors[grade][1],
                }}
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
                {product ? <span className="min-h-5 flex-1" aria-hidden /> : null}
                {product ? (
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="text-sm text-white/60">
                      {product.kind} vir hierdie kwartaal · <strong className="text-white">R{product.price}</strong>
                    </span>
                    <Link href={`/contact?produk=${encodeURIComponent(product.slug)}`} className="shop-enquire">
                      Navraag
                      <Arrow className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href={hasCatalogue(catalogue) ? `#graad-${grade}` : `/shop?graad=${grade}`} tone="lime">
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

      {hasCatalogue(catalogue) ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Winkel"
            title={`Studiemateriaal vir graad ${grade}`}
            description={
              catalogue.summary?.full || catalogue.slides?.full
                ? "Koop net die kwartaal wat jy nodig het, of die volledige pakket vir die hele jaar."
                : "Koop net die kwartaal wat jy nodig het."
            }
          />
          <GradeCatalogue catalogue={catalogue} banner={false} />
        </section>
      ) : null}
    </SectionPage>
  );
}
