import Link from "next/link";
import { GradeCatalogue } from "@/components/grade-catalogue";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { Arrow, ButtonLink } from "@/components/ui";
import { catalogueForGrade, getPublishedProducts, hasCatalogue } from "@/lib/products";
import { gradeColors, grades, isGrade } from "@/lib/site";

export const metadata = {
  title: "Winkel",
  description:
    "Opsommings, kernkaarte en YouTube-skyfievertonings vir Lewenswetenskappe, graad 10 tot 12.",
};

export const revalidate = 300;

type ShopPageProps = {
  searchParams: Promise<{ graad?: string }>;
};

const faq = [
  [
    "Hoe koop ek?",
    "Klik “Navraag” by wat jy wil hê en stuur die vorm. Ons stuur ’n faktuur, en die PDF sodra die betaling deur is.",
  ],
  [
    "Per kwartaal of die hele jaar?",
    "Koop net die kwartaal wat jy nou nodig het, of die volledige pakket vir die hele jaar teen ’n beter prys.",
  ],
  [
    "Wat is ’n skyfievertoning?",
    "Die skyfies wat in die YouTube-videolesse gebruik word, as ’n PDF. Handig om saam met die video te hersien.",
  ],
] as const;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selected = Number(params.graad);
  const activeGrade = isGrade(selected) ? selected : null;
  const products = await getPublishedProducts();
  const catalogues = grades
    .map((grade) => catalogueForGrade(products, grade))
    .filter((catalogue) => (activeGrade ? catalogue.grade === activeGrade : true))
    .filter(hasCatalogue);
  const stocked = new Set(
    grades.filter((grade) => hasCatalogue(catalogueForGrade(products, grade))),
  );

  return (
    <SectionPage
      eyebrow="Winkel"
      title={
        <>
          Studiemateriaal per graad. <span className="gradient-text-warm">Kies eers.</span>
        </>
      }
      description="Opsommings per kwartaal, die volledige jaarpakket en die skyfies uit die YouTube-videolesse. Kies ’n graad om net daardie jaar se materiaal te sien."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/shop", label: "Winkel" },
      ]}
    >
      <nav aria-label="Kies ’n graad" className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        <Link
          href="/shop"
          aria-current={activeGrade === null ? "page" : undefined}
          className={`shop-grade ${activeGrade === null ? "is-active" : ""}`}
          style={{ ["--c1" as string]: "#2a4478", ["--c2" as string]: "#13254a" }}
        >
          <span className="shop-grade-num is-word">Alles</span>
          <span className="shop-grade-label">Alle grade</span>
        </Link>
        {grades.map((grade) => (
          <Link
            key={grade}
            href={`/shop?graad=${grade}`}
            aria-current={activeGrade === grade ? "page" : undefined}
            className={`shop-grade ${activeGrade === grade ? "is-active" : ""}`}
            style={{ ["--c1" as string]: gradeColors[grade][0], ["--c2" as string]: gradeColors[grade][1] }}
          >
            <span className="shop-grade-num">{grade}</span>
            <span className="shop-grade-label">{stocked.has(grade) ? `Graad ${grade}` : "Binnekort"}</span>
          </Link>
        ))}
      </nav>

      {catalogues.length === 0 ? (
        <div className="glass mt-8 rounded-[2rem] px-7 py-12 text-center">
          <p className="font-display text-2xl font-extrabold text-white">
            {activeGrade ? `Materiaal vir graad ${activeGrade} kom binnekort` : "Die katalogus is nog leeg"}
          </p>
          <p className="mt-3 text-white/55">Stuur gerus ’n navraag as jy iets spesifiek soek.</p>
          <div className="mt-6">
            <ButtonLink href="/contact" tone="lime">
              Kontak ons
              <Arrow />
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-14">
          {catalogues.map((catalogue) => (
            <Reveal key={catalogue.grade}>
              <GradeCatalogue catalogue={catalogue} />
            </Reveal>
          ))}
        </div>
      )}

      <section className="mt-20 grid gap-4 md:grid-cols-3">
        {faq.map(([title, body], index) => (
          <Reveal key={title} delay={index * 70}>
            <div className="glass h-full rounded-[1.6rem] p-6">
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </SectionPage>
  );
}
