import { deleteMedia } from "@/app/(admin)/admin/actions";
import { MediaUploader } from "@/app/(admin)/admin/media/uploader";
import { AdminPage } from "@/components/admin-page";
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
      description="Laai prente op vir temas, feite en lesse. Kopieer die URL en plak dit by 'n tema."
    >
      <MediaUploader />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            Nog geen lêers nie.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.name}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="h-40 w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs font-semibold text-navy">
                  {item.name}
                </p>
                <input
                  readOnly
                  value={item.url}
                  className="w-full rounded-lg border border-line bg-cream px-2 py-1 font-mono text-[11px]"
                />
                <form action={deleteMedia}>
                  <input type="hidden" name="name" value={item.name} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-orange"
                  >
                    Verwyder
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </AdminPage>
  );
}
