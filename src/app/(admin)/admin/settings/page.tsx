import { addAiTerm, deleteAiTerm, saveAiSettingsAction } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { getAiSettings } from "@/lib/ai-settings";

export const metadata = {
  title: "Instellings",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAiSettings();

  return (
    <AdminPage
      title="Instellings"
      description="Huisreëls, vakterme en die nagtaak. Die woordelys gaan in elke AI-job — dit is hoe jy stomata keer voordat dit huidmondjies moet wees."
    >
      <AdminPanel title="Vakterme">
        <p className="mb-4 max-w-2xl text-sm leading-6 text-white/55">
          Voeg ’n term by wanneer die AI die Engelse woord direk vertaal. Die volgende nagtaak
          kry die volle lys: sê die Afrikaanse woord, nooit die verbode een nie.
        </p>
        <form action={addAiTerm} className="grid gap-3 md:grid-cols-4">
          <label className="desk-label">
            Gebruik
            <input className={deskField} name="use" required placeholder="huidmondjies" />
          </label>
          <label className="desk-label">
            Moenie sê
            <input className={deskField} name="never" required placeholder="stomata" />
          </label>
          <label className="desk-label">
            Eksamen-Engels
            <input className={deskField} name="exam" placeholder="stomata (opsioneel)" />
          </label>
          <div className="flex items-end">
            <AdminBtn type="submit">Voeg term by</AdminBtn>
          </div>
        </form>

        {settings.terms.length === 0 ? (
          <div className="mt-4">
            <AdminEmpty
              title="Nog geen terme nie"
              body="Begin met die woorde wat Louis al reggemaak het. Voorbeeld: gebruik huidmondjies, moenie stomata sê nie."
            />
          </div>
        ) : (
          <ul className="mt-5">
            {settings.terms.map((term) => (
              <li key={term.id} className="desk-row">
                <div>
                  <p className="font-display font-bold text-white">
                    {term.use}
                    <span className="font-sans text-sm font-semibold text-white/45">
                      {" "}
                      · nooit {term.never}
                    </span>
                  </p>
                  {term.exam ? (
                    <p className="text-sm text-white/55">In die eksamen: {term.exam}</p>
                  ) : null}
                </div>
                <form action={deleteAiTerm}>
                  <input type="hidden" name="id" value={term.id} />
                  <button type="submit" className="desk-btn desk-btn-danger">
                    Verwyder
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title="AI-huisreëls">
          <form action={saveAiSettingsAction} className="space-y-4">
            <label className="desk-label">
              Vlak
              <select className={deskField} name="difficulty" defaultValue={settings.difficulty}>
                <option value="hersiening">Hersiening</option>
                <option value="eksamen">Eksamen</option>
                <option value="uitdaging">Uitdaging</option>
              </select>
            </label>
            <label className="desk-label">
              Ekstra huisreëls
              <textarea
                className={`${deskField} min-h-32`}
                name="houseRules"
                defaultValue={settings.houseRules}
                placeholder="Bv. een idee per vraag. Moenie die memorandum uitlek in die vraag nie."
              />
            </label>
            <label className="desk-check">
              <input type="checkbox" name="paused" defaultChecked={settings.paused} />
              Pouseer nagtaak (geen nuwe vasvrae)
            </label>
            <AdminBtn type="submit">Stoor instellings</AdminBtn>
          </form>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
