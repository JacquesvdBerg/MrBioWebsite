"use client";

import { useState, type FormEvent } from "react";
import { subscribeNewsletter } from "@/app/(site)/actions";
import { Arrow } from "@/components/ui";

export function NewsletterForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFailed(false);
    setMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const result = await subscribeNewsletter({
      email: String(data.get("email") ?? ""),
      website: String(data.get("website") ?? ""),
    });

    if (result.ok) {
      form.reset();
      setMessage("Dankie. Jy is op die lys.");
    } else {
      setFailed(true);
      setMessage(result.message);
    }
    setPending(false);
  }

  return (
    <form className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto" onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Jou e-posadres"
        aria-label="E-posadres"
        autoComplete="email"
        required
        className="newsletter-input"
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <button type="submit" className="btn btn-lime" disabled={pending}>
        {pending ? "Wag…" : "Skryf in"}
        <Arrow className="h-4 w-4" />
      </button>
      {message ? (
        <p className={`w-full text-sm font-semibold ${failed ? "text-orange" : "text-lime"}`} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
