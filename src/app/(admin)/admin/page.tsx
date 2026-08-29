import { AdminPage } from "@/components/admin-page";

export const metadata = {
  title: "Admin",
};

const overview = [
  { label: "Produknavrae", value: "0" },
  { label: "Ongeleesde vrae", value: "0" },
  { label: "Kommentaar wag", value: "0" },
  { label: "Gepubliseerde aktiwiteite", value: "0" },
  { label: "Gepubliseerde video’s", value: "0" },
];

export default function AdminDashboardPage() {
  return (
    <AdminPage
      title="Oorsig"
      description="Vinnige stand van die platform. Volledige ontleding is nie nodig vir V1 nie."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overview.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-sm)]"
          >
            <p className="font-display text-3xl font-bold text-navy">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </article>
        ))}
      </div>
    </AdminPage>
  );
}
