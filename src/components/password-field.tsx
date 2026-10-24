"use client";

import { useState } from "react";

export function PasswordField({
  name,
  id,
  autoComplete,
  required,
  minLength,
  variant = "dark",
}: {
  name: string;
  id?: string;
  autoComplete?: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  variant?: "dark" | "desk";
}) {
  const [visible, setVisible] = useState(false);
  const inputClass =
    variant === "desk"
      ? "password-field desk-field w-full rounded-xl border px-3 py-2.5 pr-12 text-sm outline-none"
      : "password-field input-dark w-full pr-12";

  return (
    <div className="relative mt-1.5">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        required={required}
        minLength={minLength}
        className={inputClass}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-2xl text-[var(--fg)] opacity-55 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        aria-label={visible ? "Versteek wagwoord" : "Wys wagwoord"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18.5 18.5 0 0 1-4.1 4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 6.8C3.5 8.6 2 12 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}
