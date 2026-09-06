import { AdminPage } from "@/components/admin-page";
import { QuizEditor } from "@/components/quiz-editor";
import { getAllThemes } from "@/lib/themes";

export const metadata = {
  title: "Nuwe vasvra",
};

export const dynamic = "force-dynamic";

export default async function NewQuizPage() {
  const themes = await getAllThemes();

  return (
    <AdminPage
      title="Nuwe vasvra"
      description="Merk die regte antwoord met die sirkel. Leerders sien een vraag op ’n slag."
    >
      <QuizEditor
        themeOptions={themes.map((theme) => ({
          slug: theme.slug,
          title: theme.title,
        }))}
      />
    </AdminPage>
  );
}
