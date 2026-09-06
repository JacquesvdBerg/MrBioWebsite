import { deleteActivity } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
} from "@/components/admin-ui";
import { getAllActivities } from "@/lib/activities";
import { activityKindLabel } from "@/lib/admin";

export const metadata = {
  title: "Aktiwiteite",
};

export const dynamic = "force-dynamic";

export default async function AdminActivitiesPage() {
  const activities = await getAllActivities();

  return (
    <AdminPage
      title="Aktiwiteite"
      description="Handmatige vasvrae en waar-of-onwaar, of laat die nagtaak die daaglikse oefeninge skep. Leerders sien net wat gepubliseer is."
      actions={
        <>
          <AdminBtn href="/admin/activities/quiz/new">Nuwe vasvra</AdminBtn>
          <AdminBtn href="/admin/activities/true-or-false/new" tone="ghost">
            Nuwe waar of onwaar
          </AdminBtn>
        </>
      }
    >
      <AdminPanel title={`${activities.length} in die bank`}>
        {activities.length === 0 ? (
          <AdminEmpty
            title="Nog geen aktiwiteite nie"
            body="Skryf die eerste vasvra self, of voeg onderwerpe by en laat die nagtaak begin."
            action={<AdminBtn href="/admin/activities/quiz/new">Begin ’n vasvra</AdminBtn>}
          />
        ) : (
          <ul>
            {activities.map((activity) => {
              const canEdit = activity.kind === "quiz" || activity.kind === "true-or-false";

              return (
                <li key={activity.id} className="desk-row">
                  <div>
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
                  <div className="flex items-center gap-3">
                    {canEdit ? (
                      <AdminBtn href={`/admin/activities/${activity.kind}/${activity.slug}`}>
                        Wysig
                      </AdminBtn>
                    ) : null}
                    <form action={deleteActivity}>
                      <input type="hidden" name="slug" value={activity.slug} />
                      <input type="hidden" name="kind" value={activity.kind} />
                      <button type="submit" className="desk-btn desk-btn-danger">
                        Verwyder
                      </button>
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
