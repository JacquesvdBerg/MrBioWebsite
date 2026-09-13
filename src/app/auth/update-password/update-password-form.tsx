"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deskField } from "@/components/admin-ui";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    try {
      if (password.length < 8) {
        throw new Error("Wagwoord moet minstens 8 karakters wees.");
      }

      if (password !== confirm) {
        throw new Error("Die twee wagwoorde is nie dieselfde nie.");
      }

      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      const { data: claimsData } = await supabase.auth.getClaims();
      const meta = claimsData?.claims?.app_metadata as { role?: string } | undefined;
      router.replace(meta?.role === "admin" ? "/admin" : "/live-chat");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie die wagwoord stoor nie.");
      setPending(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-[13px] font-bold text-white">Nuwe wagwoord</span>
        <input
          className={deskField}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="block">
        <span className="text-[13px] font-bold text-white">Bevestig wagwoord</span>
        <input
          className={deskField}
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      {error ? <p className="text-sm text-orange">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="desk-btn desk-btn-navy w-full disabled:opacity-60"
      >
        {pending ? "Wag…" : "Stoor wagwoord"}
      </button>
    </form>
  );
}
