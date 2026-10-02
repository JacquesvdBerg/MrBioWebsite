import Link from "next/link";
import { ActivityIcon } from "@/components/activity-icon";
import { MrBioMark } from "@/components/brand";
import { GradeCard } from "@/components/grade-card";
import { HomeHero } from "@/components/home-hero";
import { BulbIcon, DevicesIcon, SendIcon, UserPlusIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";
import { getSessionAccount } from "@/lib/auth-role";
import { activityTypes, gradePath, grades, isJobGrade } from "@/lib/site";
import { getPublishedWeeklyFacts } from "@/lib/weekly-facts";

export const revalidate = 300;

const chatSteps = [
  {
    Icon: UserPlusIcon,
    title: "Skep ’n rekening",
    body: "Jou klets sit teen jou naam, nie teen hierdie toestel nie.",
  },
  {
    Icon: SendIcon,
    title: "Stuur jou vraag",
    body: "Kies ’n onderwerp en tik. Mnr. Bio lees dit in die lessenaar.",
  },
  {
    Icon: DevicesIcon,
    title: "Kom terug wanneer jy wil",
    body: "Die draad bly daar — op ’n nuwe foon ook, solank jy inteken.",
  },
];

const sampleChat = [
  { from: "me", text: "Wat is die verskil tussen mitose en meiose?" },
  {
    from: "them",
    text: "Goeie vraag! Mitose maak twee identiese selle — vir groei en herstel.",
  },
  {
    from: "them",
    text: "Meiose maak vier geslagselle met die helfte van die chromosome. Dis hoekom jy nie presies soos jou broer of suster lyk nie.",
  },
  { from: "me", text: "Dankie Meneer, nou maak dit sin!" },
] as const;

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
            <Reveal
              key={grade}
              delay={index * 60}
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
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <Reveal>
          <Link
            href="/weekly-facts"
            className="glass shine group grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.4fr_1fr]"
          >
            <div className="relative z-10 flex flex-col justify-between p-7 md:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex items-center gap-2 font-display text-xl font-bold text-lime">
                    <BulbIcon className="h-6 w-6" />
                    Feit van die week
                  </span>
                  {fact?.weekLabel ? (
                    <span className="text-xs font-bold text-white/45">{fact.weekLabel}</span>
                  ) : null}
                </div>
                <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/45">
                  Het jy geweet?
                </p>
                <p className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white md:text-[2.75rem]">
                  {fact?.title ?? "Elke week een Lewenswetenskappe-feit wat bly sit."}
                </p>
                {fact?.body ? (
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/60">{fact.body}</p>
                ) : null}
              </div>
              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {fact ? (
                    <>
                      <span className="chip">{fact.category || "Lewenswetenskappe"}</span>
                      <span className="chip">Graad {fact.grade}</span>
                    </>
                  ) : (
                    <span className="chip">Weekliks nuut</span>
                  )}
                </div>
                <span className="btn btn-lime btn-sm shrink-0 uppercase tracking-[0.04em]">
                  Meer feite
                  <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
            <div className="relative order-first min-h-[13rem] lg:order-none lg:min-h-full">
              <Visual
                file={fact?.imagePath ?? null}
                alt=""
                tone={fact?.tone ?? "orange"}
                art={fact?.art ?? "heart"}
                sizes="(max-width: 1024px) 100vw, 520px"
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent lg:bg-gradient-to-r lg:from-bg/45" />
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
                <span className="mt-auto pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                  {type.minutes}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-24 md:px-6 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="Klets"
            title="Vra die onderwyser."
            description="Die klets self maak net oop nadat jy ingeteken het. Hier is hoe dit werk."
          />
          <div className="chat-steps">
            {chatSteps.map(({ Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 80}>
                <div className="chat-step">
                  <span className="chat-step-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/40">
                      Stap {index + 1}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold text-white">{title}</h3>
                    <p className="mt-1 leading-7 text-white/60">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
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
        </div>

        <Reveal delay={120}>
          <div className="chat-preview glass rounded-[2rem]" aria-label="Voorbeeld van ’n klets">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <MrBioMark className="h-12 w-12" />
                <div>
                  <p className="font-display font-bold text-white">Mnr. Bio</p>
                  <p className="text-xs text-white/50">Lewenswetenskappe-onderwyser</p>
                </div>
              </div>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/50">
                Voorbeeld
              </span>
            </div>
            <div className="flex flex-col gap-3 px-5 py-6 md:px-6">
              {sampleChat.map((message, index) => (
                <p
                  key={index}
                  className={`chat-bubble ${message.from === "me" ? "chat-bubble-me" : "chat-bubble-them text-white/85"}`}
                >
                  {message.text}
                </p>
              ))}
              <span className="chat-typing" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </div>
            <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4 md:px-6">
              <span className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/40">
                Tik jou vraag…
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-lime text-on-accent">
                <SendIcon className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
