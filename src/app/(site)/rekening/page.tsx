import Link from "next/link";
import { signOutPublic, updateLearnerProfile } from "@/app/(site)/actions";
import { AccountForm } from "@/app/(site)/rekening/account-form";
import { GradeOptions } from "@/components/grade-options";
import { SectionPage } from "@/components/section-page";
import { Arrow } from "@/components/ui";
import { getSessionAccount } from "@/lib/auth-role";
import { formatDeskDate, formatRelativeAf } from "@/lib/dates";
import { getLearnerChatThreads } from "@/lib/live-chat";
import { getPurchasesForUser } from "@/lib/purchases";
import { safeNextPath } from "@/lib/safe-next";
import { gradeActivitiesPath, gradeColors, gradePath, isGrade } from "@/lib/site";

export const metadata = {
  title: "My rekening",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    next?: string;
    mode?: string;
    reset?: string;
    gestoor?: string;
    wagwoord?: string;
    fout?: string;
  }>;
};

const crumbs = [
  { href: "/", label: "Tuis" },
  { href: "/rekening", label: "Rekening" },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]!.toUpperCase()).join("") : "?";
}

function pageNotice(params: Awaited<PageProps["searchParams"]>) {
  if (params.gestoor) {
    return { ok: true, text: "Jou besonderhede is gestoor." };
  }
  if (params.wagwoord) {
    return { ok: true, text: "Jou nuwe wagwoord is gestoor." };
  }
  if (params.fout === "naam") {
    return { ok: false, text: "Vul jou naam in." };
  }
  if (params.fout) {
    return { ok: false, text: "Kon nie stoor nie. Probeer weer." };
  }
  return null;
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOutPublic}>
      <button type="submit" className={className}>
        <SignOutIcon />
        Teken uit
      </button>
    </form>
  );
}

