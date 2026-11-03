import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionPage } from "@/components/section-page";
import { TeacherReplyBox, TeacherReplyProvider } from "@/components/teacher-reply";
import { Arrow } from "@/components/ui";
import { articleExcerpt, articlePath, getApprovedArticle, linkHost } from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";
import { siteName, siteUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getApprovedArticle(slug);

  if (!article?.title) {
    return { title: "Artikel" };
  }

  return {
    title: article.title,
    description: articleExcerpt(article.body || article.title, 155),
    alternates: { canonical: articlePath(slug) },
    openGraph: {
      type: "article",
      title: article.title,
      url: articlePath(slug),
      images: article.imagePath ? [article.imagePath] : undefined,
    },
    twitter: {
      card: article.imagePath ? "summary_large_image" : "summary",
      title: article.title,
      description: articleExcerpt(article.body || article.title, 155),
      images: article.imagePath ? [article.imagePath] : undefined,
    },
  };
}

const urlPattern = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g;

/** Paragraphs from blank lines, with web addresses turned into links. */
function ArticleText({ text, trusted }: { text: string; trusted: boolean }) {
  const rel = trusted ? "noopener noreferrer" : "nofollow ugc noopener noreferrer";

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="whitespace-pre-line leading-8 text-white/80">
        {paragraph.split(urlPattern).map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <a key={partIndex} href={part} target="_blank" rel={rel} className="font-semibold text-lime underline">
              {linkHost(part)}
            </a>
          ) : (
            part
          ),
        )}
      </p>
    ));
}

function longDate(value: string) {
  return new Intl.DateTimeFormat("af-ZA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getApprovedArticle(slug);

  if (!article?.title) {
    notFound();
  }

  const teacher = article.authorRole === "teacher";
  const byline = teacher ? `Deur ${article.authorName}, die onderwyser` : `Gedeel deur ${article.authorName}`;
  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.createdAt,
    inLanguage: "af",
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@type": "Organization", name: siteName, url: siteUrl },
    mainEntityOfPage: new URL(articlePath(slug), siteUrl).toString(),
    ...(article.imagePath ? { image: [article.imagePath] } : {}),
  };

  return (
    <SectionPage
      eyebrow="Artikel"
      title={article.title}
      description={`${byline}, ${longDate(article.createdAt)}.`}
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/comments", label: "Forum" },
        { href: articlePath(slug), label: "Artikel" },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      <article className="mx-auto grid max-w-3xl gap-6">
        {article.imagePath ? (
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem]">
            <Image
              src={article.imagePath}
              alt=""
              fill
              sizes="(max-width: 800px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        {article.body ? (
          <div className="glass grid gap-5 rounded-[1.75rem] p-6 md:p-8">
            <ArticleText text={article.body} trusted={teacher} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {article.linkUrl ? (
            <a
              href={article.linkUrl}
              target="_blank"
              rel={teacher ? "noopener noreferrer" : "nofollow ugc noopener noreferrer"}
              className="btn btn-lime"
            >
              Lees die bron op {linkHost(article.linkUrl)}
              <Arrow />
            </a>
          ) : null}
          <Link href="/comments" className="btn btn-ghost">
            Terug na die forum
          </Link>
        </div>

        {article.replies.length > 0 ? (
          <section className="grid gap-4">
            <h2 className="font-display text-xl font-bold text-white">Antwoorde</h2>
            <ul className="grid gap-4">
              {article.replies.map((reply) => (
                <li key={reply.id} className="border-l-2 border-lime/40 pl-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-bold text-white">{reply.authorName}</span>
                    {reply.authorRole === "teacher" ? (
                      <span className="chip !py-0.5 !text-[11px]">Onderwyser</span>
                    ) : null}
                    <span className="text-white/40">{formatRelativeAf(reply.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap leading-7 text-white/75">{reply.body}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <TeacherReplyProvider>
          <TeacherReplyBox parentId={article.id} />
        </TeacherReplyProvider>
      </article>
    </SectionPage>
  );
}
