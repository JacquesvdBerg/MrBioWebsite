import { SectionPage } from "@/components/section-page";
import { ButtonLink } from "@/components/ui";
import { Visual } from "@/components/visual";
import { grades } from "@/lib/site";

export const metadata = {
  title: "Winkel",
};

export default function ShopPage() {
  return (
    <SectionPage
      eyebrow="Winkel"
      title="Onderrigmateriaal"
      description="Bekyk notas, werkkaarte, opsommings en pakke. Aanvanklik sonder aanlyn betaal — stuur ’n navraag en die onderwyser hanteer die res."
      visionPath="vision/public/shop"
    >
      <div className="mb-7 flex flex-wrap gap-2">
        <span className="rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white">
          Alle grade
        </span>
        {grades.map((grade) => (
          <span
            key={grade}
            className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-navy"
          >
            Graad {grade}
          </span>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article className="lift card-surface overflow-hidden">
          <Visual
            file="images/shop/product-pack.png"
            alt="Graad 11 studiepak"
            ratio="4/3"
            tone="green"
            sizes="(max-width: 640px) 100vw, 380px"
          />
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">
              Graad 11
            </p>
            <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy">
              Menslike bloedsomloopstelsel — volledige pak
            </h3>
            <p className="mt-3 font-display text-3xl font-extrabold text-navy">
              R120
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              <li>32 bladsye notas</li>
              <li>12 gemerkte diagramme</li>
              <li>Oefenvrae en memorandum</li>
            </ul>
            <ButtonLink href="/contact" tone="navy" className="mt-6 w-full justify-center">
              Doen navraag
            </ButtonLink>
          </div>
        </article>

        <article className="card-surface flex items-center justify-center border-dashed p-8 text-center text-muted">
          Meer produkte word uit die adminpaneel bygevoeg.
        </article>
      </div>
    </SectionPage>
  );
}
