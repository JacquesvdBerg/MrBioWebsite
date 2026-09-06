import { CountUp } from "@/components/count-up";
import { DnaCanvas } from "@/components/dna-canvas";
import { RotatingHeadline } from "@/components/rotating-headline";
import { Arrow, ButtonLink } from "@/components/ui";
import { homeStats } from "@/lib/site";

export function HomeHero() {
  return (
    <section className="relative isolate -mt-[4.5rem] overflow-hidden pt-[4.5rem]">
      <span
        className="orb left-[-12%] top-[-10%] h-[520px] w-[520px]"
        style={{ background: "rgba(184,245,66,0.24)" }}
      />
      <span
        className="orb right-[-8%] top-[5%] h-[520px] w-[520px]"
        style={{ background: "rgba(90,209,255,0.22)", animationDelay: "-7s" }}
      />
      <span
        className="orb bottom-[-20%] left-[40%] h-[420px] w-[420px]"
        style={{ background: "rgba(157,140,255,0.2)", animationDelay: "-12s" }}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-10 pt-14 md:px-8 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:pb-16">
        <div className="rise relative z-10">
          <RotatingHeadline />
          <p className="mt-8 max-w-lg text-lg leading-8 text-white/65">
            MrBio is ’n Afrikaanse leerplatform vir Lewenswetenskappe.
            Sillabusgerigte notas en eksamenpakke, kort videolesse wat die
            moeilike goed duidelik maak, en daaglikse oefening om dit te laat
            vassteek.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/shop" tone="lime" size="lg">
              Kry studiemateriaal
              <Arrow className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/video-lessons" tone="ghost" size="lg">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white" aria-hidden>
                  <path d="M8 6v12l10-6z" />
                </svg>
              </span>
              Kyk ’n gratis les
            </ButtonLink>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative h-[400px] sm:h-[480px] lg:h-[620px]">
            <DnaCanvas className="absolute inset-0" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8">
        <dl className="glass grid grid-cols-2 divide-white/8 rounded-[1.75rem] md:grid-cols-4 md:divide-x">
          {homeStats.map((stat) => (
            <div key={stat.label} className="px-6 py-6 md:py-7">
              <dd className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-1 text-[12px] font-bold uppercase tracking-[0.14em] text-white/45">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
