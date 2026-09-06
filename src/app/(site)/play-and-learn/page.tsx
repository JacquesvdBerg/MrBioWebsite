import Link from "next/link";
import { ActivityIcon } from "@/components/activity-icon";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, SectionHeading } from "@/components/ui";
import { getAllPublishedActivities } from "@/lib/activities";
import {
  activityTypes,
  gradeAccents,
  gradeActivitiesPath,
  gradeBlurbs,
  grades,
} from "@/lib/site";

export const metadata = {
  title: "Oefen en toets",
  description:
    "Daaglikse vasvrae, kruiswoorde, woordsoektogte en meer vir Lewenswetenskappe graad 10 tot 12.",
};

export const revalidate = 60;

const rules = [
  {
    title: "Elke dag nuut",
    body: "Om middernag verskyn ’n vars uitdaging vir elke graad en elke oefeningtipe.",
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
      eyebrow="Oefen & toets"
      title={
        <>
          Kies jou graad. <span className="gradient-text">Toets jouself.</span>
        </>
      }
      description="Tien tipes oefeninge, elkeen met nuwe inhoud elke dag. Eers jou graad, dan die oefening — en dan sien jy wat jy onthou. ’n Gratis bonus by die notas en lesse."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/play-and-learn", label: "Oefen & toets" },
      ]}
      aside={
        <div className="glass hidden rounded-[1.9rem] p-6 lg:block">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
            <span className="pulse-dot" />
            Vandag oop
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold text-white">
            Vasvra · Kruiswoord · Geheue
          </p>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Nuwe stelle vir graad 10 tot 12. Kies jou graad hieronder om te begin.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {grades.map((grade, index) => {
          const count = activities.filter((item) => item.grade === grade).length;

          return (
            <Reveal key={grade} delay={index * 70}>
              <Link
                href={gradeActivitiesPath(grade)}
                className="grade-orb h-full min-h-[14rem]"
                style={{ ["--accent" as string]: gradeAccents[grade] }}
              >
                <span className="grade-orb-num">{grade}</span>
                <span className="mt-3 font-display text-lg font-bold">Graad {grade}</span>
                <span className="mt-1 text-[13px] leading-5 text-white/55">{gradeBlurbs[grade]}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/45">
                  {count === 0
                    ? "Daagliks nuut"
                    : `${count} ${count === 1 ? "aktiwiteit" : "aktiwiteite"}`}
                  <Arrow className="h-3.5 w-3.5" />
                </span>
              </Link>
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
