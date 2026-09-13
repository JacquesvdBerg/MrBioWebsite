import Link from "next/link";
import { notFound } from "next/navigation";
import { saveProduct } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import { AdminBadge, AdminBtn, AdminPanel, deskField } from "@/components/admin-ui";
import { ImageUploadField } from "@/components/image-upload-field";
import { getAdminProduct, productKindOptions } from "@/lib/products";
import { grades } from "@/lib/site";
import { visualTones } from "@/lib/visual-tone";

export const dynamic = "force-dynamic";

type EditorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export async function generateMetadata({ params }: EditorPageProps) {
  const { slug } = await params;
  const product = await getAdminProduct(slug);
  return { title: product ? `Wysig ${product.title}` : "Produk" };
}

export default async function AdminProductEditorPage({
  params,
  searchParams,
}: EditorPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getAdminProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <AdminPage
      title={product.title}
      description="Prys, graad, prent en of dit te koop is. Leerders doen navraag — ons stuur ’n faktuur."
      actions={
        <AdminBadge tone={product.isPublished ? "live" : "draft"}>
          {product.isPublished ? "Live" : "Konsep"}
        </AdminBadge>
      }
    >
      <p className="mb-6 text-sm">
        <Link href="/admin/products" className="font-semibold text-lime">
          ← Terug na produkte
        </Link>
        {" · "}
        <Link href="/shop" className="font-semibold text-lime">
          Sien winkel
        </Link>
      </p>

      {query.saved === "1" ? <p className="mb-6 text-sm text-lime">Produk is gestoor.</p> : null}
      {query.error === "fields" ? (
        <p className="mb-6 text-sm text-orange">Titel is verpligtend, en ’n item het ’n graad nodig.</p>
      ) : null}
      {query.error === "stoor" ? (
        <p className="mb-6 text-sm text-orange">Kon nie die produk stoor nie.</p>
      ) : null}

      <AdminPanel title="Besonderhede">
        <form action={saveProduct} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="existingSlug" value={product.slug} />
          <label className="desk-label md:col-span-2">
            Titel
            <input className={deskField} name="title" defaultValue={product.title} required />
          </label>
          <label className="desk-label">
            Tipe lys
            <select className={deskField} name="listing_kind" defaultValue={product.listingKind}>
              <option value="item">Produk</option>
              <option value="bundle">Bundel</option>
            </select>
          </label>
          <label className="desk-label">
            Soort
            <select className={deskField} name="kind" defaultValue={product.kind}>
              {productKindOptions.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
              {productKindOptions.includes(product.kind as (typeof productKindOptions)[number]) ? null : (
                <option>{product.kind}</option>
              )}
            </select>
          </label>
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue={product.grade ?? ""}>
              <option value="">Geen (bundel)</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Prys (R)
            <input
              className={deskField}
              name="price"
              type="number"
              min={0}
              defaultValue={product.price}
            />
          </label>
          <label className="desk-label">
            Was-prys (opsioneel)
            <input
              className={deskField}
              name="was_price"
              type="number"
              min={0}
              defaultValue={product.wasPrice ?? ""}
            />
          </label>
          <label className="desk-label">
            Bladsye
            <input
              className={deskField}
              name="pages"
              type="number"
              min={0}
              defaultValue={product.pages ?? ""}
            />
          </label>
          <label className="desk-label">
            Kenteken
            <input className={deskField} name="badge" defaultValue={product.badge ?? ""} />
          </label>
          <label className="desk-label">
            Kleur
            <select className={deskField} name="tone" defaultValue={product.tone}>
              {visualTones.map((tone) => (
                <option key={tone}>{tone}</option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Volgorde
            <input
              className={deskField}
              name="sort_order"
              type="number"
              defaultValue={product.sortOrder}
            />
          </label>
          <label className="desk-label md:col-span-2">
            Punte (een per reël)
            <textarea
              className={`${deskField} min-h-28`}
              name="bullets"
              defaultValue={product.bullets.join("\n")}
            />
          </label>
          <label className="desk-label md:col-span-2">
            Bundel-beskrywing
            <textarea className={`${deskField} min-h-24`} name="body" defaultValue={product.body} />
          </label>
          <ImageUploadField label="Prent" initialUrl={product.imagePath} />
          <div className="flex flex-col gap-3 self-end pb-2">
            <label className="desk-check">
              <input type="checkbox" name="is_published" defaultChecked={product.isPublished} />
              Publiseer op die winkel
            </label>
            <label className="desk-check">
              <input type="checkbox" name="is_featured" defaultChecked={product.isFeatured} />
              Wys op die tuisblad
            </label>
          </div>
          <div className="md:col-span-2">
            <AdminBtn type="submit">Stoor produk</AdminBtn>
          </div>
        </form>
      </AdminPanel>
    </AdminPage>
  );
}
