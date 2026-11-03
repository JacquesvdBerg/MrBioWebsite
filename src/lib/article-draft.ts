/** An unsent article kept in this browser, so a refresh or a failed send never loses it. */
export type ArticleDraft = {
  name: string;
  title: string;
  link: string;
  html: string;
  image: string;
};

export const emptyDraft: ArticleDraft = { name: "", title: "", link: "", html: "", image: "" };

export function readDraft(key: string): ArticleDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...emptyDraft, ...(JSON.parse(raw) as Partial<ArticleDraft>) } : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, draft: ArticleDraft) {
  try {
    if (draft.title || draft.html || draft.link) {
      window.localStorage.setItem(key, JSON.stringify(draft));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Private windows and full storage: the form still works, just without a draft.
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clear.
  }
}
