import { AdminPage } from "@/components/admin-page";

export const metadata = {
  title: "Kommentaar",
};

export default function AdminCommentsPage() {
  return (
    <AdminPage
      title="Kommentaar"
      description="Hangende, goedgekeurde en afgekeurde statusse. Die onderwyser beheer wat publiek is."
    />
  );
}
