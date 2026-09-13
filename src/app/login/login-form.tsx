"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deskField } from "@/components/admin-ui";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  nextPath,
  resetFailed,
}: {
  nextPath: string;
  resetFailed?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [error, setError] = useState<string | null>(
    resetFailed ? "Die herstel-skakel het verval of is ongeldig. Vra ’n nuwe een." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
        });

        if (resetError) {
          throw resetError;
        }

        setNotice("As daardie e-pos ’n rekening het, stuur ons ’n herstel-skakel.");
        setPending(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie inteken nie.");
      setPending(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-[13px] font-bold text-white">E-pos</span>
        <input
          className={deskField}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jy@voorbeeld.co.za"
          required
        />
      </label>
      {mode === "signin" ? (
        <div>
          <span className="flex items-center justify-between gap-3 text-[13px] font-bold text-white">
            <label htmlFor="login-password">Wagwoord</label>
            <button
              type="button"
              className="font-semibold text-lime hover:underline"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setNotice(null);
              }}
            >
              Wagwoord vergeet?
            </button>
          </span>
          <input
            id="login-password"
            className={deskField}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      ) : (
        <p className="text-sm leading-6 text-white/55">
          Ons stuur ’n skakel na jou e-pos. Maak dit oop om ’n nuwe wagwoord te kies.
        </p>
      )}
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      {notice ? <p className="text-sm text-lime">{notice}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="desk-btn desk-btn-navy w-full disabled:opacity-60"
      >
        {pending ? "Wag…" : mode === "forgot" ? "Stuur herstel-skakel" : "Teken in"}
      </button>
      {mode === "forgot" ? (
        <button
          type="button"
          className="desk-btn desk-btn-ghost w-full"
          onClick={() => {
            setMode("signin");
            setError(null);
            setNotice(null);
          }}
        >
          Terug na inteken
        </button>
      ) : null}
    </form>
  );
}
