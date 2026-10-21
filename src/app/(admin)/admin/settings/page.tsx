import { addAiTerm, deleteAiTerm, saveAiSettingsAction } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { DeleteButton } from "@/components/admin-client";
import { getAiSettings } from "@/lib/ai-settings";
import { getEmailSettings, getResendKeyStatus } from "@/lib/email";
import { getOpenAiKeyStatus } from "@/lib/openai-key";
import { AiKeyPanel } from "./ai-key-panel";
import { EmailPanel } from "./email-panel";

export const metadata = {
  title: "Instellings",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ ai?: string; epos?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [settings, keyStatus, emailStatus, emailSettings] = await Promise.all([
    getAiSettings(),
    getOpenAiKeyStatus(),
    getResendKeyStatus(),
    getEmailSettings(),
  ]);

  return (
    <AdminPage
      title="Instellings"
      description="Die AI-sleutel, e-pos kennisgewings, vakterme en huisreëls. Die woordelys gaan in elke AI-job: so keer jy stomata voordat dit huidmondjies moet wees."
    >
      <AiKeyPanel status={keyStatus} result={params.ai} />
      <EmailPanel status={emailStatus} settings={emailSettings} result={params.epos} />

      <AdminPanel title="Vakterme" icon="list" className="mt-6">
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
            <AdminBtn type="submit" icon="plus">
              Voeg term by
            </AdminBtn>
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
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="desk-term is-good">{term.use}</span>
                    <span className="text-sm text-white/45">in plaas van</span>
                    <span className="desk-term is-bad">{term.never}</span>
                  </p>
                  {term.exam ? (
                    <p className="text-sm text-white/55">In die eksamen: {term.exam}</p>
                  ) : null}
                </div>
                <form action={deleteAiTerm}>
                  <input type="hidden" name="id" value={term.id} />
                  <DeleteButton confirm="Verwyder hierdie vakterm?" />
                </form>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title="AI-huisreëls" icon="spark">
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
            <AdminBtn type="submit" icon="check">
              Stoor instellings
            </AdminBtn>
          </form>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
