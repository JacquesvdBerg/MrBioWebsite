import {
  removeResendKeyAction,
  saveEmailSettingsAction,
  saveResendKeyAction,
  sendTestEmailAction,
} from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin-client";
import { AdminBadge, AdminBtn, AdminNotice, AdminPanel, deskField } from "@/components/admin-ui";
import { defaultSender, type EmailSettings, type ResendKeyStatus } from "@/lib/email";

function noticeFor(result: string, to: string): { tone: "ok" | "err"; text: string } | undefined {
  switch (result) {
    case "saved":
      return { tone: "ok", text: `Gekoppel. Ons het ’n toets-e-pos na ${to} gestuur. Kyk in jou inkassie en in die spam-gids.` };
    case "test":
      return { tone: "ok", text: `Toets-e-pos is na ${to} gestuur.` };
    case "settings":
      return { tone: "ok", text: "Kennisgewings is gestoor." };
    case "removed":
      return { tone: "ok", text: "Die sleutel is verwyder. Die webwerf stuur nie meer e-posse nie." };
    case "format":
      return { tone: "err", text: "Dit lyk nie soos ’n Resend-sleutel nie. ’n Sleutel begin met re_." };
    case "invalid":
      return { tone: "err", text: "Resend het die sleutel afgekeur. Kopieer dit weer en probeer." };
    case "own-only":
      return {
        tone: "err",
        text: "Die sleutel werk, maar Resend stuur net na die e-posadres van jou Resend-rekening. Sit daardie adres by “Stuur na”, stoor en stuur weer ’n toets.",
      };
    case "from-domain":
      return {
        tone: "err",
        text: "Die sleutel werk, maar die domein van die van-adres is nie in Resend geverifieer nie. Maak die van-adres leeg om Resend se toetsadres te gebruik.",
      };
    case "limit":
      return { tone: "err", text: "Resend se daaglikse limiet is bereik. Probeer môre weer." };
    case "failed":
      return { tone: "err", text: "Kon nie die e-pos stuur of stoor nie. Probeer weer oor ’n minuut." };
    case "no-key":
      return { tone: "err", text: "Koppel eers ’n Resend-sleutel." };
    case "to":
      return { tone: "err", text: "Sit ’n geldige e-posadres by “Stuur na”." };
    case "from":
      return { tone: "err", text: "Die van-adres moet lyk soos MnrBio <kennisgewings@jou-domein.co.za>." };
    case "no-table":
      return {
        tone: "err",
        text: "Die databasis is nog nie gereed vir die sleutel nie. Vra die ontwikkelaar om die app_secrets-migrasie te laat loop.",
      };
    case "no-service":
      return {
        tone: "err",
        text: "Die bediener se Supabase-dienssleutel ontbreek, so die sleutel kan nie gestoor word nie.",
      };
    default:
      return undefined;
  }
}

const events = [
  { name: "enquiries", label: "Nuwe navrae (kontakvorm en winkel)" },
  { name: "chat", label: "Nuwe vrae van leerders in die klets" },
  { name: "comments", label: "Nuwe kommentaar wat op goedkeuring wag" },
] as const;

