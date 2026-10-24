"use client";

import { useState } from "react";
import { createPasswordResetLink } from "@/app/(admin)/admin/actions";
import { CopyButton } from "@/components/admin-client";

export function ResetLinkButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await createPasswordResetLink(email);
    if (result.status === "ok") {
      setUrl(result.url);
    } else {
      setUrl(null);
      setError(result.message);
    }
    setPending(false);
  }

  return (
    <div className="space-y-2">
      <button type="button" className="desk-btn desk-btn-ghost desk-btn-sm" disabled={pending} onClick={onClick}>
        {pending ? "Maak skakel…" : "Maak ’n skakel"}
      </button>
      {url ? (
        <div className="space-y-2">
          <input className="desk-field w-full rounded-xl border px-3 py-2 text-xs outline-none" readOnly value={url} />
          <CopyButton value={url} label="Kopieer skakel" />
          <p className="text-xs leading-5 text-white/55">
            Stuur die skakel vir die persoon. Moenie dit self oopmaak nie. As jy dit oopmaak, teken jy in as hulle.
          </p>
        </div>
      ) : null}
      {error ? <p className="text-xs font-semibold text-orange">{error}</p> : null}
    </div>
  );
}
