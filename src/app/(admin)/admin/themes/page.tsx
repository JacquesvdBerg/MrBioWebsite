import { deleteTheme, upsertTheme } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn, AdminEmpty, AdminPanel, deskField } from "@/components/admin-ui";
import { DeleteButton } from "@/components/admin-client";
import { ImageUploadField } from "@/components/image-upload-field";
import { getAllThemes } from "@/lib/themes";

export const metadata = {
  title: "Temas",
};

export const dynamic = "force-dynamic";

const tones = ["green", "teal", "blue", "purple", "orange", "navy"] as const;

export default async function AdminThemesPage() {
  const themes = await getAllThemes();

  return (
    <AdminPage
      title="Temas"
      description="Elke tema gebruik dieselfde bladsy-template. Skep die tema hier, en vul dan die inhoud op die wysig-bladsy."
    >
      <AdminPanel title="Nuwe tema" icon="plus" collapsible defaultOpen={themes.length === 0}>
        <form action={upsertTheme} className="grid gap-3 md:grid-cols-2">
          <label className="desk-label">
            Titel
            <input className={deskField} name="title" required />
          </label>
          <label className="desk-label">
            Slug (opsioneel)
            <input className={deskField} name="slug" />
          </label>
          <label className="desk-label md:col-span-2">
            Kort beskrywing
            <input className={deskField} name="blurb" />
          </label>
          <label className="desk-label">
            Kleur
            <select className={deskField} name="tone" defaultValue="green">
              {tones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </label>
          <ImageUploadField label="Kaartprent" />
          <label className="desk-label">
            Volgorde
            <input
              className={deskField}
              name="sort_order"
              type="number"
              defaultValue={themes.length + 1}
            />
          </label>
          <label className="desk-check self-end pb-2">
            <input type="checkbox" name="is_published" defaultChecked />
            Publiseer
          </label>
          <div className="md:col-span-2">
            <AdminBtn type="submit" icon="arrow">
              Skep en wysig
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title={`${themes.length} temas`} icon="theme">
          {themes.length === 0 ? (
            <AdminEmpty
              icon="theme"
              title="Nog geen temas nie"
              body="Skep die eerste een hierbo — Genetika, Fotosintese, Evolusie, wat jy ook al eerste wil oopmaak."
            />
          ) : (
            <ul>
              {themes.map((theme) => (
                <li key={theme.slug} className="desk-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{theme.title}</p>
                      <AdminBadge tone={theme.isPublished ? "live" : "draft"}>
                        {theme.isPublished ? "Live" : "Konsep"}
                      </AdminBadge>
                    </div>
                    <p className="font-mono text-xs text-white/55">{theme.href}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminBtn href={theme.href} tone="ghost" size="sm" icon="external" external>
                      Bekyk
                    </AdminBtn>
                    <AdminBtn href={`/admin/themes/${theme.slug}`} size="sm">
                      Wysig bladsy
                    </AdminBtn>
                    <form action={deleteTheme}>
                      <input type="hidden" name="slug" value={theme.slug} />
                      <DeleteButton confirm="Verwyder hierdie tema en sy bladsy?" />
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
