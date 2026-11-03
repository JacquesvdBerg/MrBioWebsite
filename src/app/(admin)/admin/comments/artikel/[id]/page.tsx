import { notFound } from "next/navigation";
import { setCommentStatus } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn, AdminNotice } from "@/components/admin-ui";
import { DeskArticleFormLoader } from "@/components/desk-article-form-loader";
import { cleanArticleHtml } from "@/lib/article-html";
import {
  articlePath,
  commentAuthorLine,
  commentStatusLabel,
  commentStatusTone,
  getDeskArticle,
} from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gestoor?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await getDeskArticle(id);
  return { title: article?.title ? `Wysig ${article.title}` : "Artikel" };
}

/** Older articles have plain text only; give the editor paragraphs to start from. */
function plainToHtml(text: string) {
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escape(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export default async function EditArticlePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const article = await getDeskArticle(id);

  if (!article?.title) {
    notFound();
  }

  const teacher = article.authorRole === "teacher";
  const bodyHtml = article.bodyHtml
    ? cleanArticleHtml(article.bodyHtml, { trusted: teacher })
    : plainToHtml(article.body);

  return (
    <AdminPage
      title={article.title}
      description={
        teacher
          ? "Jou artikel. Verander wat jy wil en stoor."
          : `Gestuur deur ${commentAuthorLine(article)}. Lees dit deur, maak klein foute reg as jy wil, en keur dit goed of af.`
      }
      back={{ href: "/admin/comments", label: "Kommentaar" }}
      meta={
        <>
          <AdminBadge tone={commentStatusTone(article.status)}>{commentStatusLabel(article.status)}</AdminBadge>
          <span className="text-sm text-white/50">{formatRelativeAf(article.createdAt)}</span>
        </>
      }
      actions={
        <>
          {article.status === "approved" && article.slug ? (
            <AdminBtn href={articlePath(article.slug)} tone="ghost" icon="external" external>
              Bekyk op die forum
            </AdminBtn>
          ) : null}
          {article.status !== "rejected" && !teacher ? (
            <form action={setCommentStatus}>
              <input type="hidden" name="id" value={article.id} />
              <input type="hidden" name="status" value="rejected" />
              <input type="hidden" name="next" value="/admin/comments?status=rejected" />
              <AdminBtn type="submit" tone="ghost">
                Keur af
              </AdminBtn>
            </form>
          ) : null}
        </>
      }
    >
      {query.gestoor === "1" ? <AdminNotice tone="ok">Die artikel is gestoor.</AdminNotice> : null}
      <DeskArticleFormLoader
        article={{
          id: article.id,
          title: article.title,
          linkUrl: article.linkUrl,
          bodyHtml,
          imagePath: article.imagePath,
          pending: article.status !== "approved",
        }}
      />
    </AdminPage>
  );
}
