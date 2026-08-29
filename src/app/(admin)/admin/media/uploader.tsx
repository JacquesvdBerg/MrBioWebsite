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
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-line bg-white p-5"
    >
      <label className="block text-sm font-bold text-navy">
        Laai ’n prent op
        <input
          className="mt-2 block w-full text-sm"
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
        className="mt-4 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Laai op…" : "Laai op"}
      </button>
    </form>
  );
}
