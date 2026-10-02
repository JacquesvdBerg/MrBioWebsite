import { deleteComment, setCommentStatus } from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin-client";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminTabs,
  initialsOf,
} from "@/components/admin-ui";
import {
  commentAuthorLine,
  commentStatusLabel,
  commentStatusTone,
  getAllComments,
  toCommentStatus,
  type CommentStatus,
} from "@/lib/comments";
import { formatRelativeAf } from "@/lib/dates";

export const metadata = {
  title: "Kommentaar",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statuses = ["pending", "approved", "rejected"] as const satisfies readonly CommentStatus[];

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const comments = await getAllComments();
  const filter: CommentStatus = params.status ? toCommentStatus(params.status) : "pending";
  const visible = comments.filter((item) => item.status === filter);

  const tabs = statuses.map((status) => ({
    href: status === "pending" ? "/admin/comments" : `/admin/comments?status=${status}`,
    label: commentStatusLabel(status),
    active: filter === status,
    count: comments.filter((item) => item.status === status).length,
  }));

  return (
    <AdminPage
      title="Kommentaar"
      description="Jy besluit wat publiek is. Nuwe kommentaar wag hier tot jy dit goedkeur — niks gaan outomaties lewendig nie."
    >
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
