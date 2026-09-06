import { AdminPage } from "@/components/admin-page";
import { AdminEmpty, AdminPanel, AdminSoon, AdminStat } from "@/components/admin-ui";

export const metadata = {
  title: "Kommentaar",
};

export default function AdminCommentsPage() {
  return (
    <AdminPage
      title="Kommentaar"
      description="Hangende, goedgekeurde en afgekeurde statusse. Jy besluit wat publiek is — niks gaan outomaties lewendig nie."
    >
      <AdminSoon
        title="Moderasie sit op hierdie lessenaar"
        body="Wanneer die forum leef, keur jy hier goed of keur af. Tot dan is die waglys leeg sodat niks per ongeluk publiek raak nie."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminStat label="Wag op keuring" value={0} hint="Niks publiek voor jy sê ja" />
        <AdminStat label="Goedgekeur" value={0} />
        <AdminStat label="Afgekeur" value={0} />
      </div>

      <div className="mt-6">
        <AdminPanel
          title="Waglys"
          action={
            <div className="desk-tabs">
              <span className="desk-tab is-active">Hangend</span>
              <span className="desk-tab">Goedgekeur</span>
              <span className="desk-tab">Afgekeur</span>
            </div>
          }
        >
          <AdminEmpty
            title="Die waglys is skoon"
            body="Nuwe kommentaar verskyn hier eers. Leerders sien niks tot jy Goedkeur druk."
          />
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
