import { notFound } from "next/navigation";
import { SectionPage } from "@/components/section-page";
import { activityTypes, isActivitySlug } from "@/lib/site";

type ActivityPageProps = {
  params: Promise<{ type: string }>;
};

export function generateStaticParams() {
  return activityTypes.map((activity) => ({ type: activity.slug }));
}

export async function generateMetadata({ params }: ActivityPageProps) {
  const { type } = await params;
  const activity = activityTypes.find((item) => item.slug === type);

  return {
    title: activity?.title ?? "Aktiwiteit",
  };
}

export default async function ActivityTypePage({ params }: ActivityPageProps) {
  const { type } = await params;

  if (!isActivitySlug(type)) {
    notFound();
  }

  const activity = activityTypes.find((item) => item.slug === type);

  if (!activity) {
    notFound();
  }

  return (
    <SectionPage
      eyebrow="Speel & leer"
      title={activity.title}
      description={activity.description}
      visionPath={`vision/public/play-and-learn/${activity.slug}`}
    >
      <div className="card-surface border-dashed p-8 leading-7 text-muted">
        Die {activity.title.toLowerCase()}-enjin word in fase 2 gebou. Die
        onderwyser sal later aktiwiteite in admin skep sonder ’n ontwikkelaar.
      </div>
    </SectionPage>
  );
}
