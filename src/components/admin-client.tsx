"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin-icon";

/** Submit button for a delete form that asks first. Nothing can be undone. */
export function DeleteButton({
  label = "Verwyder",
  confirm = "Is jy seker? Dit kan nie ontdoen word nie.",
}: {
  label?: string;
  confirm?: string;
}) {
  return (
    <button
      type="submit"
      className="desk-btn desk-btn-danger"
      aria-label={label || "Verwyder"}
      title={label ? undefined : "Verwyder"}
      onClick={(event) => {
        if (!window.confirm(confirm)) {
          event.preventDefault();
        }
      }}
    >
      <AdminIcon name="trash" className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function CopyButton({ value, label = "Kopieer URL" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="desk-btn desk-btn-ghost desk-btn-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          window.prompt("Kopieer die URL:", value);
        }
      }}
    >
      <AdminIcon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? "Gekopieer" : label}
    </button>
  );
}
