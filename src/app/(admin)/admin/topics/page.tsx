import {
  createTopic,
  deleteTopic,
  toggleTopic,
} from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { DeleteButton } from "@/components/admin-client";
import { grades } from "@/lib/site";
import { getAllTopics } from "@/lib/topics";

export const metadata = {
  title: "Onderwerpe",
};

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  const topics = await getAllTopics();

  return (
    <AdminPage
      title="Onderwerpe"
      description="Die nagtaak kies die onderwerp wat die langste nie gebruik is nie, en bou ’n nuwe 25-vraag vasvra. Onderwerpe word herwin."
    >
      <AdminPanel title="Voeg ’n onderwerp by" icon="plus" collapsible defaultOpen={topics.length === 0}>
        <form action={createTopic} className="grid gap-3 md:grid-cols-4">
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue="10">
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="desk-label md:col-span-2">
            Onderwerp
            <input className={deskField} name="title" required />
          </label>
          <div className="flex items-end">
            <AdminBtn type="submit" icon="plus">
              Voeg by
            </AdminBtn>
          </div>
          <label className="desk-label md:col-span-4">
            Fokusnota (opsioneel)
            <input
              className={deskField}
              name="notes"
              placeholder="Bv. moenie Calvin-siklus vra nie"
            />
          </label>
        </form>
      </AdminPanel>

      <div className="mt-6 grid gap-6">
        {grades.map((grade) => {
          const rows = topics.filter((topic) => topic.grade === grade);

          return (
            <AdminPanel key={grade} title={`Graad ${grade} · ${rows.length}`} icon="list">
              {rows.length === 0 ? (
                <p className="text-sm text-white/50">
                  Nog geen onderwerpe nie — voeg een hierbo by sodat die nagtaak iets het om uit te kies.
                </p>
              ) : (
                <ul>
                  {rows.map((topic) => (
                    <li key={topic.id} className="desk-row">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display font-bold text-white">{topic.title}</p>
                          <AdminBadge tone={topic.isActive ? "live" : "draft"}>
                            {topic.isActive ? "Aktief" : "Af"}
                          </AdminBadge>
                        </div>
                        {topic.notes ? <p className="text-sm text-white/55">{topic.notes}</p> : null}
                        <p className="mt-1 text-xs text-white/55">
                          Laas gebruik: {topic.lastUsedOn ?? "nog nooit"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <form action={toggleTopic}>
                          <input type="hidden" name="id" value={topic.id} />
                          <input
                            type="hidden"
                            name="is_active"
                            value={String(topic.isActive)}
                          />
                          <button type="submit" className="desk-btn desk-btn-ghost desk-btn-sm">
                            {topic.isActive ? "Deaktiveer" : "Aktiveer"}
                          </button>
                        </form>
                        <form action={deleteTopic}>
                          <input type="hidden" name="id" value={topic.id} />
                          <DeleteButton confirm="Verwyder hierdie onderwerp uit die nagtaak se bank?" />
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
          );
        })}
      </div>
    </AdminPage>
  );
}
