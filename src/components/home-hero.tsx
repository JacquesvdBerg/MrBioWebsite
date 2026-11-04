import Image from "next/image";
import Link from "next/link";
import { HeroScene } from "@/components/hero-scene";
import { TutorialButton } from "@/components/tutorial-button";
import { Arrow } from "@/components/ui";
import { articlePath } from "@/lib/comments";
import { youtubeTutorial, youtubeTutorialId } from "@/lib/site";

type HomeHeroProps = {
  /** The newest published article, named under the news call-out. */
  latestArticle: { title: string; slug: string } | null;
};

export function HomeHero({ latestArticle }: HomeHeroProps) {
  return (
    <section className="home-hero relative flex overflow-hidden">
      <HeroScene />
      <div className="home-hero-wash pointer-events-none absolute inset-0" aria-hidden />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 pb-[86vw] pt-10 md:px-6 md:pb-24 md:pt-20">
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
          <blockquote className="rise mt-7 max-w-md [animation-delay:120ms]">
            <p className="text-lg leading-8 text-white/80">
              “Die belangrikste ding is om nie op te hou om vrae te vra nie. Nuuskierigheid het sy eie rede vir
              bestaan.”
            </p>
            <footer className="mt-2 text-sm font-bold text-white/55">Albert Einstein</footer>
          </blockquote>

          <div className="rise mt-8 [animation-delay:200ms]">
            <TutorialButton videoId={youtubeTutorialId} href={youtubeTutorial} />
          </div>

          {/* The rise wrapper keeps its animation off the bubble's hover lift. */}
          <div className="rise mt-9 [animation-delay:320ms]">
            <div className="hero-news pointer-events-auto">
              <div className="hero-news-text">
                <Link href="/comments#artikels" className="hero-news-link">
                  Sien nou artikels oor wêreldwye nuus in die veld van biologie
                </Link>
                {latestArticle ? (
                  <Link href={articlePath(latestArticle.slug)} className="hero-news-latest">
                    <span className="hero-news-latest-label">Nuutste</span>
                    <span className="line-clamp-3">
                      {latestArticle.title}
                      <Arrow className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />
                    </span>
                  </Link>
                ) : null}
              </div>
              <Image
                src="/images/home/nuus-artikels.webp"
                alt=""
                width={558}
                height={432}
                sizes="(max-width: 767px) 112px, 168px"
                className="hero-news-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
