import { SectionPage } from "@/components/section-page";
import { Visual } from "@/components/visual";
import { ButtonLink } from "@/components/ui";

export const metadata = {
  title: "Weeklikse feite",
};

export default function WeeklyFactsPage() {
  return (
    <SectionPage
      eyebrow="Weeklikse feite"
      title="Feit van die week"
      description="’n Prominente Lewenswetenskappe-feit met titel, verduideliking, illustrasie en kategorie. Ouer feite verskyn hieronder in ’n argief."
      visionPath="vision/public/weekly-facts"
    >
      <article className="card-surface grid overflow-hidden lg:grid-cols-2">
        <Visual
          file="images/weekly-facts/featured.png"
          alt="Uitgeligte Lewenswetenskappe-feit"
          ratio="4/3"
          tone="teal"
          sizes="(max-width: 1024px) 100vw, 620px"
          className="h-full"
        />
        <div className="p-7 md:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-green">
            Menslike biologie · Graad 11
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-navy">
            Arteries het dikker wande as vene
          </h2>
          <p className="mt-4 leading-8 text-muted">
            Voorbeeldinhoud tot die eerste goedgekeurde feit uit die adminpaneel
            gepubliseer word. KI-konsepte kom eers as konsepte in, nooit
            outomaties live nie.
          </p>
          <ButtonLink href="/video-lessons" tone="green" className="mt-6">
            Sien die verwante les
          </ButtonLink>
        </div>
      </article>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Genetika", "Ekologie", "Selle"].map((category) => (
          <article key={category} className="card-surface p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
              {category}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-navy">
              Argief kom binnekort
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Ouer feite word hier gelys sodra hulle gepubliseer is.
            </p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}
