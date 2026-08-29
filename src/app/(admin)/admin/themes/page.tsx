import Link from "next/link";
import { deleteTheme, upsertTheme } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { ImageUploadField } from "@/components/image-upload-field";
import { getAllThemes } from "@/lib/themes";

export const metadata = {
  title: "Temas",
};

export const dynamic = "force-dynamic";

const tones = ["green", "teal", "blue", "purple", "orange", "navy"] as const;
const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-cream/60 px-3 py-2 text-sm";

export default async function AdminThemesPage() {
  const themes = await getAllThemes();

  return (
    <AdminPage
      title="Temas"
      description="Elke tema gebruik dieselfde bladsy-template. Skep die tema hier, en vul dan die inhoud op die wysig-bladsy."
    >
      <form
        action={upsertTheme}
        className="mb-8 grid gap-3 rounded-2xl border border-line bg-white p-5 md:grid-cols-2"
      >
        <h2 className="font-display text-lg font-bold text-navy md:col-span-2">
          Nuwe tema
        </h2>
        <label className="text-sm font-semibold">
          Titel
          <input className={inputClass} name="title" required />
        </label>
        <label className="text-sm font-semibold">
          Slug (opsioneel)
          <input className={inputClass} name="slug" />
        </label>
        <label className="text-sm font-semibold md:col-span-2">
          Kort beskrywing
          <input className={inputClass} name="blurb" />
        </label>
        <label className="text-sm font-semibold">
          Kleur
          <select className={inputClass} name="tone" defaultValue="green">
            {tones.map((tone) => (
              <option key={tone}>{tone}</option>
            ))}
          </select>
        </label>
        <ImageUploadField label="Kaartprent" />
        <label className="text-sm font-semibold">
          Volgorde
          <input
            className={inputClass}
            name="sort_order"
            type="number"
            defaultValue={themes.length + 1}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="is_published" defaultChecked />
          Publiseer
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-bold text-white"
        >
          Skep en wysig
        </button>
      </form>

      <ul className="grid gap-3">
        {themes.map((theme) => (
          <li
            key={theme.slug}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4"
          >
            <div>
              <p className="font-display font-bold text-navy">{theme.title}</p>
              <p className="font-mono text-xs text-muted">{theme.href}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/themes/${theme.slug}`}
                className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white"
              >
                Wysig bladsy
              </Link>
              <form action={deleteTheme}>
                <input type="hidden" name="slug" value={theme.slug} />
                <button type="submit" className="text-xs font-semibold text-orange">
                  Verwyder
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
