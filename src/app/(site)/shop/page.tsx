import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { TiltCard } from "@/components/tilt-card";
import { Arrow, ButtonLink, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";
import { bundles, products } from "@/lib/shop-data";
import { grades } from "@/lib/site";

export const metadata = {
  title: "Studiemateriaal",
  description:
    "Notas, werkkaarte, opsommings en eksamenpakke vir Lewenswetenskappe graad 10 tot 12.",
};

export default function ShopPage() {
  return (
    <SectionPage
      eyebrow="Studiemateriaal"
      title={
        <>
          Notas wat die sillabus volg.{" "}
          <span className="gradient-text-warm">Woord vir woord.</span>
        </>
      }
      description="Notas, werkkaarte en eksamenpakke, geskryf deur dieselfde onderwyser wat die video’s maak. Aanvanklik sonder aanlyn betaling — stuur ’n navraag en ons hanteer die res."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/shop", label: "Studiemateriaal" },
      ]}
      aside={
        <div className="grid grid-cols-3 gap-3 lg:justify-end">
          {[
            [String(products.length), "Produkte"],
            ["PDF", "+ gedruk"],
            ["R60", "vanaf"],
          ].map(([value, label]) => (
            <div key={label} className="glass rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/45">{label}</p>
            </div>
          ))}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="chip is-active">Alle grade</span>
        {grades.map((grade) => (
          <Link key={grade} href={`#graad-${grade}`} className="chip">
            Graad {grade}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <Reveal key={product.slug} delay={(index % 3) * 70}>
            <TiltCard className="group relative h-full" max={5}>
              <article
                id={`graad-${product.grade}`}
                className="glass flex h-full flex-col overflow-hidden rounded-[1.9rem] scroll-mt-32"
              >
                <div className="relative">
                  <Visual
                    file={null}
                    alt={product.title}
                    ratio="4/3"
                    tone={product.tone}
                    className="transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-bg/70 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                    Graad {product.grade}
                  </span>
                  {product.badge ? (
                    <span className="absolute right-4 top-4 rounded-full bg-lime px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-on-accent">
                      {product.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                    {product.kind}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white">
                    {product.title}
                  </h3>
                  <ul className="mt-4 space-y-1.5 text-sm text-white/60">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <p className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
                      R{product.price}
                    </p>
                    <Link
                      href={`/contact?produk=${product.slug}`}
                      className="btn btn-white btn-sm"
                    >
                      Doen navraag
                      <Arrow className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <section id="bundels" className="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Bundels"
          title="Meer vir minder"
          description="Vir leerders wat die hele jaar wil dek — en vir onderwysers wat vir ’n klas druk."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {bundles.map((bundle, index) => (
            <Reveal key={bundle.title} delay={index * 90}>
              <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-bg-4 to-bg-2 p-8">
                <span
                  className="orb -right-16 -top-16 h-56 w-56"
                  style={{ background: index === 0 ? "rgba(184,245,66,0.35)" : "rgba(157,140,255,0.35)" }}
                />
                <div className="relative flex-1">
                  <h3 className="font-display text-2xl font-extrabold text-white">
                    {bundle.title}
                  </h3>
                  <p className="mt-3 leading-7 text-white/60">{bundle.body}</p>
                </div>
                <div className="relative mt-8 flex items-end justify-between">
                  <p>
                    <span className="font-display text-4xl font-extrabold tracking-[-0.03em] text-white">
                      R{bundle.price}
                    </span>
                    {bundle.was ? (
                      <span className="ml-3 text-white/40 line-through">R{bundle.was}</span>
                    ) : null}
                  </p>
                  <ButtonLink href="/contact" tone="lime" size="sm">
                    Navraag
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-4 md:grid-cols-3">
        {[
          ["Hoe koop ek?", "Klik “Doen navraag”, sê watter produk jy wil hê, en ons stuur ’n faktuur en die PDF sodra betaling deur is."],
          ["Gedruk of digitaal?", "Alles is PDF. Gedrukte kopieë word op aanvraag gepos — vra vir ’n kwotasie."],
          ["Vir skole", "Klas-lisensies sluit onbeperkte druk vir een skool en ’n onderwysergids in."],
        ].map(([title, body], index) => (
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
