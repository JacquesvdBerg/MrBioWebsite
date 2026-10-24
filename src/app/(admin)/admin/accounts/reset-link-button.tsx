"use client";

import { useState } from "react";
import { createPasswordResetLink, emailPasswordResetLink, generateLearnerPassword } from "@/app/(admin)/admin/actions";
import { CopyButton } from "@/components/admin-client";

export function GeneratePasswordButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    setPassword(null);
    const result = await generateLearnerPassword(email);
    if (result.status === "ok") {
      setPassword(result.password);
    } else {
      setError(result.message);
    }
    setPending(false);
  }

  return (
    <div className="space-y-2">
      <button type="button" className="desk-btn desk-btn-navy desk-btn-sm" disabled={pending} onClick={onClick}>
        {pending ? "Genereer…" : "Genereer wagwoord"}
      </button>
      {password ? (
        <div className="space-y-2">
          <input className="desk-field w-full rounded-xl border px-3 py-2 font-mono text-sm outline-none" readOnly value={password} />
          <CopyButton value={password} label="Kopieer wagwoord" />
          <p className="text-xs leading-5 text-white/55">Die wagwoord is gestoor. Stuur dit self vir hulle.</p>
        </div>
      ) : null}
      {error ? <p className="text-xs font-semibold text-orange">{error}</p> : null}
    </div>
  );
}

export function ResetLinkButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    setSent(false);
    setUrl(null);
    const result = await createPasswordResetLink(email);
    if (result.status === "ok") {
      setUrl(result.url);
    } else {
      setError(result.message);
    }
    setPending(false);
  }

  async function onSend() {
    if (!url) return;
    setSending(true);
    setError(null);
    const result = await emailPasswordResetLink(email, url);
    if (result.status === "ok") {
      setSent(true);
    } else {
      setError(result.message);
    }
    setSending(false);
  }

  return (
    <div className="max-w-xs space-y-2">
      <button type="button" className="desk-btn desk-btn-ghost desk-btn-sm" disabled={pending} onClick={onClick}>
        {pending ? "Maak skakel…" : "Stuur wagwoord-herstel"}
      </button>
      {url ? (
        <div className="space-y-2">
          <p className="text-xs leading-5 text-white/70">Die skakel is gereed. Stuur dit per e-pos, of kopieer dit.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="desk-btn desk-btn-navy desk-btn-sm" disabled={sending || sent} onClick={onSend}>
              {sent ? "E-pos gestuur" : sending ? "Stuur…" : "Stuur e-pos"}
            </button>
            <CopyButton value={url} label="Kopieer skakel" />
          </div>
          <p className="text-xs leading-5 text-white/55">
            Moenie die skakel self oopmaak nie. As jy dit oopmaak, teken jy in as hulle.
          </p>
        </div>
      ) : null}
      {error ? <p className="text-xs font-semibold text-orange">{error}</p> : null}
    </div>
  );
}