export default async function AccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const account = await getSessionAccount();
  const nextPath = safeNextPath(params.next, "/rekening");

  if (!account) {
    return (
      <SectionPage
        eyebrow="Rekening"
        title={
          <>
            Jou MnrBio-profiel. <span className="gradient-text">Een aanmelding.</span>
          </>
        }
        description="Teken in of skep ’n gratis rekening om die onderwyser vrae te vra en jou aankope op een plek te sien."
        crumbs={crumbs}
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

  const [purchases, threads] = await Promise.all([
    getPurchasesForUser(account.userId),
    getLearnerChatThreads(account.userId),
  ]);
  const grade = account.grade && isGrade(account.grade) ? account.grade : null;
  const [colorFrom, colorTo] = grade ? gradeColors[grade] : gradeColors[8];
  const firstName = account.name.split(/\s+/)[0] || account.name;
  const notice = pageNotice(params);
  const answered = threads.filter((thread) => thread.unreadForLearner).length;

  const shortcuts = grade
    ? [
        { href: gradePath(grade), label: `Graad ${grade} se kwartale`, note: "Onderwerpe en studiemateriaal" },
        { href: gradeActivitiesPath(grade), label: "Speletjies en vasvrae", note: `Oefen vir graad ${grade}` },
        { href: `/shop?graad=${grade}`, label: "Winkel", note: "Opsommings en skyfies" },
      ]
    : [
        { href: "/graad", label: "Kies jou graad", note: "Graad 8 tot 12" },
        { href: "/play-and-learn", label: "Speletjies en vasvrae", note: "Oefen enige onderwerp" },
        { href: "/shop", label: "Winkel", note: "Opsommings en skyfies" },
      ];

  return (
    <SectionPage
      eyebrow="Rekening"
      title={
        <>
          Hallo, <span className="gradient-text">{firstName}.</span>
        </>
      }
      description="Jou besonderhede, jou vrae aan die onderwyser en jou aankope. Dieselfde rekening op elke toestel."
      crumbs={crumbs}
      actions={
        <>
          {account.isAdmin ? (
            <Link href="/admin" className="btn btn-lime">
              Maak die lessenaar oop
            </Link>
          ) : (
            <Link href="/live-chat" className="btn btn-lime">
              Vra die onderwyser
            </Link>
          )}
          <SignOutButton className="btn btn-ghost" />
        </>
      }
    >
      {notice ? (
        <p
          className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            notice.ok ? "border-lime/30 bg-lime/10 text-lime" : "border-orange/30 bg-orange/10 text-orange"
          }`}
          role="status"
        >
          {notice.text}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass rounded-[1.8rem] p-6 md:p-7 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-extrabold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
              aria-hidden
            >
              {initialsOf(account.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-2xl font-bold text-white">{account.name}</h2>
              <p className="truncate text-sm text-white/55">{account.email}</p>
            </div>
            <span
              className="rounded-full px-3.5 py-1.5 text-sm font-bold text-white"
              style={{ background: grade ? colorTo : "rgba(255,255,255,0.12)" }}
            >
              {account.audience === "ander" ? "Ander" : grade ? `Graad ${grade}` : "Geen graad nie"}
            </span>
          </div>

          <form action={updateLearnerProfile} className="mt-6 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
            <label className="block">
              <span className="text-[13px] font-bold text-white">Naam</span>
              <input
                className="input-dark mt-1.5 w-full"
                name="name"
                defaultValue={account.name}
                autoComplete="name"
                maxLength={80}
                required
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-bold text-white">Graad</span>
              <select
                className="input-dark mt-1.5 w-full"
                name="grade"
                defaultValue={account.audience === "ander" ? "ander" : (grade ?? "")}
              >
                <GradeOptions emptyLabel="Geen graad" />
              </select>
            </label>
            <button type="submit" className="btn btn-lime">
              Stoor
            </button>
          </form>
        </section>

        <section className="glass rounded-[1.8rem] p-6 md:p-7">
          <h2 className="font-display text-xl font-bold text-white">{grade ? `Vir graad ${grade}` : "Begin hier"}</h2>
          <ul className="mt-4 grid gap-2">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.href}>
                <Link
                  href={shortcut.href}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 transition-colors hover:border-lime/40"
                >
                  <span>
                    <span className="block font-bold text-white">{shortcut.label}</span>
                    <span className="block text-[13px] text-white/50">{shortcut.note}</span>
                  </span>
                  <Arrow className="h-4 w-4 text-lime transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-[1.8rem] p-6 md:p-7 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-white">
              Jou vrae aan die onderwyser
              {answered ? (
                <span className="ml-2 rounded-full bg-lime px-2.5 py-0.5 align-middle text-xs font-extrabold text-ink">
                  {answered} nuwe antwoord{answered === 1 ? "" : "e"}
                </span>
              ) : null}
            </h2>
            <Link href="/live-chat" className="btn btn-ghost btn-sm">
              Nuwe vraag
            </Link>
          </div>
          {threads.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-white/55">
              Nog geen vrae nie. Sit vas met ’n onderwerp? Vra die onderwyser in die klets, dan kry jy die
              antwoord hier.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {threads.slice(0, 4).map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/live-chat?id=${thread.id}`}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 transition-colors hover:border-lime/40"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold text-white">{thread.topic}</span>
                      <span className="block truncate text-[13px] text-white/55">{thread.lastMessage}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {thread.unreadForLearner ? (
                        <span className="block text-xs font-extrabold text-lime">Nuwe antwoord</span>
                      ) : null}
                      <span className="block text-xs text-white/45">{formatRelativeAf(thread.lastMessageAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-[1.8rem] p-6 md:p-7">
          <h2 className="font-display text-xl font-bold text-white">Aankope</h2>
          {purchases.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-white/55">
              Nog niks gekoop nie. Wanneer jy opsommings of skyfies kry, verskyn dit hier.
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
          <Link href="/shop" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-lime">
            Gaan na die winkel
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </section>

        <section className="glass flex flex-col gap-5 rounded-[1.8rem] p-6 md:flex-row md:items-center md:justify-between md:p-7 lg:col-span-3">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Wagwoord en uitteken</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Ingeteken as {account.email}. Op ’n gedeelde rekenaar of foon? Teken uit as jy klaar is.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/update-password" className="btn btn-ghost">
              Verander wagwoord
            </Link>
            <SignOutButton className="btn btn-coral" />
          </div>
        </section>
      </div>
    </SectionPage>
  );
}