/** Email the teacher through their own Resend account when something new comes in. */
export function EmailPanel({
  status,
  settings,
  result,
}: {
  status: ResendKeyStatus;
  settings: EmailSettings;
  result?: string;
}) {
  const notice = result
    ? noticeFor(result, settings.to)
    : status.state === "no-table"
      ? noticeFor("no-table", settings.to)
      : undefined;
  const ready = status.state === "ready";

  return (
    <section id="e-pos" className="mt-6 scroll-mt-24">
      <AdminPanel
        title="E-pos kennisgewings (Resend)"
        icon="inbox"
        action={<AdminBadge tone={ready ? "live" : "wait"}>{ready ? "Gekoppel" : "Nie gekoppel nie"}</AdminBadge>}
      >
        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm leading-6 text-white/60">
              Kry ’n e-pos sodra iemand ’n navraag stuur, ’n leerder in die klets ’n vraag vra of
              kommentaar op goedkeuring wag. Dit loop deur jou eie gratis Resend-rekening.
            </p>

            {status.state === "ready" ? (
              <div className="desk-kv mt-4 rounded-xl border border-white/10 px-4">
                <span className="text-white/55">Huidige sleutel</span>
                <span className="font-mono font-bold text-white">
                  {status.masked}
                  <span className="ml-2 font-sans text-xs font-semibold text-white/45">
                    {new Intl.DateTimeFormat("af-ZA", { day: "numeric", month: "short", year: "numeric" }).format(
                      new Date(status.updatedAt),
                    )}
                  </span>
                </span>
              </div>
            ) : null}

            <form action={saveResendKeyAction} className="mt-4 space-y-3">
              <label className="desk-label">
                {ready ? "Vervang met ’n nuwe sleutel" : "Plak jou Resend-sleutel"}
                <input
                  className={`${deskField} font-mono`}
                  name="resend_key"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="re_..."
                  required
                />
              </label>
              <AdminBtn type="submit" icon="check">
                Toets en stoor
              </AdminBtn>
            </form>

            {ready ? (
              <form action={removeResendKeyAction} className="mt-3">
                <DeleteButton
                  label="Verwyder sleutel"
                  confirm="Verwyder die Resend-sleutel? Die webwerf stuur dan geen e-posse meer nie."
                />
              </form>
            ) : null}

            <form action={saveEmailSettingsAction} className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <p className="font-display font-bold text-white">Wat moet ’n e-pos stuur?</p>
              {events.map((event) => (
                <label key={event.name} className="desk-check flex">
                  <input type="checkbox" name={event.name} defaultChecked={settings[event.name]} />
                  {event.label}
                </label>
              ))}
              <label className="desk-label">
                Stuur na
                <input className={deskField} name="to" type="email" defaultValue={settings.to} required />
              </label>
              <label className="desk-label">
                Van-adres (los leeg)
                <input
                  className={deskField}
                  name="from"
                  defaultValue={settings.from === defaultSender ? "" : settings.from}
                  placeholder={defaultSender}
                  autoComplete="off"
                />
              </label>
              <AdminBtn type="submit" icon="check">
                Stoor kennisgewings
              </AdminBtn>
            </form>

            {ready ? (
              <form action={sendTestEmailAction} className="mt-3">
                <AdminBtn type="submit" tone="ghost" size="sm" icon="inbox">
                  Stuur ’n toets-e-pos
                </AdminBtn>
              </form>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <p className="font-display text-lg font-bold text-white">Hoe kry ek ’n sleutel?</p>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm leading-6 text-white/70 marker:font-bold marker:text-lime">
              <li>
                Gaan na{" "}
                <a href="https://resend.com/signup" target="_blank" rel="noreferrer" className="font-bold text-lime underline">
                  resend.com
                </a>{" "}
                en skep ’n gratis rekening met <strong className="text-white">{settings.to}</strong>, die
                adres waarheen die kennisgewings moet gaan.
              </li>
              <li>Maak die e-pos van Resend oop en klik op die skakel om jou adres te bevestig.</li>
              <li>
                Gaan na{" "}
                <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="font-bold text-lime underline">
                  API Keys
                </a>{" "}
                en klik <strong className="text-white">Create API key</strong>. Noem dit “MnrBio”. By
                Permission is <strong className="text-white">Sending access</strong> genoeg.
              </li>
              <li>Kopieer die sleutel dadelik (dit begin met re_). Resend wys dit net een keer.</li>
              <li>
                Plak dit links en klik <strong className="text-white">Toets en stoor</strong>. Ons stuur dadelik
                ’n toets-e-pos na jou.
              </li>
            </ol>
            <p className="mt-4 rounded-xl bg-white/5 px-3.5 py-2.5 text-xs leading-5 text-white/55">
              Die gratis plan is genoeg vir ’n klas se navrae. Sonder ’n eie domein kan Resend net na die adres
              van jou Resend-rekening stuur. Dit werk vir jou kennisgewings, maar welkom-e-posse aan ander
              mense gaan eers deur wanneer ’n domein soos mnrbio.co.za in Resend geverifieer is.
            </p>
          </div>
        </div>
      </AdminPanel>
    </section>
  );
}
