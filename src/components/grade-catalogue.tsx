import Image from "next/image";
import Link from "next/link";
import { DocumentIcon, PlayIcon } from "@/components/icons";
import { Arrow } from "@/components/ui";
import type { GradeCatalogue as Catalogue, ShopProduct } from "@/lib/products";
import { quarterOf } from "@/lib/products";
import { gradeBlurbs, gradeColors, gradeImages, gradePath, isGrade } from "@/lib/site";

function enquire(product: ShopProduct) {
  return `/contact?produk=${encodeURIComponent(product.slug)}`;
}

/** The first photo uploaded on any product in a series, used as its cover. */
function coverOf(products: ReadonlyArray<ShopProduct | null>) {
  return products.find((product) => product?.imagePath)?.imagePath ?? null;
}

/** The series cover photo with a small kind badge, or the plain icon when there is no photo. */
function SeriesMark({ cover, video }: { cover: string | null; video: boolean }) {
  const icon = video ? <PlayIcon className="h-5 w-5" /> : <DocumentIcon className="h-5 w-5" />;

  if (!cover) {
    return <span className={`shop-series-icon ${video ? "is-video" : ""}`}>{icon}</span>;
  }

  return (
    <span className="shop-series-cover">
      <Image src={cover} alt="" fill sizes="144px" className="object-cover" />
      <span className={`shop-series-badge ${video ? "is-video" : ""}`}>
        {video ? <PlayIcon className="h-3.5 w-3.5" /> : <DocumentIcon className="h-3.5 w-3.5" />}
      </span>
    </span>
  );
}

function Enquire({ product, primary = false }: { product: ShopProduct; primary?: boolean }) {
  return (
    <Link href={enquire(product)} className={`shop-enquire ${primary ? "is-primary" : ""}`}>
      Navraag
      <Arrow className="h-3.5 w-3.5" />
    </Link>
  );
}

/** One grade's material from the teacher's price list. */
export function GradeCatalogue({
  catalogue,
  banner = true,
}: {
  catalogue: Catalogue;
  /** The banner repeats the grade name; the grade page already has a header. */
  banner?: boolean;
}) {
  const { grade, summary, slides, other } = catalogue;
  const colors = isGrade(grade) ? gradeColors[grade] : (["#3aab48", "#1c7832"] as const);
  const quarterTotal = summary?.quarters.reduce((sum, product) => sum + product.price, 0) ?? 0;
  const saving = summary?.full && quarterTotal > summary.full.price ? quarterTotal - summary.full.price : 0;
  const quarterPrices = new Set(summary?.quarters.map((product) => product.price));
  const perQuarter = quarterPrices.size === 1 ? [...quarterPrices][0] : null;
  const slideSeries = summary?.kind === "Skyfievertonings";

  return (
    <section
      id={`graad-${grade}`}
      className="scroll-mt-28"
      style={{ ["--c1" as string]: colors[0], ["--c2" as string]: colors[1] }}
    >
      {banner && isGrade(grade) ? (
        <header className="shop-banner">
          <Image
            src={gradeImages[grade]}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover object-[center_30%]"
          />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/80">Graad</p>
              <p className="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-white">{grade}</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/90">{gradeBlurbs[grade]}</p>
            </div>
            <Link href={gradePath(grade)} className="shop-banner-link">
              Sien die jaarplan
              <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>
      ) : null}

      <div className={`grid gap-5 lg:grid-cols-[1.2fr_1fr] ${banner ? "mt-5" : ""}`}>
        {summary ? (
          <article className="shop-series">
            <div className="flex flex-wrap items-start gap-3.5">
              <SeriesMark cover={coverOf([summary.full, ...summary.quarters])} video={slideSeries} />
              <div className="min-w-0 flex-1 basis-48">
                <h3 className="font-display text-xl font-bold text-white">
                  {slideSeries ? "YT-video skyfievertonings" : summary.kind}
                </h3>
                {summary.body ? <p className="mt-0.5 text-sm leading-6 text-white/60">{summary.body}</p> : null}
              </div>
              {perQuarter ? (
                <p className="ml-auto shrink-0 text-right">
                  <span className="block font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                    R{perQuarter}
                  </span>
                  <span className="text-xs font-bold text-white/50">per kwartaal</span>
                </p>
              ) : null}
            </div>

            <ul className="mt-5">
              {summary.quarters.map((product) => (
                <li key={product.slug} className="shop-row">
                  <span className="shop-kw">KW{quarterOf(product)}</span>
                  <span className="min-w-0 flex-1 text-sm leading-6 text-white/80">{product.bullets.join(" · ")}</span>
                  {perQuarter ? null : (
                    <span className="font-display font-extrabold text-white">R{product.price}</span>
                  )}
                  <Enquire product={product} />
                </li>
              ))}
            </ul>

            {summary.full ? (
              <div className="shop-full">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold text-white">
                    {summary.full.title}
                    {saving > 0 ? <span className="shop-save">Spaar R{saving}</span> : null}
                  </p>
                  <p className="text-sm text-white/60">{summary.full.bullets[0] ?? summary.full.body}</p>
                </div>
                <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                  R{summary.full.price}
                </span>
                <Enquire product={summary.full} primary />
              </div>
            ) : null}
          </article>
        ) : null}

        {slides ? (
          <article className="shop-series">
            <div className="flex items-start gap-3.5">
              <SeriesMark cover={coverOf([slides.full, slides.single])} video />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold text-white">YT-video skyfievertonings</h3>
                <p className="mt-0.5 text-sm leading-6 text-white/60">
                  Die skyfies uit die YouTube-videolesse, in PDF-formaat.
                </p>
              </div>
            </div>

            {slides.single ? (
              <div className="shop-single">
                <p>
                  <span className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
                    R{slides.single.price}
                  </span>
                  <span className="ml-1.5 text-sm font-bold text-white/55">per skyfievertoning</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  Kies enige les en noem in jou navraag watter een(s) jy wil hê.
                </p>
                <div className="mt-3">
                  <Enquire product={slides.single} />
                </div>
              </div>
            ) : null}

            {summary && summary.quarters.length > 0 ? (
              <div className="mt-4 space-y-2">
                {summary.quarters.map((product) => (
                  <div key={product.slug} className="flex gap-2.5">
                    <span className="shop-kw is-small">KW{quarterOf(product)}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.bullets.map((topic) => (
                        <span key={topic} className="shop-topic">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {slides.full ? (
              <div className="shop-full">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold text-white">{slides.full.title}</p>
                  <p className="text-sm text-white/60">Al die skyfievertonings vir die jaar</p>
                </div>
                <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                  R{slides.full.price}
                </span>
                <Enquire product={slides.full} primary />
              </div>
            ) : null}
          </article>
        ) : null}
      </div>

      {other.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {other.map((product) => (
            <article key={product.slug} className="shop-series">
              {product.imagePath ? (
                <div className="relative -mx-1 -mt-1 mb-4 aspect-video overflow-hidden rounded-2xl">
                  <Image
                    src={product.imagePath}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">{product.kind}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{product.title}</h3>
              {product.bullets.length > 0 ? (
                <p className="mt-2 text-sm leading-6 text-white/60">{product.bullets.join(" · ")}</p>
              ) : product.body ? (
                <p className="mt-2 text-sm leading-6 text-white/60">{product.body}</p>
              ) : null}
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                  R{product.price}
                </span>
                <Enquire product={product} primary />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
