import Link from "next/link";
import { Visual } from "@/components/visual";
import { youtubeId } from "@/lib/theme-page";
import type { Theme } from "@/lib/themes";

const heroWash: Record<Theme["tone"], string> = {
  green: "from-black/80 via-[#163528]/45 to-transparent",
  teal: "from-black/80 via-[#0f3f3d]/45 to-transparent",
  blue: "from-black/80 via-[#10283f]/50 to-transparent",
  purple: "from-black/80 via-[#2c1a4a]/45 to-transparent",
  orange: "from-black/80 via-[#5c2a12]/45 to-transparent",
  navy: "from-black/80 via-[#091827]/55 to-transparent",
};

export function ThemeTemplate({ theme }: { theme: Theme }) {
  const { page } = theme;
  const cards = page.cards.filter((card) => card.title);
  const video = youtubeId(page.featuredVideoUrl);
  const hasFeatured = Boolean(page.featuredTitle || video || page.featuredImage);
  const hasNote = Boolean(page.noteBody);
  const hasCta = Boolean(page.ctaHeading && page.ctaHref);

  return (
    <article>
      <header className="relative isolate min-h-[72svh] overflow-hidden">
        <Visual
          file={theme.file}
          alt={theme.title}
          tone={theme.tone}
          priority
          className="absolute inset-0"
          sizes="100vw"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${heroWash[theme.tone]}`}
        />
        <div className="relative mx-auto flex min-h-[72svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
            {page.kicker || "Tema"}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[0.95] text-white md:text-7xl">
            {theme.title}
          </h1>
          {theme.blurb ? (
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
              {theme.blurb}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            {page.introHeading ? (
              <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
                {page.introHeading}
              </h2>
            ) : null}
            {page.introBody ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                {page.introBody}
              </p>
            ) : null}
          </div>

          {page.outcomes.length > 0 ? (
            <ol className="card-surface space-y-4 p-6">
              <li className="list-none text-[11px] font-bold uppercase tracking-[0.16em] text-green">
                Wat jy sal leer
              </li>
              {page.outcomes.map((outcome, index) => (
                <li key={outcome} className="flex gap-3 text-[15px] leading-6 text-navy">
                  <span className="font-display text-lg font-bold text-green">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </section>

        {cards.length > 0 ? (
          <section className="mt-16 grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const inner = (
                <>
                  {card.image ? (
                    <Visual
                      file={card.image}
                      alt={card.title}
                      ratio="16/9"
                      tone={theme.tone}
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-navy">
                      {card.title}
                    </h3>
                    {card.body ? (
                      <p className="mt-2 leading-7 text-muted">{card.body}</p>
                    ) : null}
                    {card.href ? (
                      <span className="mt-4 inline-flex text-sm font-bold text-green">
                        Gaan kyk →
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return card.href ? (
                <Link
                  key={card.title}
                  href={card.href}
                  className="lift card-surface overflow-hidden"
                >
                  {inner}
                </Link>
              ) : (
                <div key={card.title} className="card-surface overflow-hidden">
                  {inner}
                </div>
              );
            })}
          </section>
        ) : null}

        {hasFeatured ? (
          <section className="mt-16 overflow-hidden rounded-[2rem] bg-navy text-white shadow-[var(--shadow-lg)]">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-10">
                {page.featuredEyebrow ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                    {page.featuredEyebrow}
                  </p>
                ) : null}
                {page.featuredTitle ? (
                  <h2 className="mt-3 font-display text-3xl font-bold">
                    {page.featuredTitle}
                  </h2>
                ) : null}
                {page.featuredBody ? (
                  <p className="mt-4 leading-8 text-white/70">
                    {page.featuredBody}
                  </p>
                ) : null}
              </div>
              <div className="bg-navy-deep">
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
        ) : null}

        {hasNote ? (
          <aside className="mt-10 rounded-[1.5rem] border border-line bg-white px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green">
              {page.noteEyebrow || "Onthou"}
            </p>
            <p className="mt-2 leading-7 text-navy">{page.noteBody}</p>
          </aside>
        ) : null}

        {hasCta ? (
          <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-cream-dark/80 px-8 py-10 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-navy">
                {page.ctaHeading}
              </h2>
              {page.ctaBody ? (
                <p className="mt-2 max-w-xl leading-7 text-muted">{page.ctaBody}</p>
              ) : null}
            </div>
            <Link
              href={page.ctaHref}
              className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white"
            >
              {page.ctaLabel || "Gaan voort"}
            </Link>
          </section>
        ) : null}
      </div>
    </article>
  );
}
