import { NewsletterDesk } from "@/app/(admin)/admin/newsletter/newsletter-desk";
import { AdminPage } from "@/components/admin-page";
import { AdminEmpty, AdminPanel } from "@/components/admin-ui";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = {
  title: "Nuusbrief",
};

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const subscribers = await listNewsletterSubscribers();

  return (
    <AdminPage
      title="Nuusbrief"
      description="Adresse uit die voetskrif. Stuur ’n brief uit jou eie e-posprogram. Almal sit in BCC."
    >
      <AdminPanel title={`${subscribers.length} adresse`} icon="inbox">
        {subscribers.length === 0 ? (
          <AdminEmpty
            icon="inbox"
            title="Nog niemand het ingeskryf nie"
            body="Sodra iemand hul e-pos in die voetskrif sit, verskyn dit hier."
          />
        ) : (
          <NewsletterDesk subscribers={subscribers} />
        )}
      </AdminPanel>
    </AdminPage>
  );
}
