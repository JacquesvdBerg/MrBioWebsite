"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { grades } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

export function AccountForm({
  nextPath,
  initialMode,
  resetFailed,
}: {
  nextPath: string;
  initialMode: "signin" | "register" | "forgot";
  resetFailed?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register" | "forgot">(initialMode);
  const [error, setError] = useState<string | null>(
    resetFailed ? "Die herstel-skakel het verval. Vra ’n nuwe een." : null,
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
    const name = String(form.get("name") ?? "").trim();
    const grade = String(form.get("grade") ?? "");

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

      if (mode === "register") {
        if (password.length < 8) {
          throw new Error("Wagwoord moet minstens 8 karakters wees.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              grade,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.session) {
          setNotice("Kyk in jou e-pos om die rekening te bevestig, dan teken jy in.");
          setMode("signin");
          setPending(false);
          return;
        }

        router.replace(nextPath);
        router.refresh();
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
      setError(caught instanceof Error ? caught.message : "Kon nie voortgaan nie.");
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mode === "register" ? (
        <>
          <label className="block">
            <span className="text-[13px] font-bold text-white">Naam</span>
            <input className="input-dark mt-1.5 w-full" name="name" required />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold text-white">Graad</span>
            <select className="input-dark mt-1.5 w-full" name="grade" defaultValue="10">
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  Graad {grade}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
      <label className="block">
        <span className="text-[13px] font-bold text-white">E-pos</span>
        <input className="input-dark mt-1.5 w-full" name="email" type="email" required />
      </label>
      {mode !== "forgot" ? (
        <label className="block">
          <span className="flex items-center justify-between text-[13px] font-bold text-white">
            Wagwoord
            {mode === "signin" ? (
              <button
                type="button"
                className="font-semibold text-lime"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                }}
              >
                Vergeet?
              </button>
            ) : null}
          </span>
          <input
            className="input-dark mt-1.5 w-full"
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
          />
        </label>
      ) : (
        <p className="text-sm text-white/55">Ons stuur ’n skakel om ’n nuwe wagwoord te kies.</p>
      )}
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      {notice ? <p className="text-sm text-lime">{notice}</p> : null}
      <button type="submit" className="btn btn-lime w-full" disabled={pending}>
        {pending
          ? "Wag…"
          : mode === "register"
            ? "Skep rekening"
            : mode === "forgot"
              ? "Stuur skakel"
              : "Teken in"}
      </button>
      <button
        type="button"
        className="w-full text-center text-sm font-semibold text-white/55"
        onClick={() => {
          setMode(mode === "register" ? "signin" : "register");
          setError(null);
          setNotice(null);
        }}
      >
        {mode === "register" ? "Het jy al ’n rekening? Teken in" : "Nuut hier? Skep ’n rekening"}
      </button>
    </form>
  );
}
