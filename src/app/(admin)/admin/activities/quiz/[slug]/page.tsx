import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn } from "@/components/admin-ui";
import { QuizEditor } from "@/components/quiz-editor";
import { asQuiz, getAdminActivity } from "@/lib/activities";
import { getAllThemes } from "@/lib/themes";

export const dynamic = "force-dynamic";

type EditQuizPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EditQuizPageProps) {
  const { slug } = await params;
  const activity = await getAdminActivity("quiz", slug);

  return { title: activity ? `Wysig ${activity.title}` : "Vasvra" };
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { slug } = await params;
  const [activity, themes] = await Promise.all([
    getAdminActivity("quiz", slug),
    getAllThemes(),
  ]);

  if (!activity) {
    notFound();
  }

  const quiz = asQuiz(activity);

  if (!quiz) {
    notFound();
  }

  return (
    <AdminPage
      title={quiz.title}
      description="Stoor, dan speel die publieke bladsy dadelik."
      back={{ href: "/admin/activities", label: "Aktiwiteite" }}
      meta={
        <>
          <AdminBadge>Vasvra</AdminBadge>
          <AdminBadge tone={quiz.isPublished ? "live" : "draft"}>{quiz.isPublished ? "Live" : "Konsep"}</AdminBadge>
        </>
      }
      actions={
        <AdminBtn href={`/play-and-learn/quiz/${quiz.slug}`} tone="ghost" icon="external" external>
          Speel
        </AdminBtn>
      }
    >
      <QuizEditor
        slug={quiz.slug}
        title={quiz.title}
        description={quiz.description}
        grade={quiz.grade}
        topic={quiz.topic}
        themeSlug={quiz.themeSlug}
        published={quiz.isPublished}
        questions={quiz.quiz.questions}
        themeOptions={themes.map((theme) => ({
          slug: theme.slug,
          title: theme.title,
        }))}
      />
    </AdminPage>
  );
}
