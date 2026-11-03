import Link from "next/link";
import { ForumArticleFormLoader } from "@/components/forum-article-form-loader";
import { SectionPage } from "@/components/section-page";
import { Arrow } from "@/components/ui";
import { getSessionAccount } from "@/lib/auth-role";
import { articlePath, getMyArticles, type CommentStatus } from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Skryf ’n artikel",
  description: "Skryf ’n artikel oor iets interessants uit die biologie. Mnr. Bio lees dit eers voordat dit op die forum verskyn.",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ gestuur?: string }>;
};

const crumbs = [
  { href: "/", label: "Tuis" },
  { href: "/comments", label: "Forum" },
  { href: "/comments/skryf", label: "Skryf ’n artikel" },
];

const statusText: Record<CommentStatus, string> = {
  pending: "Wag vir Mnr. Bio",
  approved: "Op die forum",
  rejected: "Nie geplaas nie",
};

const statusClass: Record<CommentStatus, string> = {
  pending: "border-sun/40 text-sun",
  approved: "border-lime/40 text-lime",
  rejected: "border-white/15 text-white/45",
};

export default async function WriteArticlePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const account = await getSessionAccount();
  const next = encodeURIComponent("/comments/skryf");

  if (!account) {
    return (
      <SectionPage
        eyebrow="Forum"
        title="Skryf ’n artikel"
        description="Het jy iets interessants oor die biologie gelees of uitgevind? Skryf daaroor vir die ander leerders. Mnr. Bio lees elke artikel eers voordat dit op die forum verskyn."
        crumbs={crumbs}
      >
        <div className="glass mx-auto grid max-w-2xl gap-5 rounded-[1.9rem] p-8 text-center">
          <h2 className="font-display text-2xl font-extrabold text-white">Teken eers in</h2>
          <p className="leading-7 text-white/65">
            Om ’n artikel te skryf en prente by te sit, het jy ’n gratis MnrBio-rekening nodig. So sien jy ook
            wanneer jou artikel op die forum is.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/rekening?next=${next}`} className="btn btn-lime">
              Teken in
              <Arrow />
            </Link>
            <Link href={`/rekening?mode=register&next=${next}`} className="btn btn-ghost">
              Skep ’n gratis rekening
            </Link>
          </div>
        </div>
      </SectionPage>
    );
  }

  const mine = await getMyArticles(account.userId);
  const sent = params.gestuur === "1";

  return (
    <SectionPage
      eyebrow="Forum"
      title="Skryf ’n artikel"
      description="Skryf soos in Word: opskrifte, lyste, tabelle en prente. Jy kan ook teks uit Word of Google Docs hier in plak. Mnr. Bio lees dit eers voordat dit op die forum verskyn."
      crumbs={crumbs}
    >
      <div className="mx-auto grid max-w-4xl gap-10">
        {sent ? (
          <div className="rounded-[1.5rem] border border-lime/30 bg-lime/10 px-6 py-5">
            <p className="font-display text-lg font-bold text-white">Dankie! Jou artikel is gestuur.</p>
            <p className="mt-1 text-sm leading-6 text-white/70">
              Mnr. Bio lees dit en plaas dit op die forum. Hier onder sien jy wanneer dit gebeur het.
            </p>
          </div>
        ) : null}

        <ForumArticleFormLoader defaultName={account.name.split(" ")[0] ?? ""} sent={sent} />

        {mine.length > 0 ? (
          <section className="grid gap-3">
            <h2 className="font-display text-xl font-bold text-white">Jou artikels</h2>
            <ul className="grid gap-2">
              {mine.map((article) => (
                <li key={article.id} className="glass flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-5 py-4">
                  <div className="min-w-0 flex-1">
                    {article.status === "approved" && article.slug ? (
                      <Link href={articlePath(article.slug)} className="font-bold text-white hover:text-lime">
                        {article.title}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">{article.title}</span>
                    )}
                    <p className="text-xs text-white/45">{formatRelativeAf(article.createdAt)}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass[article.status]}`}>
                    {statusText[article.status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SectionPage>
  );
}
