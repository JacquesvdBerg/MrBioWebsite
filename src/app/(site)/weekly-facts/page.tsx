import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { TiltCard } from "@/components/tilt-card";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";
import { getPublishedWeeklyFacts, weeklyFactCategories } from "@/lib/weekly-facts";

export const metadata = {
  title: "Weeklikse feite",
  description:
    "Elke week een verstommende Lewenswetenskappe-feit, verduidelik in Afrikaans en gekoppel aan die sillabus.",
};

export const revalidate = 300;

type PageProps = {
  searchParams: Promise<{ kategorie?: string }>;
};

export default async function WeeklyFactsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const facts = await getPublishedWeeklyFacts();
  const category = params.kategorie?.trim() ?? "";
  const [featured, ...archiveAll] = facts;
  const archive = category
    ? archiveAll.filter((fact) => fact.category === category)
    : archiveAll;
  const chips = ["Alle", ...weeklyFactCategories];

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
      {featured ? (
        <Reveal>
          <TiltCard className="relative" max={3}>
            <article className="grid overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/4 lg:grid-cols-[0.9fr_1.1fr]">
              <Visual
                file={featured.imagePath}
                alt={featured.title}
                tone={featured.tone}
                art={featured.art}
                className="min-h-72 lg:min-h-full"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="flex flex-col p-7 md:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">Feit van die week</span>
                  {featured.category ? <span className="chip">{featured.category}</span> : null}
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
                  <ButtonLink href={`/play-and-learn/graad/${featured.grade}`} tone="ghost">
                    Oefen graad {featured.grade}
                  </ButtonLink>
                </div>
                {featured.weekLabel ? (
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                    {featured.weekLabel}
                  </p>
                ) : null}
              </div>
            </article>
          </TiltCard>
        </Reveal>
      ) : (
        <div className="glass rounded-[2rem] px-7 py-12 text-center">
          <p className="font-display text-2xl font-extrabold text-white">Nog geen live feit nie</p>
          <p className="mt-3 text-white/55">Die volgende week se feit word hier gepubliseer.</p>
        </div>
      )}

      <section className="mt-20">
        <SectionHeading
          eyebrow="Argief"
          title="Vorige weke"
          description="Blaai terug. Elke feit bly hier — en die meeste het ’n vasvra wat daarby pas."
        />
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {chips.map((chip) => {
            const href = chip === "Alle" ? "/weekly-facts" : `/weekly-facts?kategorie=${encodeURIComponent(chip)}`;
            const active = chip === "Alle" ? !category : category === chip;
            return (
              <Link key={chip} href={href} className={`chip shrink-0 ${active ? "is-active" : ""}`}>
                {chip}
              </Link>
            );
          })}
        </div>
        {archive.length === 0 ? (
          <p className="mt-6 text-sm text-white/55">
            {featured ? "Geen vorige feite in hierdie kategorie nie." : "Die argief is nog leeg."}
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((fact, index) => (
              <Reveal key={fact.slug} delay={(index % 3) * 70}>
                <article className="group glass flex h-full flex-col overflow-hidden rounded-[1.9rem] transition-colors hover:border-white/25">
                  <div className="relative">
                    <Visual
                      file={fact.imagePath}
                      alt=""
                      ratio="16/10"
                      tone={fact.tone}
                      art={fact.art}
                      className="transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    {fact.weekLabel ? (
                      <span className="absolute left-4 top-4 rounded-full bg-bg/70 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                        {fact.weekLabel}
                      </span>
                    ) : null}
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
        )}
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
