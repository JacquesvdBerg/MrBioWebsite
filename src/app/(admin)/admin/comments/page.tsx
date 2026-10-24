import { deleteComment, replyToComment, setCommentStatus } from "@/app/(admin)/admin/actions";
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
import {
  commentAuthorLine,
  commentStatusLabel,
  commentStatusTone,
  getAllComments,
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
  searchParams: Promise<{ status?: string; fout?: string }>;
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
      description="Jy besluit wat publiek is. Nuwe kommentaar wag hier tot jy dit goedkeur. Antwoord op ’n plasing, dan verskyn jou antwoord op die forum saam met daardie plasing."
    >
      {params.fout === "antwoord" ? <AdminNotice tone="err">Sit ’n antwoord in.</AdminNotice> : null}
      {params.fout === "stoor" ? (
        <AdminNotice tone="err">Kon nie die antwoord stoor nie. Probeer weer.</AdminNotice>
      ) : null}
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
                    <p className="desk-quote">{comment.body}</p>
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
