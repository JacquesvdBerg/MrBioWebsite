"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-2 w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2.5 text-[15px] text-navy";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finishSignIn(email: string, password: string) {
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const intent = String(form.get("intent") ?? "signin");

    try {
      if (intent === "signup") {
        if (password.length < 8) {
          throw new Error("Wagwoord moet minstens 8 karakters wees.");
        }

        const supabase = createClient();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.session) {
          await finishSignIn(email, password);
          return;
        }

        router.replace(nextPath);
        router.refresh();
        return;
      }

      await finishSignIn(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie inteken nie.");
      setPending(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-[13px] font-bold text-navy">E-pos</span>
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jy@voorbeeld.co.za"
          required
        />
      </label>
      <label className="block">
        <span className="text-[13px] font-bold text-navy">Wagwoord</span>
        <input
          className={inputClass}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <button
        type="submit"
        name="intent"
        value="signin"
        disabled={pending}
        className="w-full rounded-full bg-navy px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Wag…" : "Teken in"}
      </button>
      <button
        type="submit"
        name="intent"
        value="signup"
        disabled={pending}
        className="w-full rounded-full border border-navy/15 bg-white px-5 py-3 text-sm font-bold text-navy disabled:opacity-60"
      >
        Skep admin-rekening
      </button>
    </form>
  );
}
