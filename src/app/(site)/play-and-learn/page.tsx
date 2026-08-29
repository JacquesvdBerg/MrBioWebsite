import Link from "next/link";
import { SectionPage } from "@/components/section-page";
import { activityTypes } from "@/lib/site";

export const metadata = {
  title: "Speel en leer",
};

export default function PlayAndLearnPage() {
  return (
    <SectionPage
      eyebrow="Speel & leer"
      title="Herbruikbare aktiwiteite"
      description="Een bouer, baie speletjies. Aktiwiteite word later volgens graad, onderwerp en tipe georganiseer."
      visionPath="vision/public/play-and-learn"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {activityTypes.map((activity) => (
          <Link
            key={activity.slug}
            href={`/play-and-learn/${activity.slug}`}
            className="lift card-surface group p-7"
          >
            <h2 className="font-display text-2xl font-bold text-navy">
              {activity.title}
            </h2>
            <p className="mt-2 leading-7 text-muted">{activity.description}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-green">
              Begin
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </SectionPage>
  );
}
