import Image from "next/image";
import Link from "next/link";
import { submitComment } from "@/app/(site)/actions";
import { Field, FormNote, Select, TextArea, TextInput } from "@/components/field";
import { GradeOptions } from "@/components/grade-options";
import { Reveal } from "@/components/reveal";
import { SectionPage } from "@/components/section-page";
import { TeacherReplyBox, TeacherReplyProvider } from "@/components/teacher-reply";
import { Arrow, SectionHeading } from "@/components/ui";
import { articleCover } from "@/lib/article-html";
import {
  articleExcerpt,
  articlePath,
  commentAccent,
  commentAuthorLine,
  commentKinds,
  getApprovedComments,
  isArticle,
  linkHost,
  threadComments,
} from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";

export const metadata = {
  title: "Forum",
  description:
    "Lees die nuutste uit die biologie, deel ’n interessante artikel, stel onderwerpe voor en lees wat ander MnrBio-leerders vra.",
};

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ gestuur?: string; fout?: string }>;
};

export default async function CommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const threads = threadComments(await getApprovedComments());
  const articles = threads.filter((thread) => isArticle(thread));
  const comments = threads.filter((thread) => !isArticle(thread));
  const trending = [...commentKinds]
    .map((kind) => ({
      kind,
      count: comments.filter((comment) => comment.kind === kind).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <SectionPage
      eyebrow="Forum"
      title={
        <>
          Sê wat jy <span className="gradient-text">volgende wil leer.</span>
        </>
      }
      description="Lees die nuutste uit die biologie, skryf self ’n artikel, stel ’n onderwerp voor of vra ’n vraag. Alles word eers deur die onderwyser gekeur voordat dit hier verskyn."
      crumbs={[
        { href: "/", label: "Tuis" },
        { href: "/comments", label: "Forum" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="grid min-w-0 content-start gap-12">
        {articles.length > 0 ? (
          <section id="artikels" className="scroll-mt-28">
            <SectionHeading eyebrow="Uit die biologie" title="Artikels" />
            <div className="grid gap-4">
              {articles.map((article, index) => {
                const cover = articleCover(article);
                return (
                  <Reveal key={article.id} delay={index * 60}>
                    <article className="glass grid gap-5 overflow-hidden rounded-[1.75rem] p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
                      {cover ? (
                        <Link href={articlePath(article.slug!)} className="relative block aspect-video overflow-hidden rounded-2xl sm:aspect-square">
                          <Image src={cover} alt="" fill sizes="(max-width: 640px) 100vw, 180px" className="object-cover" />
                        </Link>
                      ) : null}
                      <div className={`min-w-0 ${cover ? "" : "sm:col-span-2"}`}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className="font-bold text-white">
                            {article.authorRole === "teacher" ? article.authorName : commentAuthorLine(article)}
                          </span>
                          {article.authorRole === "teacher" ? (
                            <span className="chip !py-0.5 !text-[11px]">Onderwyser</span>
                          ) : null}
                          <span className="text-white/40">{formatRelativeAf(article.createdAt)}</span>
                        </div>
                        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white">
                          <Link href={articlePath(article.slug!)} className="hover:text-lime">
                            {article.title}
                          </Link>
                        </h3>
                        {article.body ? (
                          <p className="mt-2 leading-7 text-white/65">{articleExcerpt(article.body)}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <Link href={articlePath(article.slug!)} className="inline-flex items-center gap-1.5 font-bold text-lime">
                            Lees meer
                            <Arrow className="h-3.5 w-3.5" />
                          </Link>
                          {article.linkUrl ? <span className="text-white/45">Bron: {linkHost(article.linkUrl)}</span> : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeading
            eyebrow="Goedgekeur"
            title="Onlangse plasings"
          />
          {comments.length === 0 ? (
            <div className="glass rounded-[1.75rem] px-6 py-10 text-center">
              <p className="font-display text-xl font-bold text-white">Nog geen goedgekeurde plasings nie</p>
              <p className="mt-2 text-sm text-white/55">
                Stuur die eerste een. Dit verskyn hier ná keuring.
              </p>
            </div>
          ) : (
            <TeacherReplyProvider>
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <Reveal key={comment.id} delay={index * 60}>
                    <article className="glass rounded-[1.75rem] p-6 transition-colors hover:border-white/25">
                      <div className="flex items-start gap-4">
                        <span
                          className="cell h-11 w-11 shrink-0"
                          style={{
                            ["--cell-a" as string]: commentAccent(comment.kind),
                            ["--cell-b" as string]: "#10203a",
                            ["--cell-glow" as string]: "transparent",
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <span className="font-bold text-white">{commentAuthorLine(comment)}</span>
                            <span className="chip !py-0.5 !text-[11px]">{comment.kind}</span>
                            <span className="text-white/40">{formatRelativeAf(comment.createdAt)}</span>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap leading-7 text-white/75">{comment.body}</p>
                          {comment.replies.length > 0 ? (
                            <ul className="mt-4 space-y-4 border-t border-white/10 pt-4">
                              {comment.replies.map((reply) => (
                                <li key={reply.id} className="border-l-2 border-lime/40 pl-4">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    <span className="font-bold text-white">
                                      {reply.authorRole === "teacher" ? reply.authorName : commentAuthorLine(reply)}
                                    </span>
                                    <span className="chip !py-0.5 !text-[11px]">
                                      {reply.authorRole === "teacher" ? "Onderwyser" : reply.kind}
                                    </span>
                                    <span className="text-white/40">{formatRelativeAf(reply.createdAt)}</span>
                                  </div>
                                  <p className="mt-2 whitespace-pre-wrap leading-7 text-white/75">{reply.body}</p>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <TeacherReplyBox parentId={comment.id} />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </TeacherReplyProvider>
          )}
        </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <form action={submitComment} className="glass space-y-5 rounded-[1.9rem] p-6 md:p-7">
              <div>
                <p className="eyebrow">Plaas iets</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">
                  Nuwe plasing
                </h2>
              </div>
              {params.gestuur === "1" ? (
                <p className="text-sm text-lime">Dankie. Jou plasing wag op keuring.</p>
              ) : null}
              {params.fout === "leeg" ? (
                <p className="text-sm text-orange">Sit ’n naam en boodskap in.</p>
              ) : null}
              {params.fout === "stoor" ? (
                <p className="text-sm text-orange">Kon nie stoor nie. Probeer weer.</p>
              ) : null}
              {params.fout === "antwoord" ? (
                <p className="text-sm text-orange">Sit ’n antwoord in.</p>
              ) : null}
              <Field label="Naam" hint="Of skuilnaam">
                <TextInput name="name" placeholder="Jou naam" disabled={false} required />
              </Field>
              <Field label="Tipe">
                <Select name="type" options={commentKinds} disabled={false} />
              </Field>
              <Field label="Graad" hint="Opsioneel. Ander is vir ’n ouer of onderwyser.">
                <select className="input-dark" name="grade" defaultValue="">
                  <GradeOptions emptyLabel="Geen" />
                </select>
              </Field>
              <Field label="Boodskap">
                <TextArea
                  name="message"
                  placeholder="Kan Mnr. asseblief ’n video oor die hormoonstelsel maak?"
                  disabled={false}
                  required
                />
              </Field>
              <button type="submit" className="btn btn-lime w-full">
                Stuur vir goedkeuring
                <Arrow />
              </button>
              <FormNote>
                Plasings word gekeur voordat dit publiek verskyn. Geen toetsantwoorde nie.
              </FormNote>
            </form>
          </Reveal>

          <Reveal delay={60}>
            <div id="skryf" className="glass scroll-mt-28 space-y-4 rounded-[1.9rem] p-6 md:p-7">
              <div>
                <p className="eyebrow">Iets interessant gelees?</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-white">Skryf ’n artikel</h2>
              </div>
              <p className="text-sm leading-6 text-white/65">
                Skryf soos in Word, met opskrifte, tabelle en prente, of plak jou teks sommer in. Mnr. Bio lees dit
                eers voordat dit op die forum verskyn.
              </p>
              <Link href="/comments/skryf" className="btn btn-lime w-full">
                Begin skryf
                <Arrow />
              </Link>
            </div>
          </Reveal>

          {trending.length > 0 ? (
            <Reveal delay={80}>
              <div className="glass rounded-[1.9rem] p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">
                  Gewild hierdie week
                </p>
                <ol className="mt-4 space-y-3">
                  {trending.map((item, index) => (
                    <li key={item.kind} className="flex items-center gap-3 text-sm text-white/75">
                      <span className="font-display text-lg font-extrabold text-white/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.kind}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={140}>
            <div className="rounded-[1.9rem] border border-lime/25 bg-lime/8 p-6">
              <p className="font-display text-lg font-bold text-white">Forumreëls</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
                <li>Wees vriendelik. Ons is almal hier om te leer.</li>
                <li>Geen persoonlike inligting nie, net ’n voornaam.</li>
                <li>Vrae oor die werk is welkom. Toetsantwoorde word nie gedeel nie.</li>
              </ul>
            </div>
          </Reveal>
        </aside>
      </div>
    </SectionPage>
  );
}
