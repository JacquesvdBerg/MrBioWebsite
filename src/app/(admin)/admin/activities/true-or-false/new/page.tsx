import { AdminPage } from "@/components/admin-page";
import { TrueOrFalseEditor } from "@/components/true-or-false-editor";
import { getAllThemes } from "@/lib/themes";

export const metadata = {
  title: "Nuwe waar of onwaar",
};

export const dynamic = "force-dynamic";

export default async function NewTrueOrFalsePage() {
  const themes = await getAllThemes();

  return (
    <AdminPage
      title="Nuwe waar of onwaar"
      description="Merk of die stelling waar of onwaar is. Leerders sien een stelling op ’n slag."
    >
      <TrueOrFalseEditor
        themeOptions={themes.map((theme) => ({
          slug: theme.slug,
          title: theme.title,
        }))}
      />
    </AdminPage>
  );
}
