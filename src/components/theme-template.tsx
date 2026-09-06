import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Arrow, ButtonLink, Eyebrow } from "@/components/ui";
import { Visual } from "@/components/visual";
import { youtubeId } from "@/lib/theme-page";
import type { Theme } from "@/lib/themes";

const accentByTone: Record<Theme["tone"], string> = {
  green: "var(--lime)",
  teal: "var(--mint)",
  blue: "var(--sky)",
  purple: "var(--violet)",
  orange: "var(--sun)",
  navy: "var(--lime)",
};

export function ThemeTemplate({ theme }: { theme: Theme }) {
  const { page } = theme;
  const cards = page.cards.filter((card) => card.title);
  const video = youtubeId(page.featuredVideoUrl);
  const hasFeatured = Boolean(page.featuredTitle || video || page.featuredImage);
  const hasNote = Boolean(page.noteBody);
  const hasCta = Boolean(page.ctaHeading && page.ctaHref);
  const accent = accentByTone[theme.tone];

  return (
    <article style={{ ["--accent" as string]: accent }}>
      <header className="relative isolate overflow-hidden">
        <Visual
          file={theme.file}
          alt={theme.title}
          tone={theme.tone}
          priority
          className="absolute inset-0"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-20">
          <nav className="rise mb-6 flex items-center gap-2 text-xs font-bold text-white/50" aria-label="Broodkrummels">
            <Link href="/" className="hover:text-lime">Tuis</Link>
            <span aria-hidden>/</span>
            <Link href="/#temas" className="hover:text-lime">Temas</Link>
            <span aria-hidden>/</span>
            <span className="text-white/80">{theme.title}</span>
          </nav>
          <div className="rise">
            <Eyebrow>{page.kicker || "Tema"}</Eyebrow>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
              {theme.title}
            </h1>
            {theme.blurb ? (
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">{theme.blurb}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/play-and-learn" tone="lime">
                Oefen hierdie tema
                <Arrow />
              </ButtonLink>
              <ButtonLink href="/video-lessons" tone="ghost">
                Kyk die lesse
              </ButtonLink>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <Reveal>
            {page.introHeading ? (
              <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white md:text-[2.6rem]">
                {page.introHeading}
              </h2>
            ) : null}
            {page.introBody ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{page.introBody}</p>
            ) : null}
          </Reveal>

          {page.outcomes.length > 0 ? (
            <Reveal delay={100}>
              <ol className="glass space-y-4 rounded-[1.9rem] p-6 md:p-7">
                <li className="list-none text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
                  Wat jy sal leer
                </li>
                {page.outcomes.map((outcome, index) => (
                  <li key={outcome} className="flex gap-4 text-[15px] leading-6 text-white/85">
                    <span className="font-display text-lg font-extrabold" style={{ color: accent }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          ) : null}
        </section>

        {cards.length > 0 ? (
          <section className="mt-16 grid gap-4 md:grid-cols-3">
            {cards.map((card, index) => {
              const inner = (
                <>
                  <Visual
                    file={card.image || null}
                    alt={card.title}
                    ratio="16/9"
                    tone={theme.tone}
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-bold text-white">{card.title}</h3>
                    {card.body ? (
                      <p className="mt-2 flex-1 leading-7 text-white/60">{card.body}</p>
                    ) : null}
                    {card.href ? (
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                        Gaan kyk
                        <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    ) : null}
                  </div>
                </>
              );

              const className =
                "group glass flex h-full flex-col overflow-hidden rounded-[1.9rem] transition-colors hover:border-white/25";

              return (
                <Reveal key={card.title} delay={index * 80}>
                  {card.href ? (
                    <Link href={card.href} className={className}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={className}>{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </section>
        ) : null}

        {hasFeatured ? (
          <Reveal>
            <section className="mt-16 overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-bg-4 to-bg-2">
              <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-8 md:p-10">
                  {page.featuredEyebrow ? (
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
                      {page.featuredEyebrow}
                    </p>
                  ) : null}
                  {page.featuredTitle ? (
                    <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] text-white">
                      {page.featuredTitle}
                    </h2>
                  ) : null}
                  {page.featuredBody ? (
                    <p className="mt-4 leading-8 text-white/65">{page.featuredBody}</p>
                  ) : null}
                </div>
                <div className="bg-bg">
                  {video ? (
                    <iframe
                      title={page.featuredTitle || theme.title}
                      src={`https://www.youtube.com/embed/${video}`}
                      className="aspect-video h-full w-full min-h-64"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <Visual
                      file={page.featuredImage || theme.file}
                      alt={page.featuredTitle || theme.title}
                      ratio="16/9"
                      tone={theme.tone}
                      className="h-full min-h-64"
                      sizes="(max-width: 1024px) 100vw, 640px"
                    />
                  )}
                </div>
              </div>
            </section>
          </Reveal>
        ) : null}

        {hasNote ? (
          <Reveal>
            <aside className="mt-10 rounded-[1.6rem] border px-6 py-5" style={{ borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, background: `color-mix(in srgb, ${accent} 8%, transparent)` }}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
                {page.noteEyebrow || "Onthou"}
              </p>
              <p className="mt-2 leading-7 text-white/85">{page.noteBody}</p>
            </aside>
          </Reveal>
        ) : null}

        {hasCta ? (
          <Reveal>
            <section className="glass mt-16 flex flex-col items-start justify-between gap-6 rounded-[2.2rem] px-8 py-10 md:flex-row md:items-center">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
                  {page.ctaHeading}
                </h2>
                {page.ctaBody ? (
                  <p className="mt-2 max-w-xl leading-7 text-white/60">{page.ctaBody}</p>
                ) : null}
              </div>
              <Link href={page.ctaHref} className="btn btn-lime">
                {page.ctaLabel || "Gaan voort"}
                <Arrow />
              </Link>
            </section>
          </Reveal>
        ) : null}
      </div>
    </article>
  );
}
