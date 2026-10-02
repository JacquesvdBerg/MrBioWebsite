import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/app/auth/update-password/update-password-form";
import { MrBioMark } from "@/components/brand";
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
    <main className="mrbio desk desk-login flex-1">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="desk-panel relative z-10 w-full max-w-md p-8 sm:p-9">
        <MrBioMark className="h-14 w-14" />
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.03em] text-white">Nuwe wagwoord</h1>
        <p className="mt-3 leading-7 text-white/55">
          Kies ’n wagwoord van minstens 8 karakters. Daarna gaan jy terug.
        </p>
        <UpdatePasswordForm />
      </div>
    </main>
  );
}
