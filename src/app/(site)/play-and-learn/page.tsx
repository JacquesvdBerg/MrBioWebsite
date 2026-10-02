import { ActivityIcon } from "@/components/activity-icon";
import { GradeCard } from "@/components/grade-card";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { SectionHeading } from "@/components/ui";
import { getAllPublishedActivities } from "@/lib/activities";
import { activityTypes, gradeActivitiesPath, grades } from "@/lib/site";

export const metadata = {
  title: "Oefen en toets",
  description:
    "Weeklikse vasvrae, kruiswoorde, woordsoektogte en meer vir Lewenswetenskappe.",
};

export const revalidate = 60;

const rules = [
  {
    title: "Elke week nuut",
    body: "Een vars stel per week vir elke graad en elke speletjie — nie elke dag nie.",
  },
  {
    title: "Kies jou lengte",
    body: "Vasvrae kan 5, 10, 15 of 25 vrae wees. Almal wat dieselfde lengte kies, kry dieselfde vrae.",
  },
  {
    title: "Sien wat jy gemis het",
    body: "Aan die einde wys ons elke vraag, jou antwoord en die regte een — met ’n verduideliking.",
  },
  {
    title: "Doen gister weer",
    body: "Die argief hou vorige dae. Perfek om voor ’n toets te hersien.",
  },
];

export default async function PlayAndLearnPage() {
  const activities = await getAllPublishedActivities();

  return (
    <SectionPage
      eyebrow="Speletjies"
      title={
        <>
          Kies jou graad. <span className="gradient-text">Speel hierdie week.</span>
        </>
      }
      description="Weeklikse vakverbande speletjies. Eers jou graad, dan die speletjie."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/play-and-learn", label: "Speletjies" },
      ]}
      aside={
        <div className="glass hidden rounded-[1.9rem] p-6 lg:block">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
            <span className="pulse-dot" />
            Hierdie week
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold text-white">
            Vasvra · Kruiswoord · Geheue
          </p>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Een stel per week. Kies jou graad hieronder om te begin.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {grades.map((grade, index) => {
          const count = activities.filter((item) => item.grade === grade).length;

          return (
            <Reveal
              key={grade}
              delay={index * 70}
              className={index === grades.length - 1 ? "col-span-2 sm:col-span-1" : ""}
            >
              <GradeCard
                grade={grade}
                href={gradeActivitiesPath(grade)}
                cta="Speel"
                meta={
                  count === 0
                    ? "Hierdie week"
                    : `${count} ${count === 1 ? "aktiwiteit" : "aktiwiteite"}`
                }
                className="min-h-[15.5rem]"
              />
            </Reveal>
          );
        })}
      </div>

      <section className="mt-24">
        <SectionHeading
          eyebrow="Die enjins"
          title="Tien maniere om te oefen"
          description="Elke enjin werk dieselfde vir elke graad. Kies ’n graad hierbo om die inhoud vir jou sillabus te sien."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {activityTypes.map((type, index) => (
            <Reveal key={type.slug} delay={(index % 5) * 60}>
              <div className="game-card h-full" style={{ ["--accent" as string]: type.accent }}>
                <span className="game-card-icon">
                  <ActivityIcon kind={type.slug} />
                </span>
                <span className="font-display text-lg font-bold leading-tight">{type.title}</span>
                <span className="text-[13px] leading-5 text-white/55">{type.description}</span>
                <span className="mt-auto pt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                  {type.minutes}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {rules.map((rule, index) => (
          <Reveal key={rule.title} delay={index * 70}>
            <div className="glass h-full rounded-[1.6rem] p-6">
              <span className="number-badge">{index + 1}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{rule.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{rule.body}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </SectionPage>
  );
}
