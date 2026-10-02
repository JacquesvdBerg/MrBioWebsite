import { deleteMedia } from "@/app/(admin)/admin/actions";
import { MediaUploader } from "@/app/(admin)/admin/media/uploader";
import { CopyButton, DeleteButton } from "@/components/admin-client";
import { AdminPage } from "@/components/admin-page";
import { AdminEmpty, AdminPanel } from "@/components/admin-ui";
import { listMedia } from "@/lib/media";

export const metadata = {
  title: "Media",
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await listMedia();

  return (
    <AdminPage
      title="Media"
      description="Prente vir temas, feite, produkte en lesse. Laai op, kopieer die URL en plak dit waar jy dit nodig het."
    >
      <MediaUploader />

      <div className="mt-6">
        <AdminPanel title={`${items.length} ${items.length === 1 ? "prent" : "prente"}`} icon="image">
          {items.length === 0 ? (
            <AdminEmpty
              icon="image"
              title="Nog geen prente nie"
              body="Laai ’n diagram of foto hierbo op. Dit word in Supabase Storage gestoor en is dadelik bruikbaar."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <li key={item.name} className="desk-media">
                  <a href={item.url} target="_blank" rel="noreferrer" className="desk-media-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.name} loading="lazy" />
                  </a>
                  <div className="p-3">
                    <p className="truncate text-xs font-bold text-white" title={item.name}>
                      {item.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <CopyButton value={item.url} />
                      <form action={deleteMedia}>
                        <input type="hidden" name="name" value={item.name} />
                        <DeleteButton
                          label=""
                          confirm="Verwyder hierdie prent? Bladsye wat dit gebruik, sal ’n gebreekte prent wys."
                        />
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
