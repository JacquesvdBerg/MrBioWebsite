import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminPanel, AdminSoon } from "@/components/admin-ui";

export const metadata = {
  title: "Weeklikse feite",
};

const conceptFacts = [
  {
    week: "Week 36 · 2026",
    grade: 11,
    category: "Menslike liggaam",
    title: "Arteries het dikker wande as vene — en dis nie toevallig nie.",
    status: "live" as const,
  },
  {
    week: "Week 35",
    grade: 10,
    category: "Selle & weefsel",
    title: "Jou liggaam vervang omtrent 330 miljard selle per dag.",
    status: "live" as const,
  },
  {
    week: "Week 34",
    grade: 12,
    category: "Genetika",
    title: "Al die DNA in een sel is omtrent 2 meter lank.",
    status: "live" as const,
  },
  {
    week: "Week 33",
    grade: 10,
    category: "Plante",
    title: "Een groot boom lewer genoeg suurstof vir twee mense per dag.",
    status: "draft" as const,
  },
];

export default function AdminWeeklyFactsPage() {
  return (
    <AdminPage
      title="Weeklikse feite"
      description="Skep of genereer ’n konsep, hersien die wetenskap, en druk eers Goedkeur & Publiseer. Tot dié vloei gekoppel is, sien jy die feite wat tans op die werf staan."
    >
      <AdminSoon
        title="Konsep → hersien → publiseer"
        body="Hier besluit jy die lengte, of ’n diagram saamgaan, en of ’n feit aan ’n graad of tema gekoppel is. Geen stoor nog nie — die werf lees tans die lys in die kode."
      />

      <div className="mt-6">
        <AdminPanel title="Tans op die werf">
          <ul>
            {conceptFacts.map((fact) => (
              <li key={fact.title} className="desk-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-bold text-white">{fact.title}</p>
                    <AdminBadge tone={fact.status === "live" ? "live" : "draft"}>
                      {fact.status === "live" ? "Live" : "Argief"}
                    </AdminBadge>
                  </div>
                  <p className="text-sm text-white/55">
                    {fact.week} · Graad {fact.grade} · {fact.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
