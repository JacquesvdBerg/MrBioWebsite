import { AdminPage } from "@/components/admin-page";
import { AdminEmpty, AdminPanel, AdminSoon, AdminStat } from "@/components/admin-ui";

export const metadata = {
  title: "Navrae",
};

export default function AdminEnquiriesPage() {
  return (
    <AdminPage
      title="Navrae"
      description="Winkelnavrae land hier: wie wil watter pak hê, vir watter graad, en of jy al geantwoord het. E-poskennisgewings kan later bykom."
    >
      <AdminSoon
        title="Die inkassie is gebou — die pyp is nie"
        body="Wanneer die winkelvorm gekoppel is, verskyn elke navraag hier met status: nuut, in behandeling, of klaar. Niks word nou stilweg gestoor nie."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminStat label="Nuut" value={0} hint="Wag op antwoord" />
        <AdminStat label="In behandeling" value={0} />
        <AdminStat label="Klaar hierdie week" value={0} />
      </div>

      <div className="mt-6">
        <AdminPanel
          title="Inkassie"
          action={
            <div className="desk-tabs">
              <span className="desk-tab is-active">Alles</span>
              <span className="desk-tab">Nuut</span>
              <span className="desk-tab">Klaar</span>
            </div>
          }
        >
          <AdminEmpty
            title="Geen navrae nog nie"
            body="Wanneer ’n ouer of onderwyser op die winkel klik, verskyn die boodskap hier — naam, e-pos, produk, graad."
          />
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
