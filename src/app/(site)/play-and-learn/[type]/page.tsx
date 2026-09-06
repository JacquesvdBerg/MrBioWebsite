import { notFound, redirect } from "next/navigation";
import { activityTypes, isActivitySlug } from "@/lib/site";

type ActivityTypePageProps = {
  params: Promise<{ type: string }>;
};

export function generateStaticParams() {
  return activityTypes.map((activity) => ({ type: activity.slug }));
}

export default async function ActivityTypePage({
  params,
}: ActivityTypePageProps) {
  const { type } = await params;

  if (!isActivitySlug(type)) {
    notFound();
  }

  redirect("/play-and-learn");
}
