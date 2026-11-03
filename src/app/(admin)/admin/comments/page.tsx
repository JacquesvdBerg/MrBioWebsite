import Link from "next/link";
import {
  createArticle,
  deleteComment,
  replyToComment,
  setCommentStatus,
  updateArticle,
} from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin-client";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminNotice,
  AdminPanel,
  AdminTabs,
  deskField,
  initialsOf,
} from "@/components/admin-ui";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  articleKind,
  articlePath,
  commentAuthorLine,
  commentStatusLabel,
  commentStatusTone,
  getAllComments,
  linkHost,
  threadComments,
  toCommentStatus,
  type CommentStatus,
  type ThreadedComment,
} from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";

export const metadata = {
  title: "Kommentaar",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string; fout?: string; artikel?: string }>;
};

function threadOnTab(comment: ThreadedComment, filter: CommentStatus) {
  return comment.status === filter || comment.replies.some((reply) => reply.status === filter);
}

const statuses = ["pending", "approved", "rejected"] as const satisfies readonly CommentStatus[];

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const comments = threadComments(await getAllComments());
  const filter: CommentStatus = params.status ? toCommentStatus(params.status) : "pending";
  const visible = comments.filter((item) => threadOnTab(item, filter));

  const tabs = statuses.map((status) => ({
    href: status === "pending" ? "/admin/comments" : `/admin/comments?status=${status}`,
    label: commentStatusLabel(status),
    active: filter === status,
    count: comments.filter((item) => threadOnTab(item, status)).length,
  }));

  return (
    <AdminPage
      title="Kommentaar"
      description="Jy besluit wat publiek is. Nuwe kommentaar en gedeelde artikels wag hier tot jy dit goedkeur. Jou eie artikels verskyn dadelik op die forum."
    >
      {params.artikel === "1" ? (
        <AdminNotice tone="ok">Die artikel is op die forum gepubliseer.</AdminNotice>
      ) : null}
      {params.fout === "antwoord" ? <AdminNotice tone="err">Sit ’n antwoord in.</AdminNotice> : null}
      {params.fout === "artikel" ? <AdminNotice tone="err">’n Artikel het ’n titel en teks nodig.</AdminNotice> : null}
      {params.fout === "skakel" ? (
        <AdminNotice tone="err">Die skakel na die bron moet met https:// begin.</AdminNotice>
      ) : null}
      {params.fout === "databasis" ? (
        <AdminNotice tone="err">
          Die databasis is nog nie gereed vir artikels nie. Vra die ontwikkelaar om die forum-artikels-migrasie te laat loop.
        </AdminNotice>
      ) : null}
      {params.fout === "stoor" ? (
        <AdminNotice tone="err">Kon nie stoor nie. Probeer weer.</AdminNotice>
      ) : null}

      <section id="nuwe-artikel" className="mb-6 scroll-mt-24">
        <AdminPanel title="Nuwe artikel" icon="plus">
          <form action={createArticle} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-4">
              <label className="desk-label" htmlFor="article-title">
                Titel
                <input
                  id="article-title"
                  className={deskField}
                  name="title"
                  required
                  maxLength={160}
                  placeholder="Bv. Wetenskaplikes lees die eerste volledige menslike genoom"
                />
              </label>
              <label className="desk-label" htmlFor="article-body">
                Teks
                <textarea
                  id="article-body"
                  className={`${deskField} min-h-48`}
                  name="body"
                  required
                  placeholder="Vertel kortliks wat gebeur het en hoekom dit vir Lewenswetenskappe saak maak. Laat ’n leë reël tussen paragrawe."
                />
              </label>
              <label className="desk-label" htmlFor="article-link">
                Skakel na die bron (opsioneel)
                <input id="article-link" className={deskField} name="link_url" type="url" placeholder="https://" />
              </label>
            </div>
            <div className="grid content-start gap-4">
              <ImageUploadField label="Foto (opsioneel)" />
              <p className="text-xs leading-5 text-white/45">
                Jou artikel verskyn dadelik op die forum, met sy eie bladsy wat jy kan deel.
              </p>
              <div>
                <AdminBtn type="submit" icon="check">
                  Publiseer artikel
                </AdminBtn>
              </div>
            </div>
          </form>
        </AdminPanel>
      </section>
      <AdminPanel title="Moderering" icon="comment" action={<AdminTabs tabs={tabs} />}>
        {visible.length === 0 ? (
          <AdminEmpty
            icon={filter === "pending" ? "check" : "comment"}
            title={filter === "pending" ? "Die waglys is skoon" : "Niks in hierdie lys nie"}
            body="Nuwe kommentaar verskyn eers hier. Leerders sien niks tot jy Goedkeur druk."
          />
        ) : (
          <ul>
            {visible.map((comment) => (
              <li key={comment.id} className="desk-row items-start">
                <div className="flex min-w-0 flex-1 gap-3.5">
                  <span className="desk-avatar is-violet">{initialsOf(comment.authorName || "?")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{commentAuthorLine(comment)}</p>
                      <AdminBadge>{comment.kind}</AdminBadge>
                      <AdminBadge tone={commentStatusTone(comment.status)}>
                        {commentStatusLabel(comment.status)}
                      </AdminBadge>
                      <span className="text-xs text-white/45">{formatRelativeAf(comment.createdAt)}</span>
                    </div>
                    {comment.kind === articleKind && comment.title ? (
                      <div className="mt-2 flex flex-wrap items-start gap-3">
                        {comment.imagePath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comment.imagePath} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-display text-lg font-bold text-white">{comment.title}</p>
                          {comment.linkUrl ? (
                            <a
                              href={comment.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="text-sm font-semibold text-lime underline"
                            >
                              Bron: {linkHost(comment.linkUrl)}
                            </a>
                          ) : null}
                          {comment.status === "approved" && comment.slug ? (
                            <Link href={articlePath(comment.slug)} className="ml-3 text-sm font-semibold text-white/60 underline">
                              Bekyk op die forum
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    {comment.body ? <p className="desk-quote">{comment.body}</p> : null}
                    {comment.kind === articleKind && comment.title ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-bold text-white/70">Wysig artikel</summary>
                        <form action={updateArticle} className="mt-3 grid gap-3">
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="return_to" value="admin" />
                          <input type="hidden" name="status" value={filter} />
                          <label className="desk-label" htmlFor={`title-${comment.id}`}>
                            Titel
                            <input
                              id={`title-${comment.id}`}
                              className={deskField}
                              name="title"
                              required
                              maxLength={160}
                              defaultValue={comment.title}
                            />
                          </label>
                          <label className="desk-label" htmlFor={`body-${comment.id}`}>
                            Teks
                            <textarea
                              id={`body-${comment.id}`}
                              className={`${deskField} min-h-32`}
                              name="body"
                              required={!comment.linkUrl}
                              defaultValue={comment.body}
                            />
                          </label>
                          <label className="desk-label" htmlFor={`link-${comment.id}`}>
                            Skakel na die bron
                            <input
                              id={`link-${comment.id}`}
                              className={deskField}
                              name="link_url"
                              type="url"
                              defaultValue={comment.linkUrl ?? ""}
                              placeholder="https://"
                            />
                          </label>
                          <ImageUploadField label="Foto (opsioneel)" initialUrl={comment.imagePath} />
                          <div>
                            <AdminBtn type="submit" size="sm" icon="check">
                              Stoor artikel
                            </AdminBtn>
                          </div>
                        </form>
                      </details>
                    ) : null}
                    {comment.replies.length > 0 ? (
                      <ul className="mt-3 space-y-3 border-l border-lime/40 pl-3">
                        {comment.replies.map((reply) => (
                          <li key={reply.id}>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-white">{reply.authorName}</p>
                              {reply.authorRole === "teacher" ? <AdminBadge>Onderwyser</AdminBadge> : null}
                              <AdminBadge tone={commentStatusTone(reply.status)}>
                                {commentStatusLabel(reply.status)}
                              </AdminBadge>
                              <span className="text-xs text-white/45">{formatRelativeAf(reply.createdAt)}</span>
                            </div>
                            <p className="desk-quote">{reply.body}</p>
                            <form action={deleteComment} className="mt-2">
                              <input type="hidden" name="id" value={reply.id} />
                              <DeleteButton label="Verwyder antwoord" confirm="Verwyder hierdie antwoord?" />
                            </form>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <form action={replyToComment} className="mt-3 grid gap-2">
                      <input type="hidden" name="parent_id" value={comment.id} />
                      <input type="hidden" name="return_to" value="admin" />
                      <input type="hidden" name="status" value={filter} />
                      <label className="desk-label" htmlFor={`reply-${comment.id}`}>
                        Antwoord as onderwyser
                        <textarea
                          id={`reply-${comment.id}`}
                          name="body"
                          required
                          className={`${deskField} min-h-20`}
                          placeholder="Skryf jou antwoord hier"
                        />
                      </label>
                      <p className="text-xs leading-5 text-white/45">
                        {comment.status === "approved"
                          ? "Jou antwoord verskyn dadelik op die forum."
                          : "Jou antwoord verskyn op die forum sodra hierdie plasing goedgekeur is."}
                      </p>
                      <div>
                        <AdminBtn type="submit" size="sm" icon="comment">
                          Plaas antwoord
                        </AdminBtn>
                      </div>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.status !== "approved" ? (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="approved" />
                          <AdminBtn type="submit" size="sm" icon="check">
                            Keur goed
                          </AdminBtn>
                        </form>
                      ) : null}
                      {comment.status !== "rejected" ? (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <AdminBtn type="submit" tone="ghost" size="sm">
                            Keur af
                          </AdminBtn>
                        </form>
                      ) : (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="pending" />
                          <AdminBtn type="submit" tone="ghost" size="sm">
                            Terug na hangend
                          </AdminBtn>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={comment.id} />
                  <DeleteButton label="" confirm="Verwyder hierdie kommentaar permanent?" />
                </form>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
