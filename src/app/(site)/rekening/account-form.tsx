"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  registerLearner,
  requestPasswordReset,
  resendConfirmation,
  type AuthResult,
} from "@/app/auth/actions";
import { grades } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "register" | "forgot";

function signInMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) {
    return "Die e-pos of wagwoord is verkeerd.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Te veel pogings. Wag ’n paar minute en probeer weer.";
  }
  return "Kon nie inteken nie. Probeer weer.";
}

export function AccountForm({
  nextPath,
  initialMode,
  resetFailed,
}: {
  nextPath: string;
  initialMode: Mode;
  resetFailed?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(
    resetFailed ? "Die skakel het verval. Vra ’n nuwe een." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<{ email: string; password: string } | null>(null);
  const [pending, setPending] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setUnconfirmed(null);
  }

  function apply(result: AuthResult) {
    if (result.status === "signed-in") {
      router.replace(result.next);
      router.refresh();
      return;
    }
    if (result.status === "check-email") {
      setNotice(result.message);
    } else {
      setError(result.message);
    }
    setPending(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    setUnconfirmed(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "forgot") {
        apply(await requestPasswordReset({ email }));
        return;
      }

      if (mode === "register") {
        apply(
          await registerLearner({
            name: String(form.get("name") ?? ""),
            grade: String(form.get("grade") ?? ""),
            email,
            password,
            next: nextPath,
            website: String(form.get("website") ?? ""),
          }),
        );
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("not confirmed")) {
          setUnconfirmed({ email, password });
          setError("Jou e-pos is nog nie bevestig nie.");
          setPending(false);
          return;
        }
        throw new Error(signInMessage(signInError.message));
      }

      router.replace(nextPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie voortgaan nie.");
      setPending(false);
    }
  }

  async function onResend() {
    if (!unconfirmed) {
      return;
    }
    setPending(true);
    setError(null);
    setUnconfirmed(null);
    apply(await resendConfirmation({ ...unconfirmed, next: nextPath }));
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        {(["signin", "register"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchMode(option)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              mode === option || (option === "signin" && mode === "forgot")
                ? "bg-lime text-ink"
                : "text-white/60 hover:text-white"
            }`}
          >
            {option === "signin" ? "Teken in" : "Skep rekening"}
          </button>
        ))}
      </div>

      {mode === "register" ? (
        <>
          <label className="block">
            <span className="text-[13px] font-bold text-white">Naam</span>
            <input className="input-dark mt-1.5 w-full" name="name" autoComplete="name" required />
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
          {/* Left empty by people; bots fill it in. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
        </>
      ) : null}
      <label className="block">
        <span className="text-[13px] font-bold text-white">E-pos</span>
        <input className="input-dark mt-1.5 w-full" name="email" type="email" autoComplete="email" required />
      </label>
      {mode !== "forgot" ? (
        <label className="block">
          <span className="flex items-center justify-between text-[13px] font-bold text-white">
            Wagwoord
            {mode === "signin" ? (
              <button type="button" className="font-semibold text-lime" onClick={() => switchMode("forgot")}>
                Vergeet?
              </button>
            ) : (
              <span className="font-semibold text-white/45">Minstens 8 karakters</span>
            )}
          </span>
          <input
            className="input-dark mt-1.5 w-full"
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            minLength={mode === "register" ? 8 : undefined}
            required
          />
        </label>
      ) : (
        <p className="text-sm leading-6 text-white/55">
          Ons stuur ’n skakel na jou e-pos. Maak dit oop om ’n nuwe wagwoord te kies.
        </p>
      )}
      {error ? <p className="text-sm font-semibold text-orange">{error}</p> : null}
      {unconfirmed ? (
        <button type="button" className="btn btn-ghost w-full" disabled={pending} onClick={onResend}>
          Stuur die bevestigingskakel weer
        </button>
      ) : null}
      {notice ? (
        <p className="rounded-2xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm font-semibold leading-6 text-lime">
          {notice}
        </p>
      ) : null}
      <button type="submit" className="btn btn-lime w-full" disabled={pending}>
        {pending
          ? "Wag…"
          : mode === "register"
            ? "Skep rekening"
            : mode === "forgot"
              ? "Stuur skakel"
              : "Teken in"}
      </button>
      {mode === "forgot" ? (
        <button
          type="button"
          className="w-full text-center text-sm font-semibold text-white/55"
          onClick={() => switchMode("signin")}
        >
          Terug na inteken
        </button>
      ) : null}
    </form>
  );
}
