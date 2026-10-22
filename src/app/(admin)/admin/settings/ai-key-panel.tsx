import { removeOpenAiKeyAction, saveOpenAiKeyAction } from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin-client";
import { AdminBadge, AdminBtn, AdminNotice, AdminPanel, deskField } from "@/components/admin-ui";
import type { OpenAiKeyStatus } from "@/lib/openai-key";

const notices: Record<string, { tone: "ok" | "err"; text: string }> = {
  saved: { tone: "ok", text: "Die sleutel werk en is gestoor. Die weektaak gebruik dit van nou af." },
  removed: { tone: "ok", text: "Die sleutel is verwyder. Die weektaak stop tot jy ’n nuwe een byvoeg." },
  format: { tone: "err", text: "Dit lyk nie soos ’n OpenAI-sleutel nie. ’n Sleutel begin met sk-." },
  invalid: { tone: "err", text: "OpenAI het die sleutel afgekeur. Kopieer dit weer en probeer." },
  unreachable: { tone: "err", text: "Kon nie OpenAI bereik nie. Probeer weer oor ’n minuut." },
  failed: { tone: "err", text: "Kon nie die sleutel stoor nie. Probeer weer." },
  "no-table": {
    tone: "err",
    text: "Die databasis is nog nie gereed vir die sleutel nie. Vra die ontwikkelaar om die app_secrets-migrasie te laat loop.",
  },
  "no-service": {
    tone: "err",
    text: "Die bediener se Supabase-dienssleutel ontbreek, so die sleutel kan nie gestoor word nie.",
  },
};

/** Connect the nightly AI jobs to the teacher's own OpenAI account. */
export function AiKeyPanel({ status, result }: { status: OpenAiKeyStatus; result?: string }) {
  const notice = result ? notices[result] : status.state === "no-table" ? notices["no-table"] : undefined;
  const ready = status.state === "ready";

  return (
    <section id="ai-sleutel" className="scroll-mt-24">
      <AdminPanel
        title="AI-verbinding (OpenAI)"
        icon="spark"
        action={<AdminBadge tone={ready ? "live" : "wait"}>{ready ? "Gekoppel" : "Nie gekoppel nie"}</AdminBadge>}
      >
        {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm leading-6 text-white/60">
              Die weektaak gebruik OpenAI om elke Maandag die vasvrae, speletjies en die feit van die week te skryf. Dit loop op jou
              eie OpenAI-rekening, so jy betaal net vir wat gebruik word.
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

            <form action={saveOpenAiKeyAction} className="mt-4 space-y-3">
              <label className="desk-label">
                {ready ? "Vervang met ’n nuwe sleutel" : "Plak jou OpenAI-sleutel"}
                <input
                  className={`${deskField} font-mono`}
                  name="openai_key"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="sk-..."
                  required
                />
              </label>
              <AdminBtn type="submit" icon="check">
                Toets en stoor
              </AdminBtn>
            </form>

            {ready ? (
              <form action={removeOpenAiKeyAction} className="mt-3">
                <DeleteButton
                  label="Verwyder sleutel"
                  confirm="Verwyder die OpenAI-sleutel? Die weektaak stop tot jy ’n nuwe een byvoeg."
                />
              </form>
            ) : null}

            <p className="mt-4 text-xs leading-5 text-white/45">
              Die sleutel word privaat op die bediener gestoor en nooit aan besoekers gewys nie. Hou dit
              geheim: moet dit nie per e-pos of WhatsApp aanstuur nie.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5">
            <p className="font-display text-lg font-bold text-white">Hoe kry ek ’n sleutel?</p>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm leading-6 text-white/70 marker:font-bold marker:text-lime">
              <li>
                Gaan na{" "}
                <a
                  href="https://platform.openai.com/signup"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-lime underline"
                >
                  platform.openai.com
                </a>{" "}
                en skep ’n rekening, of teken in.
              </li>
              <li>
                Gaan na <strong className="text-white">Settings → Billing</strong>, voeg ’n betaalkaart by en
                koop krediet. Begin klein, byvoorbeeld $5.
              </li>
              <li>
                Stel onder <strong className="text-white">Limits</strong> ’n maandelikse beperking, sodat jy
                nooit meer betaal as wat jy wil nie.
              </li>
              <li>
                Gaan na{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-lime underline"
                >
                  API keys
                </a>{" "}
                en klik <strong className="text-white">Create new secret key</strong>. Noem dit “MnrBio”.
              </li>
              <li>Kopieer die sleutel dadelik (dit begin met sk-). OpenAI wys dit net een keer.</li>
              <li>
                Plak dit links en klik <strong className="text-white">Toets en stoor</strong>. Ons kyk dadelik
                of dit werk.
              </li>
            </ol>
            <p className="mt-4 rounded-xl bg-white/5 px-3.5 py-2.5 text-xs leading-5 text-white/55">
              Let wel: ’n ChatGPT Plus-intekening sluit nie API-krediet in nie. Die API word apart op
              platform.openai.com betaal.
            </p>
          </div>
        </div>
      </AdminPanel>
    </section>
  );
}
