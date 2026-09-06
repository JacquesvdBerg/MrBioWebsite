import { deleteMedia } from "@/app/(admin)/admin/actions";
import { MediaUploader } from "@/app/(admin)/admin/media/uploader";
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
      description="Laai prente op vir temas, feite en lesse. Kopieer die URL en plak dit by ’n tema of video."
    >
      <AdminPanel title="Laai op">
        <MediaUploader />
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title={`${items.length} lêers`} padded={items.length === 0}>
          {items.length === 0 ? (
            <AdminEmpty
              title="Nog geen lêers nie"
              body="Laai ’n diagram of hero-prent op. Dit sit in Supabase Storage en is dadelik bruikbaar."
            />
          ) : (
            <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.name} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.name} className="h-40 w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <p className="truncate text-xs font-semibold text-white">{item.name}</p>
                    <input
                      readOnly
                      value={item.url}
                      className="w-full rounded-lg border border-white/10 bg-white/6 px-2 py-1 font-mono text-[11px] text-white"
                    />
                    <form action={deleteMedia}>
                      <input type="hidden" name="name" value={item.name} />
                      <button type="submit" className="desk-btn desk-btn-danger">
                        Verwyder
                      </button>
                    </form>
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
