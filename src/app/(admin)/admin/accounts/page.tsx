import { createAdminAccount } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { isServiceRoleConfigured, listAdminAccounts } from "@/lib/admin-accounts";

export const metadata = {
  title: "Rekeninge",
};

export const dynamic = "force-dynamic";

type AccountsPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

function accountNotice(error: string | undefined, created: boolean) {
  if (created) {
    return { tone: "ok" as const, text: "Rekening is geskep. Hulle kan nou inteken." };
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
      return { tone: "err" as const, text: "Kon nie die rekening skep nie." };
    default:
      return { tone: "err" as const, text: "Kon nie die rekening skep nie." };
  }
}

export default async function AdminAccountsPage({ searchParams }: AccountsPageProps) {
  const params = await searchParams;
  const accounts = await listAdminAccounts();
  const hasService = isServiceRoleConfigured();
  const notice = accountNotice(params.error, params.created === "1");

  return (
    <AdminPage
      title="Rekeninge"
      description="Skep admin-rekeninge vir werknemers vanaf die lessenaar — nie vanaf die inteken-blad nie. Stuur die wagwoord self; ons stuur nie ’n welkom-e-pos nie."
    >
      {notice ? (
        <p className={`mb-6 text-sm ${notice.tone === "ok" ? "text-lime" : "text-orange"}`}>
          {notice.text}
        </p>
      ) : null}

      <AdminPanel title="Skep admin-rekening">
        {hasService ? (
          <form action={createAdminAccount} className="grid gap-3 md:grid-cols-3">
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
            <label className="desk-label">
              Wagwoord
              <input
                className={deskField}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <div className="flex items-end">
              <AdminBtn type="submit">Skep rekening</AdminBtn>
            </div>
          </form>
        ) : (
          <AdminEmpty
            title="Dienssleutel ontbreek"
            body="Sit SUPABASE_SERVICE_ROLE_KEY in die omgewing sodat jy rekeninge kan skep sonder om uit te teken."
          />
        )}
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title={`${accounts.length} rekeninge`}>
          {accounts.length === 0 ? (
            <AdminEmpty
              title="Nog geen rekeninge sigbaar nie"
              body="Sodra die dienssleutel gekoppel is, verskyn elke admin-e-pos hier."
            />
          ) : (
            <ul>
              {accounts.map((account) => (
                <li key={account.id} className="desk-row">
                  <div>
                    <p className="font-display font-bold text-white">{account.email}</p>
                    <p className="text-sm text-white/55">
                      {new Intl.DateTimeFormat("af-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(account.createdAt))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
