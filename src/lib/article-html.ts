import "server-only";
import sanitizeHtml from "sanitize-html";

/** Images in a visitor's article must come from our own storage. */
const storageHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const alignment = [/^(left|center|right|justify)$/];
const size = [/^\d{1,4}(\.\d+)?(px|%)$/];

/** A public picture in our own Supabase storage (also what next/image may load). */
export function isStorageImage(src: string | null | undefined) {
  try {
    const url = new URL(src ?? "");
    return (
      url.protocol === "https:" && url.hostname === storageHost && url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function isAllowedImage(src: string | undefined, trusted: boolean) {
  return trusted ? /^https:\/\//i.test(src ?? "") : isStorageImage(src);
}

/**
 * Keeps only what the editor can make: headings, lists, tables, links and
 * images, plus text alignment. Everything else (scripts, fonts, colours, Word
 * leftovers) goes. Runs on save and again before showing, so a row written
 * past the site still cannot carry anything harmful.
 */
export function cleanArticleHtml(html: string, { trusted }: { trusted: boolean }) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "hr",
      "table", "colgroup", "col", "thead", "tbody", "tr", "th", "td", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      ol: ["start"],
      table: ["style"],
      col: ["style"],
      th: ["colspan", "rowspan", "colwidth", "style"],
      td: ["colspan", "rowspan", "colwidth", "style"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
    },
    allowedStyles: {
      "*": { "text-align": alignment },
      table: { width: size, "min-width": size },
      col: { width: size, "min-width": size },
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      h1: "h2",
      h5: "h4",
      h6: "h4",
      b: "strong",
      i: "em",
      strike: "s",
      del: "s",
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...(attribs.href ? { href: attribs.href } : {}),
          target: "_blank",
          rel: trusted ? "noopener noreferrer" : "nofollow ugc noopener noreferrer",
        },
      }),
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !isAllowedImage(frame.attribs.src, trusted),
  });
}

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** Plain text of an article, for excerpts, search and the notification email. */
export function articleTextFromHtml(html: string) {
  const spaced = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|blockquote|tr)>/gi, "$&\n\n")
    .replace(/<\/t[dh]>/gi, "$& ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => entities[name])
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The first picture in an article, used as its cover when it has none. */
export function firstImageSrc(html: string | null) {
  return html?.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? null;
}

/** The picture on an article's card: its cover photo, otherwise the first picture in the text. */
export function articleCover(article: { imagePath: string | null; bodyHtml: string | null }) {
  if (isStorageImage(article.imagePath)) {
    return article.imagePath;
  }
  const first = firstImageSrc(article.bodyHtml);
  return isStorageImage(first) ? first : null;
}

/** Wide tables scroll sideways on a phone instead of stretching the page. */
export function wrapArticleTables(html: string) {
  return html.replace(/<table/g, '<div class="article-table"><table').replace(/<\/table>/g, "</table></div>");
}
