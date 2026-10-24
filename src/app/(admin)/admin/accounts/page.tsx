import Link from "next/link";
import { createAdminAccount } from "@/app/(admin)/admin/actions";
import { PasswordHelpPanel } from "@/app/(admin)/admin/accounts/password-help-panel";
import { PasswordField } from "@/components/password-field";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminNotice,
  AdminPanel,
  initialsOf,
  deskField,
} from "@/components/admin-ui";
import { isServiceRoleConfigured, listAdminAccounts } from "@/lib/admin-accounts";
import { isPlainEmail, listLearnerAccounts, listOpenPasswordHelp } from "@/lib/password-help";
import { getResendKeyStatus } from "@/lib/email";

export const metadata = {
  title: "Rekeninge",
};

export const dynamic = "force-dynamic";

type AccountsPageProps = {
  searchParams: Promise<{ created?: string; error?: string; welcome?: string; saved?: string; email?: string }>;
};

function welcomeProblem(result: string) {
  switch (result) {
    case "own-only":
      return "sonder ’n eie domein stuur Resend net na die adres van jou Resend-rekening";
    case "no-key":
      return "geen Resend-sleutel is onder Instellings gekoppel nie";
    case "limit":
      return "Resend se daaglikse limiet is bereik";
    default:
      return "Resend het dit nie aanvaar nie";
  }
}

function accountNotice(
  error: string | undefined,
  created: boolean,
  welcome: string | undefined,
  savedEmail: string | undefined,
) {
  if (savedEmail) {
    return {
      tone: "ok" as const,
      text: `Die wagwoord vir ${savedEmail} is verander. Stuur die nuwe wagwoord self vir hulle.`,
    };
  }

  if (created && welcome && welcome !== "sent") {
    return {
      tone: "err" as const,
      text: `Rekening is geskep, maar die welkom-e-pos het nie gegaan nie: ${welcomeProblem(welcome)}. Laat weet hulle self.`,
    };
  }

  if (created) {
    return {
      tone: "ok" as const,
      text: welcome
        ? "Rekening is geskep en die welkom-e-pos is gestuur. Gee self vir hulle die wagwoord."
        : "Rekening is geskep. Hulle kan nou inteken.",
    };
  }

  if (!error) {
    return null;
  }

  switch (error) {
    case "email":
      return { tone: "err" as const, text: "Sit ’n e-posadres in." };
    case "password":
      return { tone: "err" as const, text: "Wagwoord moet minstens 8 karakters wees." };
    case "service":
      return {
        tone: "err" as const,
        text: "SUPABASE_SERVICE_ROLE_KEY ontbreek. Sonder dit kan jy nie rekeninge skep nie.",
      };
    case "exists":
      return { tone: "err" as const, text: "Daardie e-pos het al ’n rekening." };
    case "failed":
      return { tone: "err" as const, text: "Kon nie die rekening skep of die wagwoord verander nie." };
    case "learner":
      return { tone: "err" as const, text: "Geen leerderrekening met daardie e-pos nie." };
    case "admin-password":
      return { tone: "err" as const, text: "Admin-wagwoorde verander jy nie op hierdie vorm nie." };
    case "weak":
      return {
        tone: "err" as const,
        text: "Kies ’n sterker wagwoord: minstens 8 karakters, met letters en syfers.",
      };
    default:
      return { tone: "err" as const, text: "Kon nie die rekening skep of die wagwoord verander nie." };
  }
}

export default async function AdminAccountsPage({ searchParams }: AccountsPageProps) {
  const params = await searchParams;
  const helpEmail = params.email && isPlainEmail(params.email) ? params.email : "";
  const savedEmail = params.saved === "1" && helpEmail ? helpEmail : undefined;
  const [accounts, emailStatus, requests, learners] = await Promise.all([
    listAdminAccounts(),
    getResendKeyStatus(),
    listOpenPasswordHelp(),
    listLearnerAccounts(),
  ]);
  const hasService = isServiceRoleConfigured();
  const canEmail = emailStatus.state === "ready";
  const notice = accountNotice(params.error, params.created === "1", params.welcome, savedEmail);

  return (
    <AdminPage
      title="Rekeninge"
      description="Skep admin-rekeninge vir werknemers hier, nie op die intekenblad nie. Gee self die wagwoord aan: die welkom-e-pos stuur net die intekenskakel, nooit die wagwoord nie. Hier stel jy ook ’n nuwe wagwoord as iemand se herstel-e-pos nie uitgekom het nie."
    >
      {notice ? (
        <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice>
      ) : null}

      <PasswordHelpPanel requests={requests} learners={learners} email={helpEmail} hasService={hasService} />

      <div className="mt-6">
      <AdminPanel title="Skep admin-rekening" icon="plus">
        {hasService ? (
          <form action={createAdminAccount} className="grid gap-3 md:grid-cols-4">
            <label className="desk-label">
              Naam
              <input className={deskField} name="name" autoComplete="off" placeholder="Bv. Louis Fourie" />
            </label>
            <label className="desk-label">
              E-pos
              <input
                className={deskField}
                name="email"
                type="email"
                autoComplete="off"
                required
              />
            </label>
            <div className="desk-label">
              <label htmlFor="admin-password">Wagwoord</label>
              <PasswordField
                id="admin-password"
                name="password"
                variant="desk"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="flex items-end">
              <AdminBtn type="submit" icon="plus">
                Skep rekening
              </AdminBtn>
            </div>
            {canEmail ? (
              <label className="desk-check md:col-span-4">
                <input type="checkbox" name="welcome" defaultChecked />
                Stuur ’n welkom-e-pos met die intekenskakel
              </label>
            ) : (
              <p className="text-sm text-white/45 md:col-span-4">
                Koppel e-pos onder{" "}
                <Link href="/admin/settings#e-pos" className="font-bold text-lime underline">
                  Instellings
                </Link>{" "}
                om ’n welkom-e-pos te stuur.
              </p>
            )}
          </form>
        ) : (
          <AdminEmpty
            title="Dienssleutel ontbreek"
            body="Sit SUPABASE_SERVICE_ROLE_KEY in die omgewing sodat jy rekeninge kan skep sonder om uit te teken."
          />
        )}
      </AdminPanel>
      </div>

      <div className="mt-6">
        <AdminPanel title={`${accounts.length} rekeninge`} icon="users">
          {accounts.length === 0 ? (
            <AdminEmpty
              title="Nog geen rekeninge sigbaar nie"
              body="Sodra die dienssleutel gekoppel is, verskyn elke admin-e-pos hier."
            />
          ) : (
            <ul>
              {accounts.map((account) => (
                <li key={account.id} className="desk-row">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="desk-avatar is-blue">{initialsOf(account.email.split("@")[0].replace(/[._-]+/g, " "))}</span>
                    <div className="min-w-0">
                    <p className="truncate font-display font-bold text-white">{account.email}</p>
                    <p className="text-sm text-white/55">
                      {new Intl.DateTimeFormat("af-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(account.createdAt))}
                    </p>
                    </div>
                  </div>
                  <AdminBadge tone="live">Admin</AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
