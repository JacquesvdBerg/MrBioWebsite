import Link from "next/link";
import { confirmEmailLink } from "@/app/auth/actions";
import { MrBioMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLinkType } from "@/lib/auth-links";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = {
  title: "Bevestig",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string; fout?: string }>;
};

export default async function ConfirmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/rekening");
  const valid = Boolean(params.token_hash && params.type && isLinkType(params.type)) && !params.fout;
  const reset = params.type === "recovery" && next === "/auth/update-password";

  return (
    <main className="mrbio desk desk-login flex-1">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="desk-panel relative z-10 w-full max-w-md p-8 sm:p-9">
        <MrBioMark className="h-14 w-14" />

        {valid ? (
          <>
            <h1 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
              {reset ? "Kies ’n nuwe wagwoord" : "Bevestig jou e-pos"}
            </h1>
            <p className="mt-3 leading-7 text-white/55">
              {reset
                ? "Klik op die knoppie. Daarna kies jy ’n nuwe wagwoord."
                : "Klik op die knoppie om jou rekening te bevestig. Jy word dadelik ingeteken."}
            </p>
            <form action={confirmEmailLink} className="mt-7">
              <input type="hidden" name="token_hash" value={params.token_hash} />
              <input type="hidden" name="type" value={params.type} />
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="desk-btn desk-btn-navy w-full">
                {reset ? "Gaan voort" : "Bevestig en teken in"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.03em] text-white">
              Die skakel werk nie meer nie
            </h1>
            <p className="mt-3 leading-7 text-white/55">
              ’n Skakel werk net een keer en verval na ’n ruk. Teken in, of vra ’n nuwe skakel op die
              rekeningblad.
            </p>
            <Link href="/rekening" className="desk-btn desk-btn-navy mt-7 w-full">
              Gaan na my rekening
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
