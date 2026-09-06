import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin-page";
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
    >
      <p className="mb-6 text-sm">
        <Link href="/admin/activities" className="font-semibold text-lime">
          ← Aktiwiteite
        </Link>
        {" · "}
        <Link
          href={`/play-and-learn/quiz/${quiz.slug}`}
          className="font-semibold text-lime"
        >
          Speel
        </Link>
      </p>
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
