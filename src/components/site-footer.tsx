import Link from "next/link";
import { MrBioLogo } from "@/components/brand";
import { YoutubeIcon } from "@/components/icons";
import { Arrow } from "@/components/ui";
import { footerNav, siteName } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="glass relative overflow-hidden rounded-[2.2rem] px-6 py-10 md:px-12 md:py-14">
          <span
            className="orb -right-24 -top-32 h-80 w-80"
            style={{ background: "rgba(184,245,66,0.35)" }}
          />
          <span
            className="orb -bottom-32 -left-16 h-72 w-72"
            style={{ background: "rgba(90,209,255,0.3)", animationDelay: "-9s" }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow">Bly op hoogte</p>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[2.6rem]">
                Een feit per week.
                <br />
                <span className="gradient-text">Nul strooipos.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/60">
                Kry die weeklikse feit, nuwe lesse en nuwe notas in die winkel
                direk in jou inkassie.
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                name="email"
                placeholder="jy@voorbeeld.co.za"
                disabled
                aria-label="E-posadres"
                className="input-dark flex-1 rounded-full px-5"
              />
              <button type="button" className="btn btn-lime" disabled>
                Skryf in
                <Arrow className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,0.7fr)]">
          <div>
            <MrBioLogo />
            <p className="mt-5 max-w-sm leading-7 text-white/55">
              MrBio is ’n Afrikaanse Lewenswetenskappe-wêreld vir graad 10 tot
              12. Lees, kyk, oefen en vra — alles op een plek, alles volgens die
              sillabus.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white transition-colors hover:border-coral hover:text-coral"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
              <span className="text-sm text-white/45">
                Nuwe video elke week op YouTube.
              </span>
            </div>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-lime">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-semibold text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="divider-glow mt-12" />

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}. Gemaak in Suid-Afrika vir
            Lewenswetenskappe-leerders.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/about" className="transition-colors hover:text-white">
              Privaatheid
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              Voorwaardes
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
