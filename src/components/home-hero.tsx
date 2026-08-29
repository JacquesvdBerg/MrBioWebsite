import Image from "next/image";
import { BeakerIcon } from "@/components/icons";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { publicFileUrl } from "@/lib/assets";
import { imageFiles } from "@/lib/image-files";
import { homeStats } from "@/lib/site";

export function HomeHero() {
  const hero = publicFileUrl(imageFiles.home.hero);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {hero ? (
          <Image
            src={hero}
            alt="Mikroskoop, DNA-string, saailing, voëltjie en paddas teen 'n wetenskapagtergrond"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_60%] md:object-center"
          />
        ) : (
          <div className="ph ph-navy h-full w-full" />
        )}

        {/* The artwork is deliberately light on the left, so the scrim only has
            to lift contrast for the copy: vertical on narrow screens where the
            crop shifts, horizontal on wide ones. */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/85 to-transparent md:bg-gradient-to-r md:from-cream/95 md:via-cream/45 md:to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-6 md:pt-20">
        <div className="rise max-w-xl">
          <Eyebrow>Graad 8 – 12 · 100% Afrikaans</Eyebrow>
          <h1 className="mt-5 font-display text-[2.9rem] font-extrabold leading-[0.98] text-navy sm:text-6xl lg:text-[4.75rem]">
            Ontdek.
            <br />
            <span className="text-green">Verstaan.</span>
            <br />
            Verwonder.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-navy/70">
            Jou alles-in-een plek vir Lewenswetenskappe. Kyk lesse, lees feite,
            speel aktiwiteite en vra jou vrae — alles op een plek.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#leer" tone="navy">
              <BeakerIcon className="h-[18px] w-[18px]" />
              Kom ons ontdek!
            </ButtonLink>
            <ButtonLink href="/video-lessons" tone="ghost">
              Sien die lesse
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 md:px-6 md:pb-20">
        <dl className="flex w-fit flex-wrap gap-x-10 gap-y-4 rounded-2xl border border-white/40 bg-white/55 px-6 py-4 backdrop-blur-sm">
          {homeStats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy/60">
                {stat.label}
              </dt>
              <dd className="font-display text-2xl font-extrabold text-navy">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
