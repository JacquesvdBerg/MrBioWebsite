import {
  createWeeklyFact,
  deleteWeeklyFact,
  setWeeklyFactStatus,
} from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { grades } from "@/lib/site";
import {
  getAllWeeklyFacts,
  weeklyFactCategories,
  weeklyFactStatusLabel,
  weeklyFactStatusTone,
} from "@/lib/weekly-facts";

export const metadata = {
  title: "Weeklikse feite",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminWeeklyFactsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const facts = await getAllWeeklyFacts();

  return (
    <AdminPage
      title="Weeklikse feite"
      description="Skep ’n konsep, hersien die wetenskap, keur goed en publiseer eers wanneer dit reg is. Leerders sien net live feite."
    >
      {params.error === "fields" ? (
        <p className="mb-6 text-sm text-orange">Titel en graad 10–12 is verpligtend.</p>
      ) : null}
      {params.error === "stoor" ? (
        <p className="mb-6 text-sm text-orange">Kon nie die feit stoor nie.</p>
      ) : null}

      <AdminPanel title="Nuwe konsep">
        <form action={createWeeklyFact} className="grid gap-3 md:grid-cols-2">
          <label className="desk-label md:col-span-2">
            Titel
            <input className={deskField} name="title" required />
          </label>
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue="11">
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Kategorie
            <select className={deskField} name="category" defaultValue="Menslike liggaam">
              {weeklyFactCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="desk-label md:col-span-2">
            Week-etiket
            <input className={deskField} name="week_label" placeholder="Week 36 · 2026" />
          </label>
          <div className="md:col-span-2">
            <AdminBtn type="submit">Skep en wysig</AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title={`${facts.length} feite`}>
          {facts.length === 0 ? (
            <AdminEmpty
              title="Nog geen feite nie"
              body="Skep die eerste konsep hierbo. Dit bly privaat tot jy Publiseer druk."
            />
          ) : (
            <ul>
              {facts.map((fact) => (
                <li key={fact.id} className="desk-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{fact.title}</p>
                      <AdminBadge tone={weeklyFactStatusTone(fact.status)}>
                        {weeklyFactStatusLabel(fact.status)}
                      </AdminBadge>
                    </div>
                    <p className="text-sm text-white/55">
                      {fact.weekLabel || "Geen week"} · Graad {fact.grade}
                      {fact.category ? ` · ${fact.category}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {fact.status === "draft" ? (
                      <form action={setWeeklyFactStatus}>
                        <input type="hidden" name="slug" value={fact.slug} />
                        <input type="hidden" name="status" value="approved" />
                        <AdminBtn type="submit" tone="ghost">
                          Keur goed
                        </AdminBtn>
                      </form>
                    ) : null}
                    {fact.status !== "published" ? (
                      <form action={setWeeklyFactStatus}>
                        <input type="hidden" name="slug" value={fact.slug} />
                        <input type="hidden" name="status" value="published" />
                        <AdminBtn type="submit" tone="ghost">
                          Publiseer
                        </AdminBtn>
                      </form>
                    ) : (
                      <form action={setWeeklyFactStatus}>
                        <input type="hidden" name="slug" value={fact.slug} />
                        <input type="hidden" name="status" value="approved" />
                        <AdminBtn type="submit" tone="ghost">
                          Ontpubliseer
                        </AdminBtn>
                      </form>
                    )}
                    <AdminBtn href={`/admin/weekly-facts/${fact.slug}`}>Wysig</AdminBtn>
                    <form action={deleteWeeklyFact}>
                      <input type="hidden" name="slug" value={fact.slug} />
                      <button type="submit" className="desk-btn desk-btn-danger">
                        Verwyder
                      </button>
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
