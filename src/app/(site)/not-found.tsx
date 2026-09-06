import Link from "next/link";
import { DnaHelix } from "@/components/dna-helix";
import { Arrow, Eyebrow } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70svh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center md:px-6">
      <span className="orb left-1/4 top-0 h-80 w-80" style={{ background: "rgba(184,245,66,0.25)" }} />
      <span className="orb right-1/4 bottom-0 h-72 w-72" style={{ background: "rgba(255,106,77,0.25)", animationDelay: "-6s" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
        <DnaHelix height={360} width={120} />
      </div>
      <div className="relative rise">
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
          Hierdie sel <span className="gradient-text">bestaan nie.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-white/60">
          Die bladsy is verhuis, verwyder, of het nooit bestaan nie. Kom ons kry
          jou terug na iets wat lewe.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-lime">
            Terug tuis
            <Arrow />
          </Link>
          <Link href="/play-and-learn" className="btn btn-ghost">
            Oefen iets
          </Link>
        </div>
      </div>
    </div>
  );
}
