import { AdminPage } from "@/components/admin-page";

export const metadata = {
  title: "Weeklikse feite",
};

export default function AdminWeeklyFactsPage() {
  return (
    <AdminPage
      title="Weeklikse feite"
      description="Skep of genereer ’n konsep, hersien dit, en druk eers Goedkeur & Publiseer."
    />
  );
}
