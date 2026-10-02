import { deleteActivity, toggleActivityPublished } from "@/app/(admin)/admin/actions";
import { ActivityIcon } from "@/components/activity-icon";
import { DeleteButton } from "@/components/admin-client";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  AdminTabs,
} from "@/components/admin-ui";
import { getAllActivities } from "@/lib/activities";
import { activityKindLabel } from "@/lib/admin";
import { activityTypes, grades, isGrade } from "@/lib/site";

export const metadata = {
  title: "Aktiwiteite",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ graad?: string }>;
};

export default async function AdminActivitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activities = await getAllActivities();
  const selected = Number(params.graad);
  const grade = isGrade(selected) ? selected : null;
  const visible = grade ? activities.filter((activity) => activity.grade === grade) : activities;
  const live = activities.filter((activity) => activity.isPublished).length;
  const nightly = activities.filter((activity) => activity.source === "ai-daily").length;

  const tabs = [
    { href: "/admin/activities", label: "Alles", active: !grade, count: activities.length },
    ...grades.map((item) => ({
      href: `/admin/activities?graad=${item}`,
      label: `Gr ${item}`,
      active: grade === item,
      count: activities.filter((activity) => activity.grade === item).length,
    })),
  ];

  return (
    <AdminPage
      title="Aktiwiteite"
      description={`Handmatige vasvrae en waar-of-onwaar, plus wat die nagtaak bou. ${live} van ${activities.length} is live, ${nightly} kom van die nagtaak.`}
      actions={
        <>
          <AdminBtn href="/admin/activities/quiz/new" icon="plus">
            Nuwe vasvra
          </AdminBtn>
          <AdminBtn href="/admin/activities/true-or-false/new" tone="ghost" icon="plus">
            Waar of onwaar
          </AdminBtn>
        </>
      }
    >
      <AdminPanel title="Die oefenbank" icon="puzzle" action={<AdminTabs tabs={tabs} />}>
        {visible.length === 0 ? (
          <AdminEmpty
            icon="puzzle"
            title={activities.length === 0 ? "Nog geen aktiwiteite nie" : "Niks vir hierdie graad nie"}
            body="Skryf ’n vasvra self, of voeg onderwerpe by en laat die nagtaak begin."
            action={
              <AdminBtn href="/admin/activities/quiz/new" icon="plus">
                Begin ’n vasvra
              </AdminBtn>
            }
          />
        ) : (
          <ul>
            {visible.map((activity) => {
              const canEdit = activity.kind === "quiz" || activity.kind === "true-or-false";
              const accent = activityTypes.find((type) => type.slug === activity.kind)?.accent;

              return (
                <li key={activity.id} className="desk-row">
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <span className="desk-kind" style={accent ? { ["--tone" as string]: accent } : undefined}>
                      <ActivityIcon kind={activity.kind} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display font-bold text-white">{activity.title}</p>
                        <AdminBadge tone={activity.isPublished ? "live" : "draft"}>
                          {activity.isPublished ? "Live" : "Konsep"}
                        </AdminBadge>
                      </div>
                      <p className="text-sm text-white/55">
                        {activityKindLabel(activity.kind)}
                        {activity.grade ? ` · Graad ${activity.grade}` : ""}
                        {activity.source === "ai-daily" ? " · Nagtaak" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <AdminBtn href={`/admin/activities/${activity.kind}/${activity.slug}`} size="sm">
                        Wysig
                      </AdminBtn>
                    ) : null}
                    <form action={toggleActivityPublished}>
                      <input type="hidden" name="slug" value={activity.slug} />
                      <input type="hidden" name="kind" value={activity.kind} />
                      <input type="hidden" name="is_published" value={activity.isPublished ? "true" : "false"} />
                      <AdminBtn type="submit" tone="ghost" size="sm">
                        {activity.isPublished ? "Ontpubliseer" : "Publiseer"}
                      </AdminBtn>
                    </form>
                    <form action={deleteActivity}>
                      <input type="hidden" name="slug" value={activity.slug} />
                      <input type="hidden" name="kind" value={activity.kind} />
                      <DeleteButton confirm="Verwyder hierdie aktiwiteit? Leerders sal dit nie meer kan speel nie." />
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
