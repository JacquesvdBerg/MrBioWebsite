import { AdminPage } from "@/components/admin-page";
import { DeskArticleFormLoader } from "@/components/desk-article-form-loader";

export const metadata = { title: "Nuwe artikel" };

export default function NewArticlePage() {
  return (
    <AdminPage
      title="Nuwe artikel"
      description="Skryf soos in Word, of plak jou artikel uit Word of Google Docs. Opskrifte, lyste, tabelle en prente kom saam."
      back={{ href: "/admin/comments", label: "Kommentaar" }}
    >
      <DeskArticleFormLoader />
    </AdminPage>
  );
}
