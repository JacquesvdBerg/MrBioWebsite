import { HeroScene } from "@/components/hero-scene";
import { BeakerIcon } from "@/components/icons";

export function HomeHero() {
  return (
    <section className="home-hero relative flex overflow-hidden">
      <HeroScene />
      <div className="home-hero-wash pointer-events-none absolute inset-0" aria-hidden />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 pb-[86vw] pt-10 md:px-6 md:pb-40 md:pt-20">
        <div className="max-w-xl">
          <h1 className="hero-title rise">
            Ontdek.
            <br />
            Verstaan.
            <br />
            <span className="hero-swoosh">
              Verwonder.
              <svg viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden>
                <path d="M4 18C80 6 200 2 316 9" />
              </svg>
            </span>
          </h1>
          <p className="rise mt-7 max-w-md text-lg leading-8 text-white/80 [animation-delay:120ms]">
            Kort lesse wat die inhoud duidelik maak, en weeklikse vakverbande speletjies.
          </p>

          <div className="rise mt-9 flex flex-col items-start gap-4 [animation-delay:200ms]">
            <a href="#grade" className="btn btn-navy btn-lg pointer-events-auto uppercase tracking-[0.04em]">
              <BeakerIcon className="h-5 w-5" />
              Kom ons ontdek!
            </a>
            <p className="flex items-center gap-2 text-sm font-bold text-white/70">
              <span className="pulse-dot" aria-hidden />
              Klik op die kolletjies om meer te ontdek
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
