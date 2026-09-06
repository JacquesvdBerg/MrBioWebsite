import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { TiltCard } from "@/components/tilt-card";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { Visual, type VisualTone } from "@/components/visual";
import type { BioArtKind } from "@/components/bio-art";

export const metadata = {
  title: "Weeklikse feite",
  description:
    "Elke week een verstommende Lewenswetenskappe-feit, verduidelik in Afrikaans en gekoppel aan die sillabus.",
};

type Fact = {
  slug: string;
  category: string;
  grade: number;
  title: string;
  body: string;
  tone: VisualTone;
  art: BioArtKind;
  week: string;
};

const featured: Fact = {
  slug: "arteries-vs-vene",
  category: "Menslike liggaam",
  grade: 11,
  title: "Arteries het dikker wande as vene — en dis nie toevallig nie.",
  body: "Bloed verlaat die hart onder hoë druk. Arteries het dus dik, elastiese spierwande wat kan rek en terugspring met elke hartslag. Vene dra bloed teen lae druk terug en het dunner wande, ’n groter lumen en kleppe wat terugvloei stop. Dís hoekom jy ’n pols aan jou arteries voel, maar nie aan jou vene nie.",
  tone: "orange",
  art: "heart",
  week: "Week 36 · 2026",
};

const archive: Fact[] = [
  {
    slug: "330-miljard-selle",
    category: "Selle & weefsel",
    grade: 10,
    title: "Jou liggaam vervang omtrent 330 miljard selle per dag.",
    body: "Dis sowat 1% van al jou selle — meestal bloed- en dermselle. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    tone: "teal",
    art: "cell",
    week: "Week 35",
  },
  {
    slug: "dna-lengte",
    category: "Genetika",
    grade: 12,
    title: "Al die DNA in een sel is omtrent 2 meter lank.",
    body: "Opgevou in ’n kern van 6 mikrometer. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tone: "green",
    art: "dna",
    week: "Week 34",
  },
  {
    slug: "blaar-suurstof",
    category: "Plante",
    grade: 10,
    title: "Een groot boom lewer genoeg suurstof vir twee mense per dag.",
    body: "Fotosintese in aksie, elke dag, sonder ’n enkele geluid. Ut enim ad minim veniam, quis nostrud exercitation.",
    tone: "green",
    art: "leaf",
    week: "Week 33",
  },
  {
    slug: "bakterie-getal",
    category: "Mikro-organismes",
    grade: 11,
    title: "Daar is meer bakterieselle in jou as menslike selle.",
    body: "Die meeste van hulle help jou. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    tone: "purple",
    art: "microbe",
    week: "Week 32",
  },
  {
    slug: "oog-kleure",
    category: "Senuweestelsel",
    grade: 12,
    title: "Die menslike oog kan omtrent 10 miljoen kleure onderskei.",
    body: "Drie tipes keëltjies, een verbysterende brein. Excepteur sint occaecat cupidatat non proident.",
    tone: "blue",
    art: "eye",
    week: "Week 31",
  },
  {
    slug: "water-molekule",
    category: "Chemie van lewe",
    grade: 10,
    title: "Die water wat jy vandag drink, was al deur ’n dinosourus.",
    body: "Water word nie gemaak of vernietig nie — net gesirkuleer. Sunt in culpa qui officia deserunt mollit anim.",
    tone: "blue",
    art: "molecule",
    week: "Week 30",
  },
];

const categories = [
  "Alle",
  "Selle & weefsel",
  "Genetika",
  "Plante",
  "Menslike liggaam",
  "Mikro-organismes",
  "Ekologie",
];

export default function WeeklyFactsPage() {
  return (
    <SectionPage
      eyebrow="Weeklikse feite"
      title={
        <>
          Een feit. Elke week.{" "}
          <span className="gradient-text">Vir altyd onthou.</span>
        </>
      }
      description="Klein stukkies biologie wat te goed is om nie te deel nie — elkeen verduidelik en gekoppel aan die deel van die sillabus waar dit hoort."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/weekly-facts", label: "Feite" },
      ]}
    >
      <Reveal>
        <TiltCard className="relative" max={3}>
          <article className="grid overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/4 lg:grid-cols-[0.9fr_1.1fr]">
            <Visual
              file="images/weekly-facts/featured.png"
              alt={featured.title}
              tone={featured.tone}
              art={featured.art}
              className="min-h-72 lg:min-h-full"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div className="flex flex-col p-7 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">Feit van die week</span>
                <span className="chip">{featured.category}</span>
                <span className="chip">Graad {featured.grade}</span>
              </div>
              <h2 className="mt-6 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[2.6rem]">
                {featured.title}
              </h2>
              <p className="mt-5 leading-8 text-white/65">{featured.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/video-lessons" tone="lime">
                  Kyk die verwante les
                  <Arrow />
                </ButtonLink>
                <ButtonLink href="/play-and-learn/graad/11" tone="ghost">
                  Oefen graad 11
                </ButtonLink>
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                {featured.week}
              </p>
            </div>
          </article>
        </TiltCard>
      </Reveal>

      <section className="mt-20">
        <SectionHeading
          eyebrow="Argief"
          title="Vorige weke"
          description="Blaai terug. Elke feit bly hier — en die meeste het ’n vasvra wat daarby pas."
        />
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {categories.map((category, index) => (
            <span key={category} className={`chip shrink-0 ${index === 0 ? "is-active" : ""}`}>
              {category}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {archive.map((fact, index) => (
            <Reveal key={fact.slug} delay={(index % 3) * 70}>
              <article className="group glass flex h-full flex-col overflow-hidden rounded-[1.9rem] transition-colors hover:border-white/25">
                <div className="relative">
                  <Visual
                    file={null}
                    alt=""
                    ratio="16/10"
                    tone={fact.tone}
                    art={fact.art}
                    className="transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-bg/70 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    {fact.week}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                    {fact.category} · Graad {fact.grade}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white">
                    {fact.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-white/55">{fact.body}</p>
                  <Link
                    href={`/play-and-learn/graad/${fact.grade}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white"
                  >
                    Doen die vasvra
                    <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2.2rem] p-8 md:p-12">
            <span className="orb -right-20 -top-20 h-72 w-72" style={{ background: "rgba(255,200,87,0.3)" }} />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="eyebrow">Het jy ’n feit?</span>
                <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-4xl">
                  Stuur jou eie verstommende feit
                </h2>
                <p className="mt-3 max-w-xl leading-7 text-white/60">
                  As ons dit gebruik, kry jy krediet op die werf. Bron moet
                  ingesluit wees — ons kontroleer alles.
                </p>
              </div>
              <ButtonLink href="/comments" tone="lime" size="lg">
                Stuur ’n feit
                <Arrow />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </SectionPage>
  );
}
