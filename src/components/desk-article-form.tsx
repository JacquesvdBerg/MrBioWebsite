"use client";

import { startTransition, useActionState, useState } from "react";
import { createArticle, updateArticle, type DeskArticleState } from "@/app/(admin)/admin/actions";
import { AdminBtn, AdminNotice, AdminPanel, deskField } from "@/components/admin-ui";
import { ArticleEditor } from "@/components/article-editor";
import { ImageUploadField } from "@/components/image-upload-field";
import { clearDraft, emptyDraft, readDraft, writeDraft, type ArticleDraft } from "@/lib/article-draft";

const draftKey = "mnrbio-lessenaar-artikel-konsep";

type DeskArticleFormProps = {
  /** An existing article to edit; leave out for a new one. */
  article?: {
    id: string;
    title: string;
    linkUrl: string | null;
    bodyHtml: string;
    imagePath: string | null;
    pending: boolean;
  };
};

/** Loaded in the browser only (a new article reads its saved draft), see DeskArticleFormLoader. */
export default function DeskArticleForm({ article }: DeskArticleFormProps) {
  const [state, dispatch, pending] = useActionState<DeskArticleState, FormData>(
    article ? updateArticle : createArticle,
    null,
  );
  const [draft, setDraft] = useState<ArticleDraft>(() =>
    article
      ? {
          ...emptyDraft,
          title: article.title,
          link: article.linkUrl ?? "",
          html: article.bodyHtml,
          image: article.imagePath ?? "",
        }
      : (readDraft(draftKey) ?? emptyDraft),
  );
  const [restored] = useState(() => !article && Boolean(draft.title || draft.html));
  const [problem, setProblem] = useState<string | null>(null);

  function update(change: Partial<ArticleDraft>) {
    setDraft((current) => {
      const next = { ...current, ...change };
      if (!article) {
        writeDraft(draftKey, next);
      }
      return next;
    });
  }

  const message = problem ?? state?.error ?? null;

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.title.trim()) {
          setProblem("Gee die artikel ’n titel.");
          return;
        }
        if (!draft.html) {
          setProblem("Die artikel is nog leeg.");
          return;
        }
        setProblem(null);
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const formData = new FormData(event.currentTarget, submitter);
        if (!article) {
          clearDraft(draftKey);
        }
        startTransition(() => dispatch(formData));
      }}
    >
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      {restored ? <AdminNotice tone="ok">Jou konsep van vroeër is teruggesit.</AdminNotice> : null}
      {message ? <AdminNotice tone="err">{message}</AdminNotice> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-w-0 content-start gap-4">
          <label className="desk-label">
            Titel
            <input
              className={`${deskField} text-base font-bold`}
              name="title"
              value={draft.title}
              maxLength={160}
              required
              placeholder="Bv. Wetenskaplikes lees die eerste volledige menslike genoom"
              onChange={(event) => update({ title: event.target.value })}
            />
          </label>
          <ArticleEditor
            uploads="desk"
            initialHtml={draft.html}
            placeholder="Skryf hier, of plak jou artikel uit Word. Opskrifte, lyste en tabelle kom saam."
            onChange={(html) => update({ html })}
          />
        </div>

        <div className="grid content-start gap-4">
          <AdminPanel title="Publiseer" icon="check">
            <div className="grid gap-3">
              {article?.pending ? (
                <>
                  <AdminBtn type="submit" icon="check" name="approve" value="1" disabled={pending}>
                    {pending ? "Stoor…" : "Stoor en keur goed"}
                  </AdminBtn>
                  <AdminBtn type="submit" tone="ghost" disabled={pending}>
                    Stoor sonder om goed te keur
                  </AdminBtn>
                </>
              ) : (
                <AdminBtn type="submit" icon="check" disabled={pending}>
                  {pending ? "Stoor…" : article ? "Stoor veranderinge" : "Publiseer artikel"}
                </AdminBtn>
              )}
              <p className="text-xs leading-5 text-white/50">
                {article
                  ? article.pending
                    ? "Die artikel wag nog. Dit gaan eers op die forum as jy dit goedkeur."
                    : "Veranderinge wys binne ’n minuut op die forum."
                  : "Jou artikel verskyn dadelik op die forum, met sy eie bladsy wat jy kan deel."}
              </p>
            </div>
          </AdminPanel>
          <AdminPanel title="Ekstra" icon="spark">
            <div className="grid gap-4">
              <ImageUploadField label="Voorbladfoto (opsioneel)" initialUrl={draft.image} />
              <p className="-mt-2 text-xs leading-5 text-white/45">
                Sonder een gebruik die forum die eerste prent in die artikel.
              </p>
              <label className="desk-label">
                Skakel na die bron (opsioneel)
                <input
                  className={deskField}
                  name="link_url"
                  type="url"
                  value={draft.link}
                  placeholder="https://"
                  onChange={(event) => update({ link: event.target.value })}
                />
              </label>
            </div>
          </AdminPanel>
        </div>
      </div>
    </form>
  );
}
