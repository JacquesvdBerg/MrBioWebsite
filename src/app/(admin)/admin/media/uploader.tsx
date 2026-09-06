"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { uploadImageToStorage } from "@/lib/upload-image";

export function MediaUploader() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      setError("Kies eers 'n lêer.");
      setPending(false);
      return;
    }

    try {
      await uploadImageToStorage(file);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kon nie oplaai nie.");
      setPending(false);
      return;
    }

    form.reset();
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="desk-label">
        Kies ’n prent
        <input
          className="mt-2 block w-full text-sm font-normal"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required
        />
      </label>
      {error ? <p className="mt-3 text-sm text-orange">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="desk-btn desk-btn-navy mt-4 disabled:opacity-60"
      >
        {pending ? "Laai op…" : "Laai op"}
      </button>
    </form>
  );
}
