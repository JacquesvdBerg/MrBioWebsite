"use client";

import { startTransition, useActionState, useState } from "react";
import { submitArticle, type ArticleFormState } from "@/app/(site)/actions";
import { ArticleEditor } from "@/components/article-editor";
import { Arrow } from "@/components/ui";
import { clearDraft, emptyDraft, readDraft, writeDraft, type ArticleDraft } from "@/lib/article-draft";

const draftKey = "mnrbio-artikel-konsep";

/** Loaded in the browser only (it reads the saved draft), see ForumArticleFormLoader. */
export default function ForumArticleForm({ defaultName, sent }: { defaultName: string; sent: boolean }) {
  const [state, dispatch, pending] = useActionState<ArticleFormState, FormData>(submitArticle, null);
  const [draft, setDraft] = useState<ArticleDraft>(() => {
    if (sent) {
      clearDraft(draftKey);
      return { ...emptyDraft, name: defaultName };
    }
    return readDraft(draftKey) ?? { ...emptyDraft, name: defaultName };
  });
  const [restored] = useState(() => !sent && Boolean(draft.title || draft.html));
  const [problem, setProblem] = useState<string | null>(null);

  function update(change: Partial<ArticleDraft>) {
    setDraft((current) => {
      const next = { ...current, ...change };
      writeDraft(draftKey, next);
      return next;
    });
  }

  const message = problem ?? state?.error ?? null;

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.title.trim()) {
          setProblem("Gee jou artikel ’n titel.");
          return;
        }
        if (!draft.html) {
          setProblem("Skryf iets in die artikel voor jy dit stuur.");
          return;
        }
        setProblem(null);
        const formData = new FormData(event.currentTarget);
        startTransition(() => dispatch(formData));
      }}
    >
      {restored ? (
        <p className="rounded-2xl border border-lime/25 bg-lime/8 px-4 py-3 text-sm text-white/75">
          Ons het jou konsep van vroeër teruggesit. Jy kan aangaan waar jy opgehou het.
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
        <label className="grid gap-2 text-sm font-bold text-white">
          Titel
          <input
            className="input-dark text-base font-semibold"
            name="title"
            value={draft.title}
            maxLength={160}
            required
            placeholder="Bv. Hoe bome deur swamme met mekaar praat"
            onChange={(event) => update({ title: event.target.value })}
          />
        </label>
        <label className="grid content-start gap-2 text-sm font-bold text-white">
          Jou naam op die artikel
          <input
            className="input-dark"
            name="name"
            value={draft.name}
            maxLength={80}
            placeholder="Net ’n voornaam"
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>
      </div>

      <ArticleEditor uploads="forum" initialHtml={draft.html} onChange={(html) => update({ html })} />

      <label className="grid gap-2 text-sm font-bold text-white">
        <span className="flex items-baseline justify-between gap-2">
          Skakel na die bron
          <span className="text-xs font-semibold text-white/40">Opsioneel, as jy dit êrens gelees het</span>
        </span>
        <input
          className="input-dark"
          name="link_url"
          type="url"
          value={draft.link}
          placeholder="https://"
          onChange={(event) => update({ link: event.target.value })}
        />
      </label>

      {message ? (
        <p className="text-sm font-semibold text-orange" role="alert">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-lime" disabled={pending}>
          {pending ? "Stuur…" : "Stuur vir goedkeuring"}
          <Arrow />
        </button>
        <p className="text-sm text-white/50">Mnr. Bio lees dit eers. Jy sien hier onder wanneer dit op die forum is.</p>
      </div>
    </form>
  );
}
