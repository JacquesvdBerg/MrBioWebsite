import { notFound } from "next/navigation";
import { saveThemePage } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn, deskField } from "@/components/admin-ui";
import { ImageUploadField } from "@/components/image-upload-field";
import { themeCardSlots } from "@/lib/theme-page";
import { getAdminTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

type EditorPageProps = {
  params: Promise<{ slug: string }>;
};

const tones = ["green", "teal", "blue", "purple", "orange", "navy"] as const;

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
      back={{ href: "/admin/themes", label: "Temas" }}
      meta={<AdminBadge tone={theme.isPublished ? "live" : "draft"}>{theme.isPublished ? "Live" : "Konsep"}</AdminBadge>}
      actions={
        <AdminBtn href={theme.href} tone="ghost" icon="external" external>
          Publieke bladsy
        </AdminBtn>
      }
    >
      <form action={saveThemePage} className="space-y-6">
        <input type="hidden" name="existingSlug" value={theme.slug} />

        <section className="desk-panel desk-panel-body grid gap-3 md:grid-cols-2">
          <h2 className="font-display text-lg font-bold text-white md:col-span-2">
            Kaart & hero
          </h2>
          <label className="text-sm font-semibold">
            Titel
            <input
              className={deskField}
              name="title"
              defaultValue={theme.title}
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Kicker
            <input
              className={deskField}
              name="kicker"
              defaultValue={page.kicker}
            />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Kort beskrywing
            <input
              className={deskField}
              name="blurb"
              defaultValue={theme.blurb}
            />
          </label>
          <label className="text-sm font-semibold">
            Kleur
            <select className={deskField} name="tone" defaultValue={theme.tone}>
              {tones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Volgorde
            <input
              className={deskField}
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

        <section className="desk-panel desk-panel-body grid gap-3">
          <h2 className="font-display text-lg font-bold text-white">Inleiding</h2>
          <label className="text-sm font-semibold">
            Opskrif
            <input
              className={deskField}
              name="introHeading"
              defaultValue={page.introHeading}
            />
          </label>
          <label className="text-sm font-semibold">
            Teks
            <textarea
              className={`${deskField} min-h-28`}
              name="introBody"
              defaultValue={page.introBody}
            />
          </label>
          <label className="text-sm font-semibold">
            Wat jy sal leer (een per reël)
            <textarea
              className={`${deskField} min-h-28`}
              name="outcomes"
              defaultValue={page.outcomes.join("\n")}
            />
          </label>
        </section>

        <section className="desk-panel desk-panel-body grid gap-4">
          <h2 className="font-display text-lg font-bold text-white">
            Drie inhoudbokse
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {themeCardSlots.map((index) => {
              const card = page.cards[index];

              return (
                <div key={index} className="space-y-2 rounded-2xl border border-white/10 p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/55">
                    Boks {index + 1}
                  </p>
                  <input
                    className={deskField}
                    name={`card_${index}_title`}
                    defaultValue={card?.title}
                    placeholder="Titel"
                  />
                  <textarea
                    className={`${deskField} min-h-20`}
                    name={`card_${index}_body`}
                    defaultValue={card?.body}
                    placeholder="Teks"
                  />
                  <input
                    className={deskField}
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

        <section className="desk-panel desk-panel-body grid gap-3">
          <h2 className="font-display text-lg font-bold text-white">
            Uitgeligte les
          </h2>
          <label className="text-sm font-semibold">
            Eyebrow
            <input
              className={deskField}
              name="featuredEyebrow"
              defaultValue={page.featuredEyebrow}
            />
          </label>
          <label className="text-sm font-semibold">
            Titel
            <input
              className={deskField}
              name="featuredTitle"
              defaultValue={page.featuredTitle}
            />
          </label>
          <label className="text-sm font-semibold">
            Teks
            <textarea
              className={`${deskField} min-h-24`}
              name="featuredBody"
              defaultValue={page.featuredBody}
            />
          </label>
          <label className="text-sm font-semibold">
            YouTube-skakel
            <input
              className={deskField}
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

        <section className="desk-panel desk-panel-body grid gap-3 md:grid-cols-2">
          <h2 className="font-display text-lg font-bold text-white md:col-span-2">
            Nota en CTA
          </h2>
          <label className="text-sm font-semibold">
            Nota-opskrif
            <input
              className={deskField}
              name="noteEyebrow"
              defaultValue={page.noteEyebrow}
            />
          </label>
          <label className="text-sm font-semibold">
            Nota
            <input
              className={deskField}
              name="noteBody"
              defaultValue={page.noteBody}
            />
          </label>
          <label className="text-sm font-semibold">
            CTA-opskrif
            <input
              className={deskField}
              name="ctaHeading"
              defaultValue={page.ctaHeading}
            />
          </label>
          <label className="text-sm font-semibold">
            CTA-teks
            <input
              className={deskField}
              name="ctaBody"
              defaultValue={page.ctaBody}
            />
          </label>
          <label className="text-sm font-semibold">
            Knoppie
            <input
              className={deskField}
              name="ctaLabel"
              defaultValue={page.ctaLabel}
            />
          </label>
          <label className="text-sm font-semibold">
            Knoppie-skakel
            <input
              className={deskField}
              name="ctaHref"
              defaultValue={page.ctaHref}
            />
          </label>
        </section>

        <div className="desk-savebar">
          <AdminBtn type="submit" icon="check">
            Stoor bladsy
          </AdminBtn>
        </div>
      </form>
    </AdminPage>
  );
}
