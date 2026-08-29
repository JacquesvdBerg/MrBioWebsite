import Link from "next/link";
import { notFound } from "next/navigation";
import { saveThemePage } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { ImageUploadField } from "@/components/image-upload-field";
import { themeCardSlots } from "@/lib/theme-page";
import { getAdminTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

type EditorPageProps = {
  params: Promise<{ slug: string }>;
};

const tones = ["green", "teal", "blue", "purple", "orange", "navy"] as const;
const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-cream/60 px-3 py-2 text-sm";

export async function generateMetadata({ params }: EditorPageProps) {
  const { slug } = await params;
  const theme = await getAdminTheme(slug);

  return {
    title: theme ? `Wysig ${theme.title}` : "Tema",
  };
}

export default async function AdminThemeEditorPage({ params }: EditorPageProps) {
  const { slug } = await params;
  const theme = await getAdminTheme(slug);

  if (!theme) {
    notFound();
  }

  const { page } = theme;

  return (
    <AdminPage
      title={theme.title}
      description={`Vul die template vir ${theme.href}. Leë velde word weggesteek op die publieke bladsy.`}
    >
      <p className="mb-6 text-sm">
        <Link href="/admin/themes" className="font-semibold text-green">
          ← Terug na temas
        </Link>
        {" · "}
        <Link href={theme.href} className="font-semibold text-green">
          Sien publieke bladsy
        </Link>
      </p>

      <form action={saveThemePage} className="space-y-8">
        <input type="hidden" name="existingSlug" value={theme.slug} />

        <section className="grid gap-3 rounded-2xl border border-line bg-white p-5 md:grid-cols-2">
          <h2 className="font-display text-lg font-bold text-navy md:col-span-2">
            Kaart & hero
          </h2>
          <label className="text-sm font-semibold">
            Titel
            <input
              className={inputClass}
              name="title"
              defaultValue={theme.title}
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Kicker
            <input
              className={inputClass}
              name="kicker"
              defaultValue={page.kicker}
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Kort beskrywing
            <input
              className={inputClass}
              name="blurb"
              defaultValue={theme.blurb}
            />
          </label>
          <label className="text-sm font-semibold">
            Kleur
            <select className={inputClass} name="tone" defaultValue={theme.tone}>
              {tones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Volgorde
            <input
              className={inputClass}
              name="sort_order"
              type="number"
              defaultValue={theme.sortOrder}
            />
          </label>
          <ImageUploadField
            label="Hero / kaartprent"
            initialUrl={theme.file}
          />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={theme.isPublished}
            />
            Publiseer
          </label>
        </section>

        <section className="grid gap-3 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy">Inleiding</h2>
          <label className="text-sm font-semibold">
            Opskrif
            <input
              className={inputClass}
              name="introHeading"
              defaultValue={page.introHeading}
            />
          </label>
          <label className="text-sm font-semibold">
            Teks
            <textarea
              className={`${inputClass} min-h-28`}
              name="introBody"
              defaultValue={page.introBody}
            />
          </label>
          <label className="text-sm font-semibold">
            Wat jy sal leer (een per reël)
            <textarea
              className={`${inputClass} min-h-28`}
              name="outcomes"
              defaultValue={page.outcomes.join("\n")}
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy">
            Drie inhoudbokse
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {themeCardSlots.map((index) => {
              const card = page.cards[index];

              return (
                <div key={index} className="space-y-2 rounded-xl bg-cream/50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Boks {index + 1}
                  </p>
                  <input
                    className={inputClass}
                    name={`card_${index}_title`}
                    defaultValue={card?.title}
                    placeholder="Titel"
                  />
                  <textarea
                    className={`${inputClass} min-h-20`}
                    name={`card_${index}_body`}
                    defaultValue={card?.body}
                    placeholder="Teks"
                  />
                  <input
                    className={inputClass}
                    name={`card_${index}_href`}
                    defaultValue={card?.href}
                    placeholder="/video-lessons"
                  />
                  <ImageUploadField
                    name={`card_${index}_image`}
                    label="Prent"
                    initialUrl={card?.image}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy">
            Uitgeligte les
          </h2>
          <label className="text-sm font-semibold">
            Eyebrow
            <input
              className={inputClass}
              name="featuredEyebrow"
              defaultValue={page.featuredEyebrow}
            />
          </label>
          <label className="text-sm font-semibold">
            Titel
            <input
              className={inputClass}
              name="featuredTitle"
              defaultValue={page.featuredTitle}
            />
          </label>
          <label className="text-sm font-semibold">
            Teks
            <textarea
              className={`${inputClass} min-h-24`}
              name="featuredBody"
              defaultValue={page.featuredBody}
            />
          </label>
          <label className="text-sm font-semibold">
            YouTube-skakel
            <input
              className={inputClass}
              name="featuredVideoUrl"
              defaultValue={page.featuredVideoUrl}
              placeholder="https://www.youtube.com/watch?v="
            />
          </label>
          <ImageUploadField
            name="featuredImage"
            label="Prent as daar nie ’n video is nie"
            initialUrl={page.featuredImage}
          />
        </section>

        <section className="grid gap-3 rounded-2xl border border-line bg-white p-5 md:grid-cols-2">
          <h2 className="font-display text-lg font-bold text-navy md:col-span-2">
            Nota en CTA
          </h2>
          <label className="text-sm font-semibold">
            Nota-opskrif
            <input
              className={inputClass}
              name="noteEyebrow"
              defaultValue={page.noteEyebrow}
            />
          </label>
          <label className="text-sm font-semibold">
            Nota
            <input
              className={inputClass}
              name="noteBody"
              defaultValue={page.noteBody}
            />
          </label>
          <label className="text-sm font-semibold">
            CTA-opskrif
            <input
              className={inputClass}
              name="ctaHeading"
              defaultValue={page.ctaHeading}
            />
          </label>
          <label className="text-sm font-semibold">
            CTA-teks
            <input
              className={inputClass}
              name="ctaBody"
              defaultValue={page.ctaBody}
            />
          </label>
          <label className="text-sm font-semibold">
            Knoppie
            <input
              className={inputClass}
              name="ctaLabel"
              defaultValue={page.ctaLabel}
            />
          </label>
          <label className="text-sm font-semibold">
            Knoppie-skakel
            <input
              className={inputClass}
              name="ctaHref"
              defaultValue={page.ctaHref}
            />
          </label>
        </section>

        <button
          type="submit"
          className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white"
        >
          Stoor bladsy
        </button>
      </form>
    </AdminPage>
  );
}
