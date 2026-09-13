import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { DnaMark } from "@/components/icons";
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
    <main className="mrbio desk flex flex-1 items-center justify-center px-4 py-20">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="desk-panel w-full max-w-md p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-on-accent">
          <DnaMark className="h-7 w-7" />
        </span>
        <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
          MrBio desk
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Teken in</h1>
        <p className="mt-3 leading-7 text-white/55">
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
          <p className="mt-7 text-sm text-coral">
            Supabase is nie gekoppel nie. Sit <code>NEXT_PUBLIC_SUPABASE_URL</code> en{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env</code>.
          </p>
        )}
      </div>
    </main>
  );
}
