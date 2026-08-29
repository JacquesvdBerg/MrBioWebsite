import { AdminPage } from "@/components/admin-page";

export const metadata = {
  title: "Produkte",
};

export default function AdminProductsPage() {
  return (
    <AdminPage
      title="Produkte"
      description="Skep, wysig, prys, gradeer, kategoriseer, publiseer of merk as onbeskikbaar."
    />
  );
}
