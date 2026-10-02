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
  AdminTabs,
  deskField,
  AdminNotice,
} from "@/components/admin-ui";
import { DeleteButton } from "@/components/admin-client";
import { grades } from "@/lib/site";
import {
  getAllWeeklyFacts,
  weeklyFactCategories,
  weeklyFactStatuses,
  weeklyFactStatusLabel,
  weeklyFactStatusTone,
} from "@/lib/weekly-facts";

export const metadata = {
  title: "Weeklikse feite",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string; status?: string }>;
};

export default async function AdminWeeklyFactsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const facts = await getAllWeeklyFacts();
  const filter = weeklyFactStatuses.find((status) => status === params.status) ?? null;
  const visible = filter ? facts.filter((fact) => fact.status === filter) : facts;
  const tabs = [
    { href: "/admin/weekly-facts", label: "Alles", active: !filter, count: facts.length },
    ...weeklyFactStatuses.map((status) => ({
      href: `/admin/weekly-facts?status=${status}`,
      label: weeklyFactStatusLabel(status),
      active: filter === status,
      count: facts.filter((fact) => fact.status === status).length,
    })),
  ];

  return (
    <AdminPage
      title="Weeklikse feite"
      description="Skep ’n konsep, hersien die wetenskap, keur goed en publiseer eers wanneer dit reg is. Leerders sien net live feite."
    >
      {params.error === "fields" ? (
        <AdminNotice tone="err">Titel en graad 10–12 is verpligtend.</AdminNotice>
      ) : null}
      {params.error === "stoor" ? (
        <AdminNotice tone="err">Kon nie die feit stoor nie.</AdminNotice>
      ) : null}

      <AdminPanel title="Nuwe konsep" icon="plus" collapsible defaultOpen={facts.length === 0}>
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
            <AdminBtn type="submit" icon="arrow">
              Skep en wysig
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title="Feite" icon="leaf" action={<AdminTabs tabs={tabs} />}>
          {visible.length === 0 ? (
            <AdminEmpty
              icon="leaf"
              title={facts.length === 0 ? "Nog geen feite nie" : "Niks in hierdie lys nie"}
              body="Skep ’n konsep hierbo. Dit bly privaat tot jy Publiseer druk."
            />
          ) : (
            <ul>
              {visible.map((fact) => (
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
                        <AdminBtn type="submit" tone="ghost" size="sm">
                          Keur goed
                        </AdminBtn>
                      </form>
                    ) : null}
                    {fact.status !== "published" ? (
                      <form action={setWeeklyFactStatus}>
                        <input type="hidden" name="slug" value={fact.slug} />
                        <input type="hidden" name="status" value="published" />
                        <AdminBtn type="submit" tone="ghost" size="sm">
                          Publiseer
                        </AdminBtn>
                      </form>
                    ) : (
                      <form action={setWeeklyFactStatus}>
                        <input type="hidden" name="slug" value={fact.slug} />
                        <input type="hidden" name="status" value="approved" />
                        <AdminBtn type="submit" tone="ghost" size="sm">
                          Ontpubliseer
                        </AdminBtn>
                      </form>
                    )}
                    <AdminBtn href={`/admin/weekly-facts/${fact.slug}`} size="sm">
                      Wysig
                    </AdminBtn>
                    <form action={deleteWeeklyFact}>
                      <input type="hidden" name="slug" value={fact.slug} />
                      <DeleteButton confirm="Verwyder hierdie feit? Dit kan nie ontdoen word nie." />
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
