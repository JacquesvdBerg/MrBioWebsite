import Link from "next/link";
import { DnaMark, MailIcon, YoutubeIcon } from "@/components/icons";
import { publicNav, siteName, siteTagline } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-10 shadow-[var(--shadow-lg)] md:px-10">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(47,163,74,0.55), transparent 62%)",
            }}
          />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <MailIcon className="h-6 w-6 text-gold" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-white md:text-3xl">
                  Sluit aan by die {siteName} gemeenskap
                </p>
                <p className="mt-1.5 text-white/65">
                  Kry weeklikse feite en nuwe lesse in jou inkassie.
                </p>
              </div>
            </div>

            <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                name="email"
                placeholder="Jou e-posadres"
                disabled
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/95 px-4 py-3 text-sm text-navy placeholder:text-muted/70"
              />
              <button
                type="button"
                className="rounded-full bg-green px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-deep"
              >
                Teken in
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 border-b border-line pb-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-line">
                <DnaMark className="h-6 w-6" />
              </span>
              <span className="leading-tight">
                <span className="block font-display font-bold text-navy">
                  {siteName}
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {siteTagline}
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              ’n Afrikaanse leerplatform vir Lewenswetenskappe, graad 8 tot 12.
            </p>
          </div>

          <nav className="grid gap-2 sm:grid-cols-2">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-navy/70 transition-colors hover:text-green"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Volg
            </p>
            <div className="mt-3 flex gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-navy">
                <YoutubeIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}. Alle regte voorbehou.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/about" className="hover:text-navy">
              Privaatheid
            </Link>
            <Link href="/about" className="hover:text-navy">
              Voorwaardes
            </Link>
            <Link href="/contact" className="hover:text-navy">
              Kontak
            </Link>
            <Link href="/admin" className="hover:text-navy">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
