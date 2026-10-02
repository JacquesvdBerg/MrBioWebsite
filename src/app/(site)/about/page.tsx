import Link from "next/link";
import { DnaHelix } from "@/components/dna-helix";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";

export const metadata = {
  title: "Oor ons",
  description:
    "Waarom MnrBio bestaan, hoe die platform gebou is en wie daaragter staan.",
};

const pillars = [
  {
    title: "Sillabus eerste",
    body: "Elke nota, les, feit en oefening is gekoppel aan die CAPS-inhoud vir graad 10 tot 12. Niks ekstra, niks wat ontbreek nie.",
    tone: "green" as const,
  },
  {
    title: "Afrikaans as tuistaal",
    body: "Vaktaal en verduidelikings in Afrikaans, met die Engelse terme daarby waar dit in die eksamen help.",
    tone: "teal" as const,
  },
  {
    title: "Leer deur te doen",
    body: "Video’s bou die begrip. Speletjies maak dit vas. Terugvoer wys presies waar jy nog moet oefen.",
    tone: "purple" as const,
  },
  {
    title: "Elke dag ’n bietjie",
    body: "Daaglikse uitdagings van tien minute werk beter as een lang sessie voor die eksamen. Ons bou vir gewoontes.",
    tone: "orange" as const,
  },
];

const timeline = [
  {
    year: "2019",
    title: "’n Klaskamer-eksperiment",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ’n Onderwyser begin kort Afrikaanse video’s vir sy eie graad 11-klas maak.",
  },
  {
    year: "2022",
    title: "Die YouTube-kanaal groei",
    body: "Sed do eiusmod tempor incididunt ut labore. Leerders van ander skole begin die video’s vind en vra vir meer onderwerpe.",
  },
  {
    year: "2025",
    title: "Speletjies word bygevoeg",
    body: "Ut enim ad minim veniam, quis nostrud exercitation. Die eerste vasvra van die dag word gedoen — en die klas wil nog hê.",
  },
  {
    year: "2026",
    title: "MnrBio word gebore",
    body: "Alles kom saam onder een naam: notas, video’s, feite, oefeninge en ’n forum. Gebou vir leerders, deur ’n onderwyser.",
  },
];

const faqs = [
  {
    q: "Is MnrBio gratis?",
    a: "Die video’s, weeklikse feite en daaglikse oefeninge is gratis. Die notas en eksamenpakke in die winkel word gekoop, en sommige oefeninge sal later ’n rekening vereis.",
  },
  {
    q: "Moet ek aanmeld om te oefen?",
    a: "Nee. Kies jou graad en begin. Ons werk aan rekeninge sodat jy jou vordering en punte kan bewaar.",
  },
  {
    q: "Hoe word die daaglikse vrae gemaak?",
    a: "Die onderwyser stel die onderwerpe en keur elke stel vrae goed voordat dit verskyn. Niks gaan outomaties live nie.",
  },
  {
    q: "Kan my skool dit gebruik?",
    a: "Ja — baie onderwysers gebruik die vasvra van die dag as opwarming. Kontak ons vir klasgebruik en groeppryse op hulpbronne.",
  },
];

export default function AboutPage() {
  return (
    <SectionPage
      eyebrow="Oor ons"
      title={
        <>
          Gebou deur ’n onderwyser.{" "}
          <span className="gradient-text">Getoets deur leerders.</span>
        </>
      }
      description="MnrBio het in ’n regte klaskamer begin. Dit is nog steeds die maatstaf: as dit nie ’n graad 11-leerder op ’n Dinsdagmiddag laat verstaan nie, verander ons dit."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/about", label: "Oor ons" },
      ]}
      actions={
        <>
          <ButtonLink href="/contact" tone="lime">
            Kontak ons
            <Arrow />
          </ButtonLink>
          <ButtonLink href="/shop" tone="ghost">
            Bekyk die studiemateriaal
          </ButtonLink>
        </>
      }
      aside={
        <div className="relative mx-auto flex max-w-sm items-center justify-center lg:justify-end">
          <div className="hero-frame relative aspect-[4/5] w-full max-w-xs">
            <Visual file="images/about/hero.png" alt="Die onderwyser agter MnrBio" tone="teal" art="cell" className="absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 z-10 p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                Mnr. Bio
              </p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                Lewenswetenskappe-onderwyser
              </p>
              <p className="text-sm text-white/60">12 jaar in die klaskamer</p>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-10 top-0 hidden xl:block">
            <DnaHelix height={320} width={80} />
          </div>
        </div>
      }
    >
      <section>
        <SectionHeading
          eyebrow="Waarvoor ons staan"
          title="Vier reëls wat alles bepaal"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 80}>
              <article className="glass group flex h-full gap-5 rounded-[1.75rem] p-6 md:p-7">
                <span className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:block">
                  <Visual file={null} alt="" tone={pillar.tone} className="h-full w-full" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 leading-7 text-white/60">{pillar.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>Ons storie</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[2.6rem]">
            Van een klas tot ’n hele land
          </h2>
          <p className="mt-4 leading-7 text-white/60">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p className="mt-4 leading-7 text-white/60">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident.
          </p>
        </div>
        <ol className="relative space-y-6 border-l border-white/10 pl-8">
          {timeline.map((item, index) => (
            <li key={item.year} className="relative">
              <Reveal delay={index * 90}>
                <span className="absolute -left-[2.45rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-lime/50 bg-bg">
                  <span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_12px_var(--lime)]" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                  {item.year}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 leading-7 text-white/60">{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24">
        <SectionHeading eyebrow="Vrae" title="Gereelde vrae" align="center" />
        <div className="mx-auto grid max-w-4xl gap-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.q} delay={index * 60}>
              <details className="group glass rounded-2xl px-6 py-5 open:border-lime/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-white">
                  {faq.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-white/60">{faq.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2.2rem] p-8 text-center md:p-14">
            <span className="orb -left-20 -top-20 h-72 w-72" style={{ background: "rgba(184,245,66,0.3)" }} />
            <span className="orb -bottom-24 -right-16 h-72 w-72" style={{ background: "rgba(90,209,255,0.28)", animationDelay: "-7s" }} />
            <div className="relative">
              <Eyebrow>Sluit aan</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
                Het jy ’n idee vir ’n les of oefening?
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-white/60">
                Die beste onderwerpe kom van leerders. Stel iets voor op die
                forum of stuur ons ’n boodskap.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/comments" className="btn btn-lime">
                  Na die forum
                  <Arrow />
                </Link>
                <Link href="/contact" className="btn btn-ghost">
                  Kontak ons
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SectionPage>
  );
}
