import Link from "next/link";
import { deleteEnquiry, setEnquiryStatus } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminStat,
} from "@/components/admin-ui";
import { formatDeskDate } from "@/lib/dates";
import {
  enquiryStatusLabel,
  enquiryStatusTone,
  getAllEnquiries,
  toEnquiryStatus,
  type EnquiryStatus,
} from "@/lib/enquiries";

export const metadata = {
  title: "Navrae",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const filters = [
  { href: "/admin/enquiries", label: "Alles", status: "" },
  { href: "/admin/enquiries?status=new", label: "Nuut", status: "new" },
  { href: "/admin/enquiries?status=in_progress", label: "In behandeling", status: "in_progress" },
  { href: "/admin/enquiries?status=done", label: "Klaar", status: "done" },
] as const;

export default async function AdminEnquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const enquiries = await getAllEnquiries();
  const filter = params.status ? toEnquiryStatus(params.status) : null;
  const visible = filter ? enquiries.filter((item) => item.status === filter) : enquiries;
  const newCount = enquiries.filter((item) => item.status === "new").length;
  const progressCount = enquiries.filter((item) => item.status === "in_progress").length;
  const doneCount = enquiries.filter((item) => item.status === "done").length;

  return (
    <AdminPage
      title="Navrae"
      description="Winkelnavrae en kontakvorms land hier: wie wil watter pak hê, en of jy al geantwoord het."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStat href="/admin/enquiries?status=new" label="Nuut" value={newCount} hint="Wag op antwoord" />
        <AdminStat href="/admin/enquiries?status=in_progress" label="In behandeling" value={progressCount} />
        <AdminStat href="/admin/enquiries?status=done" label="Klaar" value={doneCount} />
      </div>

      <div className="mt-6">
        <AdminPanel
          title="Inkassie"
          action={
            <div className="desk-tabs">
              {filters.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`desk-tab ${(!filter && !tab.status) || filter === tab.status ? "is-active" : ""}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          }
        >
          {visible.length === 0 ? (
            <AdminEmpty
              title="Geen navrae in hierdie lys nie"
              body="Wanneer iemand die kontak- of winkelnavraag stuur, verskyn dit hier — naam, e-pos, produk, graad."
            />
          ) : (
            <ul>
              {visible.map((enquiry) => (
                <li key={enquiry.id} className="desk-row items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{enquiry.name}</p>
                      <AdminBadge tone={enquiryStatusTone(enquiry.status)}>
                        {enquiryStatusLabel(enquiry.status)}
                      </AdminBadge>
                    </div>
                    <p className="text-sm text-white/55">
                      {enquiry.email} · {enquiry.reason}
                      {enquiry.productSlug ? ` · ${enquiry.productSlug}` : ""}
                      {enquiry.grade ? ` · Graad ${enquiry.grade}` : ""}
                      {" · "}
                      {formatDeskDate(enquiry.createdAt)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
                      {enquiry.message}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["new", "in_progress", "done"] as const satisfies readonly EnquiryStatus[]).map(
                        (status) =>
                          status === enquiry.status ? null : (
                            <form key={status} action={setEnquiryStatus}>
                              <input type="hidden" name="id" value={enquiry.id} />
                              <input type="hidden" name="status" value={status} />
                              <AdminBtn type="submit" tone="ghost">
                                {enquiryStatusLabel(status)}
                              </AdminBtn>
                            </form>
                          ),
                      )}
                    </div>
                  </div>
                  <form action={deleteEnquiry}>
                    <input type="hidden" name="id" value={enquiry.id} />
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
