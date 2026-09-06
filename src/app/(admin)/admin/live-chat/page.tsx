import { AdminPage } from "@/components/admin-page";
import { AdminEmpty, AdminPanel, AdminSoon, AdminStat } from "@/components/admin-ui";

export const metadata = {
  title: "Lewendige klets",
};

export default function AdminLiveChatPage() {
  return (
    <AdminPage
      title="Lewendige klets"
      description="Vrae van leerders, een gesprek op ’n slag. Boodskappe moet bly staan tussen herlaaiings sodat jy of ’n werknemer later kan antwoord."
    >
      <AdminSoon
        title="Gesprekke bly op die lessenaar"
        body="Hier kies jy ’n gesprek, antwoord, of merk dit as klaar. Die klets self word later gekoppel — tot dan is die inkassie leeg."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <AdminStat label="Oop gesprekke" value={0} />
        <AdminStat label="Ongelees" value={0} />
        <AdminStat label="Beantwoord vandag" value={0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel title="Gesprekke">
          <AdminEmpty
            title="Nog geen kletse nie"
            body="Wanneer ’n leerder vra, verskyn die draad hier met graad en onderwerp."
          />
        </AdminPanel>
        <AdminPanel title="Antwoord">
          <div className="rounded-2xl bg-white/5 px-4 py-8 text-center text-sm text-white/55">
            Kies ’n gesprek links. Die geskiedenis bly hier, selfs ná ’n herlaai.
          </div>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
