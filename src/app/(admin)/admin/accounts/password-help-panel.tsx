import { setLearnerPassword } from "@/app/(admin)/admin/actions";
import { GeneratePasswordButton, ResetLinkButton } from "@/app/(admin)/admin/accounts/reset-link-button";
import { AdminBtn, AdminEmpty, AdminPanel, deskField } from "@/components/admin-ui";
import { PasswordField } from "@/components/password-field";
import { formatRelativeAf } from "@/lib/dates";
import {
  passwordHelpReason,
  type LearnerAccount,
  type PasswordHelpRequest,
} from "@/lib/password-help";

function learnerLabel(learner: LearnerAccount) {
  if (learner.audience === "ander") {
    return "Ander";
  }
  return learner.grade ? `Graad ${learner.grade}` : "Geen graad";
}

export function PasswordHelpPanel({
  requests,
  learners,
  email,
  hasService,
}: {
  requests: PasswordHelpRequest[];
  learners: LearnerAccount[];
  email: string;
  hasService: boolean;
}) {
  return (
    <AdminPanel title="Wagwoordhulp" icon="users">
      <p className="text-sm leading-6 text-white/60">
        As iemand nie kan inteken nie, verskyn hulle hier. Genereer ’n wagwoord en stuur dit self, of stuur ’n
        herstel-skakel wat hulle oopmaak om self een te kies.
      </p>

      {hasService ? (
        <form id="wagwoord" action={setLearnerPassword} className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
          <label className="desk-label">
            E-pos
            <input
              className={deskField}
              name="email"
              type="email"
              autoComplete="off"
              defaultValue={email}
              required
            />
          </label>
          <div className="desk-label">
            <label htmlFor="learner-password">Nuwe wagwoord</label>
            <PasswordField
              id="learner-password"
              name="password"
              variant="desk"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="flex items-end">
            <AdminBtn type="submit" icon="check">
              Stoor wagwoord
            </AdminBtn>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <AdminEmpty
            title="Dienssleutel ontbreek"
            body="Sit SUPABASE_SERVICE_ROLE_KEY in die omgewing sodat jy ’n wagwoord kan verander."
          />
        </div>
      )}

      {requests.length > 0 ? (
        <ul className="mt-5 border-t border-white/10">
          {requests.map((request) => (
            <li key={request.id} className="desk-row items-start">
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-white">{request.email}</p>
                <p className="text-sm text-white/55">{passwordHelpReason(request.reason)}</p>
                <p className="text-xs text-white/40">{formatRelativeAf(request.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <GeneratePasswordButton email={request.email} />
                <ResetLinkButton email={request.email} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/45">Geen oop versoeke nie. Jy kan nog steeds ’n e-pos hierbo intik.</p>
      )}

      {learners.length > 0 ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="font-display font-bold text-white">Leerders</p>
          <ul>
            {learners.map((learner) => (
              <li key={learner.id} className="desk-row">
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{learner.name || learner.email}</p>
                  <p className="truncate text-sm text-white/55">{learner.email}</p>
                  <p className="text-xs text-white/40">{learnerLabel(learner)}</p>
                </div>
                {learner.email ? <GeneratePasswordButton email={learner.email} /> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AdminPanel>
  );
}
