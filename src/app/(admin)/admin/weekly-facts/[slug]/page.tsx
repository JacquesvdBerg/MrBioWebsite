import { notFound } from "next/navigation";
import { saveWeeklyFact, setWeeklyFactStatus } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn, AdminPanel, deskField, AdminNotice } from "@/components/admin-ui";
import { ImageUploadField } from "@/components/image-upload-field";
import { grades } from "@/lib/site";
import {
  getAdminWeeklyFact,
  weeklyFactCategories,
  weeklyFactStatusLabel,
  weeklyFactStatusTone,
} from "@/lib/weekly-facts";
import { bioArtKinds, visualTones } from "@/lib/visual-tone";

export const dynamic = "force-dynamic";

type EditorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export async function generateMetadata({ params }: EditorPageProps) {
  const { slug } = await params;
  const fact = await getAdminWeeklyFact(slug);
  return { title: fact ? `Wysig ${fact.title}` : "Feit" };
}

export default async function AdminWeeklyFactEditorPage({
  params,
  searchParams,
}: EditorPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const fact = await getAdminWeeklyFact(slug);

  if (!fact) {
    notFound();
  }

  return (
    <AdminPage
      title={fact.title}
      description="Hersien die wetenskap, kies ’n prent of bio-kuns, en besluit of dit konsep, goedgekeur of live is."
      back={{ href: "/admin/weekly-facts", label: "Weeklikse feite" }}
      meta={
        <>
          <AdminBadge tone={weeklyFactStatusTone(fact.status)}>{weeklyFactStatusLabel(fact.status)}</AdminBadge>
          {fact.weekLabel ? <span className="text-sm text-white/50">{fact.weekLabel}</span> : null}
        </>
      }
      actions={
        fact.status === "published" ? (
          <AdminBtn href="/weekly-facts" tone="ghost" icon="external" external>
            Publieke bladsy
          </AdminBtn>
        ) : undefined
      }
    >
      {query.saved === "1" ? (
        <AdminNotice tone="ok">Feit is gestoor.</AdminNotice>
      ) : null}
      {query.error === "fields" ? (
        <AdminNotice tone="err">Titel en graad 10–12 is verpligtend.</AdminNotice>
      ) : null}
      {query.error === "stoor" ? (
        <AdminNotice tone="err">Kon nie die feit stoor nie.</AdminNotice>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {fact.status !== "draft" ? (
          <form action={setWeeklyFactStatus}>
            <input type="hidden" name="slug" value={fact.slug} />
            <input type="hidden" name="status" value="draft" />
            <AdminBtn type="submit" tone="ghost">
              Terug na konsep
            </AdminBtn>
          </form>
        ) : null}
        {fact.status === "draft" ? (
          <form action={setWeeklyFactStatus}>
            <input type="hidden" name="slug" value={fact.slug} />
            <input type="hidden" name="status" value="approved" />
            <AdminBtn type="submit" tone="ghost">
              Keur goed
            </AdminBtn>
          </form>
        ) : null}
        {fact.status !== "published" ? (
          <form action={setWeeklyFactStatus}>
            <input type="hidden" name="slug" value={fact.slug} />
            <input type="hidden" name="status" value="published" />
            <AdminBtn type="submit" icon="spark">
              Publiseer
            </AdminBtn>
          </form>
        ) : (
          <form action={setWeeklyFactStatus}>
            <input type="hidden" name="slug" value={fact.slug} />
            <input type="hidden" name="status" value="approved" />
            <AdminBtn type="submit" tone="ghost">
              Ontpubliseer
            </AdminBtn>
          </form>
        )}
      </div>

      <AdminPanel title="Inhoud" icon="leaf">
        <form action={saveWeeklyFact} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="existingSlug" value={fact.slug} />
          <label className="desk-label md:col-span-2">
            Titel
            <input className={deskField} name="title" defaultValue={fact.title} required />
          </label>
          <label className="desk-label md:col-span-2">
            Verduideliking
            <textarea className={`${deskField} min-h-36`} name="body" defaultValue={fact.body} />
          </label>
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue={fact.grade}>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Kategorie
            <select className={deskField} name="category" defaultValue={fact.category}>
              {weeklyFactCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
              {fact.category &&
              !weeklyFactCategories.includes(
                fact.category as (typeof weeklyFactCategories)[number],
              ) ? (
                <option>{fact.category}</option>
              ) : null}
            </select>
          </label>
          <label className="desk-label">
            Week-etiket
            <input className={deskField} name="week_label" defaultValue={fact.weekLabel} />
          </label>
          <label className="desk-label">
            Week-begin
            <input
              className={deskField}
              name="week_start"
              type="date"
              defaultValue={fact.weekStart ?? ""}
            />
          </label>
          <label className="desk-label">
            Kleur
            <select className={deskField} name="tone" defaultValue={fact.tone}>
              {visualTones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Bio-kuns
            <select className={deskField} name="art" defaultValue={fact.art}>
              {bioArtKinds.map((art) => (
                <option key={art}>{art}</option>
              ))}
            </select>
          </label>
          <ImageUploadField label="Prent (opsioneel)" initialUrl={fact.imagePath} />
          <label className="desk-label">
            Volgorde
            <input
              className={deskField}
              name="sort_order"
              type="number"
              defaultValue={fact.sortOrder}
            />
          </label>
          <div className="md:col-span-2">
            <AdminBtn type="submit" icon="check">
              Stoor inhoud
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>
    </AdminPage>
  );
}
