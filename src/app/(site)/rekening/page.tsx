import Link from "next/link";
import { signOutPublic } from "@/app/(site)/actions";
import { AccountForm } from "@/app/(site)/rekening/account-form";
import { SectionPage } from "@/components/section-page";
import { getSessionAccount } from "@/lib/auth-role";
import { formatDeskDate } from "@/lib/dates";
import { getPurchasesForUser } from "@/lib/purchases";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = {
  title: "My rekening",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ next?: string; mode?: string; reset?: string }>;
};

export default async function AccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const account = await getSessionAccount();
  const nextPath = safeNextPath(params.next, "/live-chat");

  if (!account) {
    return (
      <SectionPage
        eyebrow="Rekening"
        title={
          <>
            Jou MnrBio-profiel. <span className="gradient-text">Een aanmelding.</span>
          </>
        }
        description="Teken in of skep ’n rekening om te klets, later eksklusiewe speletjies te kry, en jou aankope hier te sien."
        crumbs={[
          { href: "/", label: "Tuis" },
          { href: "/rekening", label: "Rekening" },
        ]}
      >
        <div className="mx-auto max-w-md">
          <div className="glass rounded-[1.8rem] p-6 md:p-8">
            <AccountForm
              nextPath={nextPath}
              initialMode={params.mode === "register" ? "register" : "signin"}
              resetFailed={params.reset === "failed"}
            />
          </div>
        </div>
      </SectionPage>
    );
  }

  const purchases = await getPurchasesForUser(account.userId);

  return (
    <SectionPage
      eyebrow="Rekening"
      title={
        <>
          Hallo, <span className="gradient-text">{account.name}.</span>
        </>
      }
      description="Hier sit jou besonderhede, kletse en eendag jou aankope — dieselfde rekening op elke toestel."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/rekening", label: "Rekening" },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">Profiel</p>
          <p className="mt-3 font-display text-2xl font-bold text-white">{account.name}</p>
          <p className="mt-1 text-sm text-white/55">{account.email}</p>
          <p className="mt-1 text-sm text-white/55">
            {account.grade ? `Graad ${account.grade}` : "Geen graad gekies"}
          </p>
          {account.isAdmin ? (
            <Link href="/admin" className="btn btn-lime mt-5">
              Maak die lessenaar oop
            </Link>
          ) : (
            <Link href="/live-chat" className="btn btn-lime mt-5">
              Vra die onderwyser
            </Link>
          )}
          <form action={signOutPublic} className="mt-3">
            <button type="submit" className="text-sm font-semibold text-white/50">
              Teken uit
            </button>
          </form>
        </div>
        <div className="glass rounded-[1.8rem] p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">Aankope</p>
          {purchases.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-white/55">
              Nog niks gekoop nie. Wanneer jy notas of ’n bundel kry, verskyn dit hier teen hierdie rekening.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {purchases.map((purchase) => (
                <li key={purchase.id}>
                  <p className="font-bold text-white">{purchase.title}</p>
                  <p className="text-xs text-white/45">{formatDeskDate(purchase.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionPage>
  );
}
