"use client";

import { useMemo, useState } from "react";
import { deleteNewsletterSubscriber } from "@/app/(admin)/admin/actions";
import { CopyButton, DeleteButton } from "@/components/admin-client";
import { deskField } from "@/components/admin-ui";
import { formatRelativeAf } from "@/lib/dates";

type NewsletterSubscriber = {
  id: string;
  email: string;
  createdAt: string;
};

const mailLimit = 1800;

function mailtoFor(emails: string[], subject: string, body: string) {
  const parts = [`bcc=${emails.map(encodeURIComponent).join(";")}`];
  if (subject.trim()) {
    parts.push(`subject=${encodeURIComponent(subject.trim())}`);
  }
  if (body.trim()) {
    parts.push(`body=${encodeURIComponent(body.trim())}`);
  }
  return `mailto:?${parts.join("&")}`;
}

function mailBatches(emails: string[], subject: string, body: string) {
  const batches: string[][] = [];
  let current: string[] = [];
  let length = mailtoFor([], subject, body).length;

  for (const email of emails) {
    const extra = encodeURIComponent(email).length + 1;
    if (current.length > 0 && length + extra > mailLimit) {
      batches.push(current);
      current = [];
      length = mailtoFor([], subject, body).length;
    }
    current.push(email);
    length += extra;
  }
  if (current.length > 0) {
    batches.push(current);
  }
  return batches;
}

export function NewsletterDesk({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState<string[]>([]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return subscribers;
    return subscribers.filter((item) => item.email.includes(needle));
  }, [query, subscribers]);

  const visibleIds = visible.map((item) => item.id);
  const allVisiblePicked = visibleIds.length > 0 && visibleIds.every((id) => picked.includes(id));
  const selected = subscribers.filter((item) => picked.includes(item.id));

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleVisible() {
    setPicked((current) => {
      if (allVisiblePicked) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...current, ...visibleIds])];
    });
  }

  async function copyEmails(emails: string[]) {
    const text = emails.join("; ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setNotice(`${emails.length} adres${emails.length === 1 ? "" : "se"} gekopieer. Plak dit in BCC.`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Kopieer die adresse:", text);
    }
  }

  function send(emails: string[]) {
    if (emails.length === 0) {
      setNotice("Kies eers iemand, of stuur aan almal.");
      return;
    }
    const batches = mailBatches(emails, subject, body);
    const first = batches[0] ?? [];
    const rest = batches.slice(1).flat();
    window.location.href = mailtoFor(first, subject, body);
    setRemaining(rest);
    setNotice(
      rest.length > 0
        ? `Die eerste ${first.length} adresse maak in jou e-posprogram oop. ${rest.length} is te veel vir een brief.`
        : "Jou e-posprogram maak oop. Almal sit in BCC.",
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 p-5">
        <p className="font-display text-lg font-bold text-white">Skryf ’n brief</p>
        <p className="mt-1 text-sm leading-6 text-white/55">
          Die brief maak in Outlook of jou gewone e-posprogram oop. Adresse sit in BCC, so niemand sien die ander nie.
        </p>
        <div className="mt-4 grid gap-3">
          <label className="desk-label">
            Onderwerp
            <input className={deskField} value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <label className="desk-label">
            Boodskap
            <textarea
              className={`${deskField} min-h-28`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="desk-btn desk-btn-navy desk-btn-sm" onClick={() => send(subscribers.map((item) => item.email))}>
            Stuur aan almal
          </button>
          <button
            type="button"
            className="desk-btn desk-btn-ghost desk-btn-sm"
            disabled={selected.length === 0}
            onClick={() => send(selected.map((item) => item.email))}
          >
            Stuur aan gekose ({selected.length})
          </button>
          <button type="button" className="desk-btn desk-btn-ghost desk-btn-sm" onClick={() => copyEmails(subscribers.map((item) => item.email))}>
            {copied ? "Gekopieer" : "Kopieer almal"}
          </button>
          <button
            type="button"
            className="desk-btn desk-btn-ghost desk-btn-sm"
            disabled={selected.length === 0}
            onClick={() => copyEmails(selected.map((item) => item.email))}
          >
            Kopieer gekose
          </button>
        </div>
        {notice ? <p className="mt-3 text-sm text-lime">{notice}</p> : null}
        {remaining.length > 0 ? (
          <button type="button" className="desk-btn desk-btn-ghost desk-btn-sm mt-3" onClick={() => send(remaining)}>
            Stuur die res ({remaining.length})
          </button>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="desk-check">
          <input type="checkbox" checked={allVisiblePicked} onChange={toggleVisible} />
          Kies sigbare
        </label>
        <input
          className={`${deskField} mt-0 max-w-xs`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Soek ’n adres"
          aria-label="Soek ’n adres"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-white/45">Geen adresse nie.</p>
      ) : (
        <ul>
          {visible.map((subscriber) => (
            <li key={subscriber.id} className="desk-row">
              <label className="desk-check min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={picked.includes(subscriber.id)}
                  onChange={() => toggle(subscriber.id)}
                />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-white">{subscriber.email}</span>
                  <span className="block text-xs text-white/40">{formatRelativeAf(subscriber.createdAt)}</span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <CopyButton value={subscriber.email} label="Kopieer" />
                <button
                  type="button"
                  className="desk-btn desk-btn-ghost desk-btn-sm"
                  onClick={() => send([subscriber.email])}
                >
                  Stuur
                </button>
                <form action={deleteNewsletterSubscriber}>
                  <input type="hidden" name="id" value={subscriber.id} />
                  <DeleteButton label="" confirm={`Verwyder ${subscriber.email} van die lys?`} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
