import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { MrBioMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = {
  title: "Teken in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="mrbio desk desk-login flex-1">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <Image
        src="/images/home/island/island.webp"
        alt=""
        width={1338}
        height={1492}
        sizes="384px"
        className="desk-login-art"
        priority
      />
      <div className="desk-panel relative z-10 w-full max-w-md p-8 sm:p-9">
        <div className="flex items-center gap-3">
          <MrBioMark className="h-14 w-14" />
          <span className="leading-tight">
            <span className="block font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
              Mnr<span className="text-lime">Bio</span>
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Lessenaar
            </span>
          </span>
        </div>
        <h1 className="mt-7 font-display text-3xl font-extrabold tracking-[-0.03em] text-white">Welkom terug</h1>
        <p className="mt-2 leading-7 text-white/55">
          Dit is die onderwyser se lessenaar. Leerders teken in by{" "}
          <Link href="/rekening" className="font-semibold text-lime">
            My rekening
          </Link>
          .
        </p>
        {configured ? (
          <LoginForm
            nextPath={safeNextPath(params.next, "/admin")}
            resetFailed={params.reset === "failed"}
          />
        ) : (
          <p className="desk-notice is-err mt-7">
            Supabase is nie gekoppel nie. Sit NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.
          </p>
        )}
        <Link href="/" className="desk-back mt-6 mb-0">
          ← Terug na die werf
        </Link>
      </div>
    </main>
  );
}
