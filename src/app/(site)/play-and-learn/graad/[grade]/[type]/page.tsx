import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityIcon } from "@/components/activity-icon";
import { DailyQuizStart } from "@/components/daily-quiz-start";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, SectionHeading } from "@/components/ui";
import {
  activityItemCount,
  activityPlayHref,
  getDailyActivity,
  getDailyArchive,
  getPublishedActivitiesByGradeAndKind,
  isLiveActivityKind,
} from "@/lib/activities";
import { formatPlayDate, johannesburgDate } from "@/lib/dates";
import {
  activityTypes,
  gradeActivitiesPath,
  gradeTypePath,
  grades,
  isActivitySlug,
  isGrade,
  type ActivitySlug,
} from "@/lib/site";

type GradeTypePageProps = {
  params: Promise<{ grade: string; type: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return grades.flatMap((grade) =>
    activityTypes.map((type) => ({
      grade: String(grade),
      type: type.slug,
    })),
  );
}

export async function generateMetadata({ params }: GradeTypePageProps) {
  const { grade, type } = await params;
  const meta = activityTypes.find((item) => item.slug === type);
  const title = meta?.title ?? "Aktiwiteit";
  return { title: isGrade(grade) ? `Graad ${grade} · ${title}` : title };
}

function dailyCopy(type: ActivitySlug) {
  switch (type) {
    case "quiz":
      return {
        title: "Vasvra van die week",
        description:
          "Een nuwe bank vrae elke week. Kies hoeveel vrae jy wil doen — 5, 10, 15 of 25.",
        extra: "Ekstra oefening",
        unit: "vrae",
      };
    case "true-or-false":
      return {
        title: "Waar of onwaar van die week",
        description:
          "Een nuwe bank stellings elke week. Kies hoeveel vrae jy wil doen — 5, 10, 15 of 25.",
        extra: "Ekstra oefening",
        unit: "stellings",
      };
    case "speed-quiz":
      return {
        title: "Spoedvasvra van die week",
        description:
          "Dieselfde 25-vraagbank, maar teen die klok. 20 sekondes per vraag.",
        extra: "Ekstra oefening",
        unit: "vrae",
      };
    case "word-search":
      return {
        title: "Woordsoektog van die week",
        description: "Vind vandag se vakterme in die rooster.",
        extra: "Ekstra oefening",
        unit: "woorde",
      };
    case "crossword":
      return {
        title: "Kruiswoord van die week",
        description: "Leidrade uit vandag se onderwerp.",
        extra: "Ekstra oefening",
        unit: "leidrade",
      };
    case "match-the-pairs":
      return {
        title: "Pare van die week",
        description: "Koppel elke term aan die regte betekenis.",
        extra: "Ekstra oefening",
        unit: "pare",
      };
    case "memory-cards":
      return {
        title: "Geheue van die week",
        description: "Draai kaarte om en vind die pare.",
        extra: "Ekstra oefening",
        unit: "pare",
      };
    case "put-in-order":
      return {
        title: "Volgorde van die week",
        description: "Rangskik prosesse in die regte volgorde.",
        extra: "Ekstra oefening",
        unit: "prosesse",
      };
    case "diagram":
      return {
        title: "Diagram van die week",
        description: "Plaas die regte etiket op elke genommerde deel.",
        extra: "Ekstra oefening",
        unit: "dele",
      };
    case "sorting":
      return {
        title: "Sorteer van die week",
        description: "Sit elke item in die regte kategorie.",
        extra: "Ekstra oefening",
        unit: "items",
      };
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function hasLengthSlider(type: ActivitySlug) {
  return type === "quiz" || type === "true-or-false" || type === "speed-quiz";
}

export default async function GradeTypeActivitiesPage({
  params,
}: GradeTypePageProps) {
  const { grade: rawGrade, type } = await params;

  if (!isGrade(rawGrade) || !isActivitySlug(type)) {
    notFound();
  }

  const grade = Number(rawGrade);
  const meta = activityTypes.find((item) => item.slug === type);

  if (!meta) {
    notFound();
  }

  const crumbs = [
    { href: "/", label: "Tuis" },
    { href: "/play-and-learn", label: "Oefen & toets" },
    { href: gradeActivitiesPath(grade), label: `Graad ${grade}` },
    { href: gradeTypePath(grade, type), label: meta.title },
  ];

  const typeSwitcher = (
    <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
      {activityTypes.filter((item) => isLiveActivityKind(item.slug)).map((item) => (
        <Link
          key={item.slug}
          href={gradeTypePath(grade, item.slug)}
          className={`chip shrink-0 ${item.slug === type ? "is-active" : ""}`}
          aria-current={item.slug === type ? "page" : undefined}
        >
          <ActivityIcon kind={item.slug} className="h-3.5 w-3.5" />
          {item.title}
        </Link>
      ))}
    </div>
  );

  if (!isLiveActivityKind(type)) {
    return (
      <SectionPage
        eyebrow={`Graad ${grade}`}
        title={meta.title}
        description={meta.description}
        crumbs={crumbs}
        aside={typeSwitcher}
      >
        <div className="glass rounded-[1.9rem] p-10 text-center">
          <span className="game-card-icon mx-auto" style={{ ["--accent" as string]: meta.accent }}>
            <ActivityIcon kind={type} />
          </span>
          <p className="mt-5 font-display text-2xl font-bold text-white">
            Die {meta.title.toLowerCase()}-enjin kom volgende.
          </p>
          <p className="mt-2 text-white/55">Probeer intussen een van die ander tipes.</p>
        </div>
      </SectionPage>
    );
  }

  const copy = dailyCopy(type);
  const today = johannesburgDate();
  const [daily, archive, published] = await Promise.all([
    getDailyActivity(grade, today, type),
    getDailyArchive(grade, today, type),
    getPublishedActivitiesByGradeAndKind(grade, type),
  ]);
  const available = daily ? activityItemCount(daily) : 0;
  const practice = published.filter((item) => item.source !== "ai-daily");

  return (
    <SectionPage
      eyebrow={`Graad ${grade} · ${meta.title}`}
      title={copy.title}
      description={copy.description}
      crumbs={crumbs}
      aside={typeSwitcher}
    >
      {daily ? (
        <Reveal>
          <div
            className="paper relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8 md:p-10"
            style={{ ["--accent" as string]: meta.accent }}
          >
            <span
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
              style={{ background: meta.accent }}
              aria-hidden
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-green">
                  <span className="pulse-dot" />
                  Vandag · {formatPlayDate(today)}
                  {daily.topic ? <span className="text-muted">· {daily.topic}</span> : null}
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-navy md:text-4xl">
                  {daily.title}
                </h2>
                {daily.description ? (
                  <p className="mt-3 max-w-2xl leading-7 text-muted">{daily.description}</p>
                ) : null}
                {hasLengthSlider(type) ? (
                  <DailyQuizStart kind={type} slug={daily.slug} available={available} />
                ) : (
                  <Link
                    href={activityPlayHref(daily) ?? "/play-and-learn"}
                    className="btn btn-navy mt-6"
                  >
                    Begin vandag
                    <Arrow />
                  </Link>
                )}
              </div>
              <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-2 lg:rounded-2xl lg:bg-navy/5 lg:px-6 lg:py-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
                  <ActivityIcon kind={type} className="h-7 w-7" />
                </span>
                <span className="font-display text-3xl font-extrabold text-navy">{available}</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  {copy.unit} vandag
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="glass rounded-[2.2rem] p-10 text-center">
            <span className="game-card-icon mx-auto" style={{ ["--accent" as string]: meta.accent }}>
              <ActivityIcon kind={type} />
            </span>
            <p className="mt-5 font-display text-2xl font-bold text-white">
              Vandag se {meta.title.toLowerCase()} is nog op pad.
            </p>
            <p className="mt-2 text-white/55">
              Nuwe uitdagings verskyn elke week. Probeer intussen die argief of ’n ander oefening.
            </p>
          </div>
        </Reveal>
      )}

      {archive.length > 0 ? (
        <section className="mt-20">
          <SectionHeading eyebrow="Argief" title="Doen vorige dae weer" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archive.map((item, index) => {
              const href = activityPlayHref(item);
              if (!href) {
                return null;
              }

              return (
                <Reveal key={item.id} delay={(index % 3) * 60}>
                  <Link
                    href={hasLengthSlider(type) ? `${href}?vrae=10` : href}
                    className="game-card group h-full p-6"
                    style={{ ["--accent" as string]: meta.accent }}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                      {item.playOn ? formatPlayDate(item.playOn) : "Argief"}
                      {item.topic ? ` · ${item.topic}` : ""}
                    </p>
                    <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                    <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold text-white">
                      Doen weer
                      <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      ) : null}

      {practice.length > 0 ? (
        <section className="mt-20">
          <SectionHeading eyebrow={copy.extra} title="Oefen op jou eie tyd" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {practice.map((item, index) => {
              const href = activityPlayHref(item);
              const count = activityItemCount(item);
              if (!href) {
                return null;
              }

              return (
                <Reveal key={item.id} delay={(index % 3) * 60}>
                  <Link
                    href={href}
                    className="game-card group h-full p-6"
                    style={{ ["--accent" as string]: meta.accent }}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
                      {item.topic || meta.title}
                    </p>
                    <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                    <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold text-white">
                      Begin
                      <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      {count ? (
                        <span className="font-semibold text-white/45">· {count} {copy.unit}</span>
                      ) : null}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      ) : null}
    </SectionPage>
  );
}
