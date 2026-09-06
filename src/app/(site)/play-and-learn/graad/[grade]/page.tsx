import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityIcon } from "@/components/activity-icon";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { SyllabusExplorer } from "@/components/syllabus-explorer";
import { Arrow, SectionHeading } from "@/components/ui";
import {
  getPublishedActivitiesByGrade,
  isLiveActivityKind,
} from "@/lib/activities";
import {
  activityTypes,
  gradeAccents,
  gradeActivitiesPath,
  gradeBlurbs,
  gradeTypePath,
  grades,
  isGrade,
} from "@/lib/site";
import { isSeniorGrade } from "@/lib/syllabus";

type GradePageProps = {
  params: Promise<{ grade: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return grades.map((grade) => ({ grade: String(grade) }));
}

export async function generateMetadata({ params }: GradePageProps) {
  const { grade } = await params;
  return { title: isGrade(grade) ? `Graad ${grade} · Oefen & toets` : "Aktiwiteite" };
}

export default async function GradeActivitiesPage({ params }: GradePageProps) {
  const { grade: raw } = await params;

  if (!isGrade(raw)) {
    notFound();
  }

  const grade = Number(raw);
  const activities = await getPublishedActivitiesByGrade(grade);
  const accent = gradeAccents[grade];

  return (
    <SectionPage
      eyebrow={`Graad ${grade}`}
      title={
        <>
          Kies ’n <span className="gradient-text">oefening.</span>
        </>
      }
      description={`${gradeBlurbs[grade]} Elke tipe is dieselfde enjin — die inhoud volg jou graad se sillabus.`}
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/play-and-learn", label: "Oefen & toets" },
        { href: gradeActivitiesPath(grade), label: `Graad ${grade}` },
      ]}
      aside={
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {grades.map((item) => (
            <Link
              key={item}
              href={gradeActivitiesPath(item)}
              className={`chip ${item === grade ? "is-active" : ""}`}
              aria-current={item === grade ? "page" : undefined}
            >
              Graad {item}
            </Link>
          ))}
        </div>
      }
    >
      {isSeniorGrade(grade) ? (
        <section className="mb-16">
          <SectionHeading
            eyebrow="Jaarplan (KABV)"
            title="Wat julle wanneer doen"
            description="Die oefeninge en notas volg hierdie kwartale. Kyk die volledige speellys vir die graad op YouTube."
          />
          <SyllabusExplorer initialGrade={grade} lockGrade />
        </section>
      ) : null}

      <SectionHeading eyebrow="Oefen & toets" title="Kies ’n oefening" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activityTypes.map((type, index) => {
          const count = activities.filter((item) => item.kind === type.slug).length;
          const live = isLiveActivityKind(type.slug);

          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="game-card-icon">
                  <ActivityIcon kind={type.slug} />
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white/50">
                  {type.minutes}
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-white">{type.title}</h2>
              <p className="mt-2 flex-1 leading-7 text-white/60">{type.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  {live ? "Begin" : "Binnekort"}
                  {live ? <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" /> : null}
                </span>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/50">
                    <span className="pulse-dot" />
                    {count === 0 ? "Daagliks" : `${count} ${count === 1 ? "stel" : "stelle"}`}
                  </span>
                ) : null}
              </div>
            </>
          );

          return (
            <Reveal key={type.slug} delay={(index % 3) * 70}>
              {live ? (
                <Link
                  href={gradeTypePath(grade, type.slug)}
                  className="game-card group h-full p-6"
                  style={{ ["--accent" as string]: type.accent }}
                >
                  {body}
                </Link>
              ) : (
                <div
                  className="game-card is-dim h-full p-6"
                  style={{ ["--accent" as string]: type.accent }}
                >
                  {body}
                </div>
              )}
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div
          className="mt-16 flex flex-col gap-6 rounded-[2rem] border border-white/10 p-8 md:flex-row md:items-center md:justify-between"
          style={{
            background: `radial-gradient(400px 200px at 100% 0%, color-mix(in srgb, ${accent} 25%, transparent), transparent 60%), linear-gradient(160deg, var(--bg-4), var(--bg-2))`,
          }}
        >
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
              Wenk
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-white">
              Begin met die vasvra van die dag.
            </p>
            <p className="mt-2 max-w-xl leading-7 text-white/60">
              Tien vrae, tien minute. Daarna weet jy presies watter onderwerp
              jou woordsoektog of kruiswoord moet wees.
            </p>
          </div>
          <Link href={gradeTypePath(grade, "quiz")} className="btn btn-lime shrink-0">
            Vasvra van die dag
            <Arrow />
          </Link>
        </div>
      </Reveal>
    </SectionPage>
  );
}
