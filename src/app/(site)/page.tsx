import Image from "next/image";
import Link from "next/link";
import { ActivityIcon } from "@/components/activity-icon";
import { HomeHero } from "@/components/home-hero";
import { Reveal } from "@/components/reveal";
import { SyllabusExplorer } from "@/components/syllabus-explorer";
import { TiltCard } from "@/components/tilt-card";
import { Arrow, ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";
import { getAllPublishedActivities } from "@/lib/activities";
import { publicFileUrl } from "@/lib/assets";
import { imageFiles } from "@/lib/image-files";
import { featuredProducts } from "@/lib/shop-data";
import {
  activityTypes,
  gradeAccents,
  gradeActivitiesPath,
  gradeBlurbs,
  grades,
} from "@/lib/site";
import { getPublishedThemes } from "@/lib/themes";
import { getPublishedVideos } from "@/lib/videos";

// Themes, videos and activities are edited in the admin panel, so re-check the
// database periodically instead of baking the lists into the build.
export const revalidate = 300;

const topics = [
  "Fotosintese",
  "DNA & RNA",
  "Mitose",
  "Meiose",
  "Ekosisteme",
  "Bloedsomloop",
  "Homeostase",
  "Evolusie",
  "Selrespirasie",
  "Genetika",
  "Plantweefsel",
  "Senuweestelsel",
  "Biodiversiteit",
  "Voedselwebbe",
];

const included = [
  "Geskryf deur ’n Lewenswetenskappe-onderwyser met 12 jaar klaskamerervaring",
  "Volg die CAPS-sillabus afdeling vir afdeling — niks ekstra, niks wat ontbreek",
  "Sluit direk by die gratis videolesse en oefeninge aan",
  "PDF onmiddellik; gedrukte kopieë en klasbundels op aanvraag",
];

const steps = [
  {
    title: "Kies jou graad",
    body: "Graad 10 tot 12, elkeen met sy eie sillabus-pad: notas, videolesse en oefeninge wat bymekaar pas.",
  },
  {
    title: "Lees en kyk",
    body: "Werk deur die notas en kyk die kort videoles oor dieselfde afdeling. Twee verduidelikings, een begrip.",
  },
  {
    title: "Oefen tot dit vassteek",
    body: "Toets jouself met die daaglikse vasvra of kruiswoord. Sien wat jy gemis het en gaan terug na die notas.",
  },
];

const quotes = [
  {
    name: "Anja, Graad 11",
    body: "Die bloedsomloop-notas het my eindelik laat verstaan hoekom die druk verskil. Die eksamenvraag daaroor was maklik.",
  },
  {
    name: "Mnr. Nel, onderwyser",
    body: "Ek gebruik die klas-lisensie vir my graad 12’s. Die notas volg presies wat ek in die klas doen, en die vasvrae is ’n lekker opwarming.",
  },
  {
    name: "Thabo, Graad 10",
    body: "Die video’s is kort en die notas is in Afrikaans wat ek verstaan. Die speletjies is die bonus na die huiswerk.",
  },
];

const community = [
  {
    href: "/live-chat",
    eyebrow: "Vra die onderwyser",
    title: "Vas met ’n vraag? Stuur dit.",
    body: "Stuur jou vraag en kry ’n antwoord van ’n regte Lewenswetenskappe-onderwyser.",
    tone: "teal" as const,
  },
  {
    href: "/shop#bundels",
    eyebrow: "Vir onderwysers",
    title: "Klasbundels en lisensies",
    body: "Druk vir jou hele klas, kry die onderwysergids en memorandums by.",
    tone: "orange" as const,
  },
  {
    href: "/comments",
    eyebrow: "Forum",
    title: "Stel voor. Deel. Stem.",
    body: "Sê vir ons watter onderwerp volgende moet kom en lees wat ander leerders vra.",
    tone: "purple" as const,
  },
];

export default async function HomePage() {
  const [themes, videos, activities] = await Promise.all([
    getPublishedThemes(),
    getPublishedVideos(),
    getAllPublishedActivities(),
  ]);
  const latestVideo = videos[0] ?? null;
  const cover = publicFileUrl(imageFiles.home.hero);
  const [lead, ...others] = featuredProducts;

  return (
    <div className="pb-24">
      <HomeHero />

      <section className="relative mt-2 overflow-hidden border-y border-white/6 py-5">
        <div className="marquee">
          {[...topics, ...topics].map((topic, index) => (
            <span
              key={`${topic}-${index}`}
              className="flex items-center gap-4 whitespace-nowrap font-display text-lg font-bold text-white/55"
            >
              {topic}
              <span className="h-1.5 w-1.5 rounded-full bg-lime/70" aria-hidden />
            </span>
          ))}
        </div>
      </section>

      <section id="studiemateriaal" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Studiemateriaal"
          title={
            <>
              Notas wat die sillabus volg.{" "}
              <span className="gradient-text-warm">Woord vir woord.</span>
            </>
          }
          description="Elke pak dek een afdeling van die sillabus: notas, gemerkte diagramme, oefenvrae en ’n memorandum. Geskryf vir Afrikaanse leerders, deur ’n onderwyser."
          action={
            <ButtonLink href="/shop" tone="lime">
              Besoek die winkel
              <Arrow />
            </ButtonLink>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <TiltCard className="hero-frame group relative aspect-[4/5] w-full lg:h-full lg:aspect-auto" max={6}>
              {cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover object-[55%_50%] transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <Visual file={null} alt="" tone="orange" className="absolute inset-0" />
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/55 to-bg/10 p-7 md:p-9">
                <span className="eyebrow w-fit">{lead.badge ?? lead.kind} · Graad {lead.grade}</span>
                <h3 className="mt-4 max-w-md font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-4xl">
                  {lead.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/65">
                  {lead.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
                    R{lead.price}
                  </span>
                  <Link href={`/contact?produk=${lead.slug}`} className="btn btn-white btn-sm">
                    Doen navraag
                    <Arrow className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <div className="grid min-w-0 gap-4">
            {others.map((product, index) => (
              <Reveal key={product.slug} delay={90 + index * 80} className="min-w-0">
                <Link
                  href="/shop"
                  className="glass shine group flex items-stretch gap-4 overflow-hidden rounded-[1.75rem] transition-colors hover:border-white/25 sm:gap-5"
                >
                  <div className="relative w-24 shrink-0 sm:w-44">
                    <Visual
                      file={null}
                      alt=""
                      tone={product.tone}
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-bg/70 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                      Gr. {product.grade}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col py-5 pr-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                          {product.kind}
                        </p>
                        <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-white [overflow-wrap:anywhere] sm:text-xl">
                          {product.title}
                        </h3>
                      </div>
                      <span className="shrink-0 font-display text-xl font-extrabold tracking-[-0.03em] text-white sm:text-2xl">
                        R{product.price}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {product.bullets.slice(0, 2).join(" · ")}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-bold text-white/80">
                      Bekyk
                      <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={260} className="min-w-0">
              <div className="rounded-[1.75rem] border border-lime/25 bg-lime/6 p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                  Wat jy in elke pak kry
                </p>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/75">
                      <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M5 12l4 4L19 6" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Hoe dit werk"
          title={
            <>
              Drie stappe. <span className="gradient-text">Een gewoonte.</span>
            </>
          }
          description="MrBio is gebou om elke dag vir 15 minute gebruik te word — nie een nag voor die eksamen nie."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 90}>
              <article className="glass shine group relative h-full overflow-hidden rounded-[1.75rem] p-7">
                <span className="font-display text-6xl font-extrabold leading-none tracking-[-0.06em] text-white/8 transition-colors group-hover:text-lime/25">
                  0{index + 1}
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-white/60">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="grade" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Kies jou graad"
          title="Waar is jy op die reis?"
          description="Elke graad het sy eie notas, temas, video’s en daaglikse oefeninge."
          action={
            <ButtonLink href="/shop" tone="ghost">
              Notas per graad
              <Arrow />
            </ButtonLink>
          }
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {grades.map((grade, index) => {
            const count = activities.filter((item) => item.grade === grade).length;
            return (
              <Reveal key={grade} delay={index * 70}>
                <Link
                  href={gradeActivitiesPath(grade)}
                  className="grade-orb h-full"
                  style={{ ["--accent" as string]: gradeAccents[grade] }}
                >
                  <span className="grade-orb-num">{grade}</span>
                  <span className="mt-3 font-display text-lg font-bold">
                    Graad {grade}
                  </span>
                  <span className="mt-1 text-[13px] leading-5 text-white/55">
                    {gradeBlurbs[grade]}
                  </span>
                  <span className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                    {count > 0
                      ? `${count} ${count === 1 ? "oefening" : "oefeninge"}`
                      : "Notas · video’s · oefeninge"}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="sillabus" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Sillabus (KABV)"
          title={
            <>
              Kwartaal vir kwartaal. <span className="gradient-text">Presies wat die skool doen.</span>
            </>
          }
          description="Die notas, videolesse en oefeninge volg die KABV-jaarplan vir graad 10 tot 12. Kies jou graad om te sien wat wanneer behandel word — en waar om te begin."
        />
        <Reveal>
          <SyllabusExplorer />
        </Reveal>
      </section>

      <section id="temas" className="scroll-mt-28 pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Temas"
            title="Verken die groot idees"
            description="Elke tema bundel notas, video’s, feite en oefeninge rondom een deel van die sillabus."
          />
        </div>
        <div className="hide-scrollbar bleed-pad flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {themes.map((theme, index) => (
            <Reveal key={theme.slug} delay={index * 60} className="shrink-0 snap-start">
              <TiltCard className="group relative w-[min(78vw,19rem)] overflow-hidden rounded-[1.9rem] border border-white/10" max={6}>
                <Link href={theme.href} className="block">
                  <Visual
                    file={theme.file}
                    alt={theme.title}
                    ratio="3/4"
                    tone={theme.tone}
                    sizes="304px"
                    className="transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/40 to-transparent p-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                      Tema {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white">
                      {theme.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{theme.blurb}</p>
                    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-bg">
                      Verken
                      <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10">
              <Visual
                file={latestVideo?.thumbnailPath ?? null}
                alt={latestVideo?.title ?? "Nuutste videoles"}
                ratio="16/9"
                tone="green"
                art="leaf"
                sizes="(max-width: 1024px) 100vw, 720px"
                className="transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/50 to-transparent p-7 md:p-9">
                <span className="eyebrow w-fit">Nuutste videoles · Gratis</span>
                <h3 className="mt-4 max-w-lg font-display text-3xl font-extrabold leading-[1.05] text-white md:text-4xl">
                  {latestVideo?.title ?? "Fotosintese stap vir stap"}
                </h3>
                <p className="mt-3 max-w-md leading-7 text-white/65">
                  {latestVideo?.description ||
                    "Hoe plante lig, water en koolstofdioksied in suiker en suurstof omskep — in ses minute."}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href="/video-lessons"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-on-accent shadow-[0_0_40px_rgba(184,245,66,0.45)] transition-transform group-hover:scale-105"
                    aria-label="Kyk die video"
                  >
                    <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-current" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                  <span className="text-sm font-bold text-white/70">
                    {latestVideo?.grade ? `Graad ${latestVideo.grade}` : "Graad 10"} · 6 min
                  </span>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <Link
              href="/weekly-facts"
              className="glass shine group flex h-full flex-col justify-between rounded-[2rem] p-7 md:p-9"
            >
              <div>
                <span className="eyebrow">Feit van die week</span>
                <p className="mt-6 font-display text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white md:text-[2.2rem]">
                  Jou liggaam vervang omtrent{" "}
                  <span className="gradient-text">330 miljard selle</span> elke dag
                  — sowat 1% van jou hele lyf.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-white/55">
                  Selle & weefsel · Graad 10
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-all group-hover:bg-lime group-hover:text-on-accent">
                  <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Bonus · Oefen & toets"
          title={
            <>
              Tien maniere om <span className="gradient-text-warm">te oefen.</span>
            </>
          }
          description="Wanneer jy klaar gelees en gekyk het, toets jouself. Elke oefening gebruik die terme uit die notas, en die inhoud verander daagliks. Gratis."
          action={
            <ButtonLink href="/play-and-learn" tone="ghost">
              Sien alle oefeninge
              <Arrow />
            </ButtonLink>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {activityTypes.map((type, index) => (
            <Reveal key={type.slug} delay={(index % 5) * 60}>
              <Link
                href="/play-and-learn"
                className="game-card h-full"
                style={{ ["--accent" as string]: type.accent }}
              >
                <span className="game-card-icon">
                  <ActivityIcon kind={type.slug} />
                </span>
                <span className="font-display text-lg font-bold leading-tight">
                  {type.title}
                </span>
                <span className="text-[13px] leading-5 text-white/55">
                  {type.description}
                </span>
                <span className="mt-auto pt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/40">
                  {type.minutes}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-gradient-to-br from-bg-4 via-bg-2 to-bg">
            <span
              className="orb -right-20 -top-20 h-96 w-96"
              style={{ background: "rgba(184,245,66,0.35)" }}
            />
            <span
              className="orb -bottom-24 left-1/3 h-80 w-80"
              style={{ background: "rgba(255,106,77,0.25)", animationDelay: "-8s" }}
            />
            <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <Eyebrow>Daaglikse oefening</Eyebrow>
                <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white md:text-5xl">
                  Elke dag ’n nuwe stel vrae.
                  <br />
                  <span className="gradient-text">Dieselfde vir jou hele klas.</span>
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-8 text-white/65">
                  Om middernag verskyn ’n vars vasvra vir elke graad, gebou uit
                  die afdelings in die notas. Kies 5, 10, 15 of 25 vrae, sien
                  die verduideliking by elke antwoord, en vergelyk met jou maats.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/play-and-learn" tone="lime" size="lg">
                    Doen vandag s’n
                    <Arrow />
                  </ButtonLink>
                  <ButtonLink href="/about" tone="ghost" size="lg">
                    Hoe die telling werk
                  </ButtonLink>
                </div>
              </div>

              <TiltCard className="paper relative rounded-[1.9rem] p-6 md:p-7" max={5}>
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">
                  <span>Vasvra van die dag · Graad 10</span>
                  <span>Vraag 4 / 10</span>
                </div>
                <div className="progress-track mt-3 bg-navy/10">
                  <div className="progress-fill w-2/5" />
                </div>
                <p className="mt-6 font-display text-[1.45rem] font-bold leading-snug text-navy">
                  Watter organel is die plek waar fotosintese plaasvind?
                </p>
                <ul className="mt-5 grid gap-2.5">
                  {[
                    ["A", "Mitochondrion", "idle"],
                    ["B", "Chloroplast", "right"],
                    ["C", "Ribosoom", "idle"],
                    ["D", "Golgi-liggaam", "wrong"],
                  ].map(([letter, label, state]) => (
                    <li
                      key={letter}
                      className={`quiz-option quiz-option-${state} pointer-events-none`}
                    >
                      <span className="quiz-letter">{letter}</span>
                      <span className="flex-1 font-semibold">{label}</span>
                      {state === "right" ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-green">
                          Reg
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="quiz-explain mt-4 text-sm leading-6 text-navy/75">
                  <span className="font-bold text-navy">Hoekom?</span> Chloroplaste
                  bevat chlorofil wat ligenergie vasvang om glukose te bou.
                  Sien Graad 10 notas, afdeling 3.2.
                </div>
              </TiltCard>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Meer as notas"
          title="Vir leerders, ouers en onderwysers"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {community.map((item, index) => (
            <Reveal key={item.href} delay={index * 80}>
              <Link
                href={item.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 transition-colors hover:border-white/25"
              >
                <Visual
                  file={null}
                  alt=""
                  ratio="16/9"
                  tone={item.tone}
                  className="transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                    {item.eyebrow}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/55">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                    Gaan kyk
                    <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <SectionHeading
          eyebrow="Wat leerders en onderwysers sê"
          title="Gebou saam met klaskamers"
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map((quote, index) => (
            <Reveal key={quote.name} delay={index * 80}>
              <figure className="glass flex h-full flex-col rounded-[1.75rem] p-7">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-lime/60" aria-hidden>
                  <path d="M7.2 5C4.6 5 3 7 3 9.8c0 2.6 1.8 4.3 4 4.3.4 0 .7 0 1-.1-.5 2-2.2 3.5-4.5 4.2l.6 1.8C8.3 19 11 15.6 11 11.4 11 7.5 9.6 5 7.2 5Zm10 0c-2.6 0-4.2 2-4.2 4.8 0 2.6 1.8 4.3 4 4.3.4 0 .7 0 1-.1-.5 2-2.2 3.5-4.5 4.2l.6 1.8c4.2-1 6.9-4.4 6.9-8.6C21 7.5 19.6 5 17.2 5Z" />
                </svg>
                <blockquote className="mt-4 flex-1 text-[15.5px] leading-7 text-white/80">
                  {quote.body}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="cell h-10 w-10"
                    style={{
                      ["--cell-a" as string]: ["#b8f542", "#5ad1ff", "#ff6a4d"][index],
                      ["--cell-b" as string]: ["#1f6b33", "#16406e", "#8a3b14"][index],
                    }}
                  />
                  <span className="text-sm font-bold text-white">{quote.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.4rem] bg-lime px-8 py-14 text-center text-on-accent md:px-16 md:py-20">
            <span
              className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[rgba(255,255,255,0.3)] blur-3xl"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-mint/60 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-accent/60">
                Gereed?
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] md:text-6xl">
                Begin met die notas. Die res volg.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-on-accent/75">
                Kies jou graad, kry die pak vir die afdeling waarmee jy sukkel,
                en gebruik die gratis lesse en oefeninge om dit vas te lê.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="btn btn-lg bg-bg text-white hover:bg-bg-2">
                  Kry studiemateriaal
                  <Arrow />
                </Link>
                <Link href="/video-lessons" className="btn btn-lg border border-on-accent/25 bg-on-accent/15 text-on-accent hover:bg-on-accent/25">
                  Kyk eers ’n gratis les
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
