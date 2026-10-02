import Link from "next/link";
import { MrBioLogo, MrBioMark } from "@/components/brand";
import { MailIcon, YoutubeIcon } from "@/components/icons";
import { Arrow } from "@/components/ui";
import { footerNav, siteName } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="newsletter-bar">
          <span className="newsletter-bar-icon">
            <MailIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-extrabold leading-tight text-white md:text-2xl">
              Sluit aan by die {siteName}-gemeenskap!
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Bly op hoogte van nuwe lesse, die weeklikse feit en gratis hulpbronne.
            </p>
          </div>
          <form className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              type="email"
              name="email"
              placeholder="Jou e-posadres"
              disabled
              aria-label="E-posadres"
              className="newsletter-input"
            />
            <button type="button" className="btn btn-lime" disabled>
              Skryf in
              <Arrow className="h-4 w-4" />
            </button>
          </form>
          <MrBioMark className="hidden h-24 w-24 -my-6 xl:block" />
        </div>
      </div>

      <div className="site-footer-base">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))]">
            <div>
              <MrBioLogo />
              <p className="mt-5 max-w-sm leading-7 text-white/55">
                MnrBio is ’n Afrikaanse Lewenswetenskappe-wêreld vir graad 8 tot
                12. Kies jou graad, werk kwartaal vir kwartaal, en vra wanneer jy vassteek.
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
      </div>
    </footer>
  );
}
