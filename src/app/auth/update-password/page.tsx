import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/app/auth/update-password/update-password-form";
import { DnaMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Nuwe wagwoord",
};

export default async function UpdatePasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect("/rekening");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/rekening?reset=failed");
  }

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
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Nuwe wagwoord</h1>
        <p className="mt-3 leading-7 text-white/55">
          Kies ’n wagwoord van minstens 8 karakters. Daarna gaan jy terug.
        </p>
        <UpdatePasswordForm />
      </div>
    </main>
  );
}
