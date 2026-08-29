import { DnaMark } from "@/components/icons";
import { Eyebrow } from "@/components/ui";
import { LoginForm } from "@/app/login/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = {
  title: "Teken in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="card-surface w-full max-w-md p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream ring-1 ring-line">
          <DnaMark className="h-7 w-7" />
        </span>
        <Eyebrow className="mt-6">Admin</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">
          Teken in
        </h1>
        <p className="mt-3 leading-7 text-muted">
          Slegs die administrateur het ’n rekening nodig. Leerders gebruik die
          werf sonder om in te teken.
        </p>
        {configured ? (
          <LoginForm nextPath={safeNextPath(params.next)} />
        ) : (
          <p className="mt-7 text-sm text-orange">
            Supabase is nie gekoppel nie. Sit{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> en{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in{" "}
            <code>.env</code>.
          </p>
        )}
      </div>
    </main>
  );
}
