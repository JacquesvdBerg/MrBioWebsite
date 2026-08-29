import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { FeatureIcon, ShortcutIcon } from "@/components/home-icons";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { Visual } from "@/components/visual";
import { imageFiles } from "@/lib/image-files";
import { homeFeatures, homeShortcuts } from "@/lib/site";
import { getPublishedThemes } from "@/lib/themes";

// Themes are edited in the admin panel, so re-check the database periodically
// instead of baking the list into the build.
export const revalidate = 300;

export default async function HomePage() {
  const themes = await getPublishedThemes();

  return (
    <div className="pb-16">
      <HomeHero />

      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 md:px-6">
        <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/10 shadow-[var(--shadow-lg)] sm:grid-cols-2 lg:grid-cols-4">
          {homeFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group flex items-start gap-3.5 bg-navy p-6 transition-colors hover:bg-navy-deep"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold transition-colors group-hover:bg-white/15">
                <FeatureIcon name={feature.icon} className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-[13px] font-bold uppercase tracking-[0.06em] text-white">
                  {feature.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-white/65">
                  {feature.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="leer" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Verken"
          title="Kies jou tema"
          description="Elke tema volg die sillabus en kombineer video's, feite en aktiwiteite."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {themes.map((theme) => (
            <Link
              key={theme.slug}
              href={theme.href}
              className="lift group relative overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-md)]"
            >
              <Visual
                file={theme.file}
                alt={theme.title}
                ratio="3/4"
                tone={theme.tone}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4">
                <h3 className="font-display text-lg font-bold leading-tight text-white">
                  {theme.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-5 text-white/75">
                  {theme.blurb}
                </p>
                <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-navy">
                  Verken
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Hierdie week"
          title="Nuut op die platform"
          action={
            <ButtonLink href="/weekly-facts" tone="ghost">
              Sien alles
            </ButtonLink>
          }
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="lift card-surface overflow-hidden">
            <Visual
              file={imageFiles.home.video}
              alt="Mikroskopiese plantselle"
              ratio="16/9"
              tone="green"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green">
                Nuutste video
              </p>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-navy">
                Fotosintese stap vir stap
              </h3>
              <p className="mt-2 leading-7 text-muted">
                Verstaan hoe plante hul eie voedsel maak.
              </p>
              <ButtonLink href="/video-lessons" tone="green" className="mt-5">
                Kyk nou
              </ButtonLink>
            </div>
          </article>

          <article className="lift card-surface overflow-hidden">
            <Visual
              file={imageFiles.home.fact}
              alt="Nabyfoto van 'n menslike oog"
              ratio="16/9"
              tone="blue"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
                Vandag se feit
              </p>
              <p className="mt-2.5 font-display text-[1.4rem] font-bold leading-8 text-navy">
                ’n Menslike oog kan meer as 10 miljoen verskillende kleure
                onderskei.
              </p>
              <ButtonLink href="/weekly-facts" tone="ghost" className="mt-5">
                Meer feite
              </ButtonLink>
            </div>
          </article>

          <article className="lift card-surface overflow-hidden">
            <Visual
              file={imageFiles.home.activity}
              alt="Eenvoudige fotosintese-diagram"
              ratio="16/9"
              tone="purple"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple">
                Aktiwiteit van die week
              </p>
              <h3 className="mt-2.5 font-display text-2xl font-bold text-navy">
                Fotosintese vasvra
              </h3>
              <p className="mt-2 leading-7 text-muted">
                Toets jou kennis met tien kort vrae.
              </p>
              <ButtonLink
                href="/play-and-learn/quiz"
                tone="purple"
                className="mt-5"
              >
                Begin nou
              </ButtonLink>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {homeShortcuts.map((shortcut) => (
            <Link
              key={shortcut.title}
              href={shortcut.href}
              className="lift group flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4 shadow-[var(--shadow-sm)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-green transition-colors group-hover:bg-green group-hover:text-white">
                <ShortcutIcon name={shortcut.icon} className="h-[22px] w-[22px]" />
              </span>
              <span className="text-[13px] font-bold leading-5 text-navy">
                {shortcut.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
