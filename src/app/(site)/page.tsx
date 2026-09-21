import Link from "next/link";
import { ActivityIcon } from "@/components/activity-icon";
import { HomeHero } from "@/components/home-hero";
import { Reveal } from "@/components/reveal";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { getSessionAccount } from "@/lib/auth-role";
import { activityTypes, gradeAccents, gradeBlurbs, gradePath, grades } from "@/lib/site";
import { getPublishedWeeklyFacts } from "@/lib/weekly-facts";

export const revalidate = 300;

const chatSteps = [
  {
    title: "Skep ’n rekening",
    body: "Jou klets sit teen jou naam, nie teen hierdie toestel nie.",
  },
  {
    title: "Stuur jou vraag",
    body: "Kies ’n onderwerp en tik. Mnr. Bio lees dit in die lessenaar.",
  },
  {
    title: "Kom terug wanneer jy wil",
    body: "Die draad bly daar — op ’n nuwe foon ook, solank jy inteken.",
  },
];

export default async function HomePage() {
  const [facts, account] = await Promise.all([
    getPublishedWeeklyFacts(),
    getSessionAccount(),
  ]);
  const fact = facts[0] ?? null;

  return (
    <div className="pb-8">
      <HomeHero />

      <section id="grade" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-16 md:px-6">
        <SectionHeading
          eyebrow="Kies jou graad"
          title="Waar is jy op die reis?"
          description="Elke graad het sy eie bladsy, met vier kwartale. Notas, feite en speletjies volg daardie jaar."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {grades.map((grade, index) => (
            <Reveal key={grade} delay={index * 50}>
              <Link
                href={gradePath(grade)}
                className="grade-orb h-full min-h-[12rem]"
                style={{ ["--accent" as string]: gradeAccents[grade] }}
              >
                <span className="grade-orb-num">{grade}</span>
                <span className="mt-3 font-display text-lg font-bold">Graad {grade}</span>
                <span className="mt-1 text-[13px] leading-5 text-white/55">{gradeBlurbs[grade]}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <Reveal>
          <Link
            href="/weekly-facts"
            className="glass shine group flex flex-col justify-between rounded-[2rem] p-7 md:p-10"
          >
            <div>
              <span className="eyebrow">Feit van die week</span>
              <p className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white md:text-5xl">
                {fact?.title ?? "Elke week een Lewenswetenskappe-feit wat bly sit."}
              </p>
              {fact?.body ? (
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/60">{fact.body}</p>
              ) : null}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm text-white/55">
                {fact
                  ? `${fact.category || "Lewenswetenskappe"} · Graad ${fact.grade}`
                  : "Weekliks nuut"}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-all group-hover:bg-lime group-hover:text-on-accent">
                <Arrow />
              </span>
            </div>
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <SectionHeading
          eyebrow="Speletjies"
          title={
            <>
              Weeklikse <span className="gradient-text-warm">vakverbande speletjies.</span>
            </>
          }
          description="Een nuwe stel per week, gekoppel aan die werk van daardie kwartaal. Nie elke dag ’n nuwe speletjie nie."
          action={
            <ButtonLink href="/play-and-learn" tone="ghost">
              Speel
              <Arrow />
            </ButtonLink>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {activityTypes.map((type, index) => (
            <Reveal key={type.slug} delay={(index % 5) * 50}>
              <Link
                href="/play-and-learn"
                className="game-card h-full"
                style={{ ["--accent" as string]: type.accent }}
              >
                <span className="game-card-icon">
                  <ActivityIcon kind={type.slug} />
                </span>
                <span className="font-display text-lg font-bold leading-tight">{type.title}</span>
                <span className="text-[13px] leading-5 text-white/55">{type.description}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <SectionHeading
          eyebrow="Klets"
          title="Vra die onderwyser."
          description="Die klets self maak net oop nadat jy ingeteken het. Hier is hoe dit werk."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {chatSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <article className="glass h-full rounded-[1.75rem] p-6">
                <span className="font-display text-5xl font-extrabold text-white/10">0{index + 1}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 leading-7 text-white/60">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-6">
          {account ? (
            <ButtonLink href="/live-chat" tone="lime">
              Gaan na jou klets
              <Arrow />
            </ButtonLink>
          ) : (
            <ButtonLink href="/rekening?mode=register&next=/live-chat" tone="lime">
              Skep ’n rekening om te klets
              <Arrow />
            </ButtonLink>
          )}
        </div>
      </section>
    </div>
  );
}
