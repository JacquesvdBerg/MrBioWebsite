import Link from "next/link";
import { deleteComment, setCommentStatus } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminStat,
} from "@/components/admin-ui";
import {
  commentAuthorLine,
  commentStatusLabel,
  commentStatusTone,
  getAllComments,
  toCommentStatus,
  type CommentStatus,
} from "@/lib/comments";
import { formatDeskDate } from "@/lib/dates";

export const metadata = {
  title: "Kommentaar",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const filters = [
  { href: "/admin/comments", label: "Hangend", status: "pending" },
  { href: "/admin/comments?status=approved", label: "Goedgekeur", status: "approved" },
  { href: "/admin/comments?status=rejected", label: "Afgekeur", status: "rejected" },
] as const;

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const comments = await getAllComments();
  const filter: CommentStatus = params.status ? toCommentStatus(params.status) : "pending";
  const visible = comments.filter((item) => item.status === filter);
  const pending = comments.filter((item) => item.status === "pending").length;
  const approved = comments.filter((item) => item.status === "approved").length;
  const rejected = comments.filter((item) => item.status === "rejected").length;

  return (
    <AdminPage
      title="Kommentaar"
      description="Hangende, goedgekeurde en afgekeurde statusse. Jy besluit wat publiek is — niks gaan outomaties lewendig nie."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStat href="/admin/comments" label="Wag op keuring" value={pending} hint="Niks publiek voor jy sê ja" />
        <AdminStat href="/admin/comments?status=approved" label="Goedgekeur" value={approved} />
        <AdminStat href="/admin/comments?status=rejected" label="Afgekeur" value={rejected} />
      </div>

      <div className="mt-6">
        <AdminPanel
          title="Waglys"
          action={
            <div className="desk-tabs">
              {filters.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`desk-tab ${filter === tab.status ? "is-active" : ""}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          }
        >
          {visible.length === 0 ? (
            <AdminEmpty
              title={filter === "pending" ? "Die waglys is skoon" : "Niks in hierdie lys nie"}
              body="Nuwe kommentaar verskyn eers hier. Leerders sien niks tot jy Goedkeur druk."
            />
          ) : (
            <ul>
              {visible.map((comment) => (
                <li key={comment.id} className="desk-row items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{commentAuthorLine(comment)}</p>
                      <AdminBadge>{comment.kind}</AdminBadge>
                      <AdminBadge tone={commentStatusTone(comment.status)}>
                        {commentStatusLabel(comment.status)}
                      </AdminBadge>
                    </div>
                    <p className="text-sm text-white/55">{formatDeskDate(comment.createdAt)}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
                      {comment.body}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.status !== "approved" ? (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="approved" />
                          <AdminBtn type="submit">Goedkeur</AdminBtn>
                        </form>
                      ) : null}
                      {comment.status !== "rejected" ? (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <AdminBtn type="submit" tone="ghost">
                            Keur af
                          </AdminBtn>
                        </form>
                      ) : (
                        <form action={setCommentStatus}>
                          <input type="hidden" name="id" value={comment.id} />
                          <input type="hidden" name="status" value="pending" />
                          <AdminBtn type="submit" tone="ghost">
                            Terug na hangend
                          </AdminBtn>
                        </form>
                      )}
                    </div>
                  </div>
                  <form action={deleteComment}>
                    <input type="hidden" name="id" value={comment.id} />
                    <button type="submit" className="desk-btn desk-btn-danger">
                      Verwyder
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
