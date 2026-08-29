import { AdminPage } from "@/components/admin-page";

export const metadata = {
  title: "Instellings",
};

export default function AdminSettingsPage() {
  return (
    <AdminPage
      title="Instellings"
      description="Werfnaam, kontakbesonderhede en later AI-sleutels. Die handelsnaam is nog nie vas nie."
    />
  );
}
