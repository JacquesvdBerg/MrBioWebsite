import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin-page";
import { TrueOrFalseEditor } from "@/components/true-or-false-editor";
import { asTrueOrFalse, getAdminActivity } from "@/lib/activities";
import { getAllThemes } from "@/lib/themes";

export const dynamic = "force-dynamic";

type EditTrueOrFalsePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EditTrueOrFalsePageProps) {
  const { slug } = await params;
  const activity = await getAdminActivity("true-or-false", slug);

  return { title: activity ? `Wysig ${activity.title}` : "Waar of onwaar" };
}

export default async function EditTrueOrFalsePage({
  params,
}: EditTrueOrFalsePageProps) {
  const { slug } = await params;
  const [activity, themes] = await Promise.all([
    getAdminActivity("true-or-false", slug),
    getAllThemes(),
  ]);

  if (!activity) {
    notFound();
  }

  const quiz = asTrueOrFalse(activity);

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
          href={`/play-and-learn/true-or-false/${quiz.slug}`}
          className="font-semibold text-lime"
        >
          Speel
        </Link>
      </p>
      <TrueOrFalseEditor
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
