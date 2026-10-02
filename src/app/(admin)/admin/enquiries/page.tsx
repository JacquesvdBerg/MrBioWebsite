import { deleteEnquiry, setEnquiryStatus } from "@/app/(admin)/admin/actions";
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
import { formatRelativeAf } from "@/lib/dates";
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

const statuses = ["new", "in_progress", "done"] as const satisfies readonly EnquiryStatus[];

export default async function AdminEnquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const enquiries = await getAllEnquiries();
  const filter = params.status ? toEnquiryStatus(params.status) : null;
  const visible = filter ? enquiries.filter((item) => item.status === filter) : enquiries;

  const tabs = [
    { href: "/admin/enquiries", label: "Alles", active: !filter, count: enquiries.length },
    ...statuses.map((status) => ({
      href: `/admin/enquiries?status=${status}`,
      label: enquiryStatusLabel(status),
      active: filter === status,
      count: enquiries.filter((item) => item.status === status).length,
    })),
  ];

  return (
    <AdminPage
      title="Navrae"
      description="Winkelnavrae en kontakvorms land hier: wie wil watter pak hê, en of jy al geantwoord het."
    >
      <AdminPanel title="Inkassie" icon="inbox" action={<AdminTabs tabs={tabs} />}>
        {visible.length === 0 ? (
          <AdminEmpty
            icon="inbox"
            title={filter === "new" ? "Geen nuwe navrae nie" : "Niks in hierdie lys nie"}
            body="Wanneer iemand die kontak- of winkelnavraag stuur, verskyn dit hier — naam, e-pos, produk en graad."
          />
        ) : (
          <ul>
            {visible.map((enquiry) => (
              <li key={enquiry.id} className="desk-row items-start">
                <div className="flex min-w-0 flex-1 gap-3.5">
                  <span className="desk-avatar is-amber">{initialsOf(enquiry.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{enquiry.name}</p>
                      <AdminBadge tone={enquiryStatusTone(enquiry.status)}>
                        {enquiryStatusLabel(enquiry.status)}
                      </AdminBadge>
                      <span className="text-xs text-white/45">{formatRelativeAf(enquiry.createdAt)}</span>
                    </div>
                    <p className="text-sm text-white/55">
                      <a href={`mailto:${enquiry.email}`} className="font-semibold text-lime hover:underline">
                        {enquiry.email}
                      </a>
                      {" · "}
                      {enquiry.reason}
                      {enquiry.productSlug ? ` · ${enquiry.productSlug}` : ""}
                      {enquiry.grade ? ` · Graad ${enquiry.grade}` : ""}
                    </p>
                    {enquiry.message ? <p className="desk-quote">{enquiry.message}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AdminBtn href={`mailto:${enquiry.email}`} size="sm" icon="arrow" external>
                        Antwoord per e-pos
                      </AdminBtn>
                      {statuses.map((status) =>
                        status === enquiry.status ? null : (
                          <form key={status} action={setEnquiryStatus}>
                            <input type="hidden" name="id" value={enquiry.id} />
                            <input type="hidden" name="status" value={status} />
                            <AdminBtn type="submit" tone="ghost" size="sm">
                              Merk: {enquiryStatusLabel(status).toLowerCase()}
                            </AdminBtn>
                          </form>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <form action={deleteEnquiry}>
                  <input type="hidden" name="id" value={enquiry.id} />
                  <DeleteButton label="" confirm="Verwyder hierdie navraag?" />
                </form>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
