import { createProduct, deleteProduct } from "@/app/(admin)/admin/actions";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminPanel,
  deskField,
} from "@/components/admin-ui";
import { getAllProducts, productKindOptions } from "@/lib/products";
import { grades } from "@/lib/site";

export const metadata = {
  title: "Produkte",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const products = await getAllProducts();
  const items = products.filter((product) => product.listingKind === "item");
  const bundles = products.filter((product) => product.listingKind === "bundle");
  const live = products.filter((product) => product.isPublished);
  const catalogueValue = live.reduce((sum, product) => sum + product.price, 0);

  return (
    <AdminPage
      title="Produkte"
      description="Notas, pakke en bundels. Die winkel is navraag-gebaseer — geen aanlyn betaling nie. Net gepubliseerde items verskyn op /shop."
    >
      {params.error === "fields" ? (
        <p className="mb-6 text-sm text-orange">Titel is verpligtend, en ’n item het ’n graad 10–12 nodig.</p>
      ) : null}
      {params.error === "stoor" ? (
        <p className="mb-6 text-sm text-orange">Kon nie die produk stoor nie.</p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Produkte
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">{items.length}</p>
        </article>
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Bundels
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">{bundles.length}</p>
        </article>
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Live-katalogus
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">R{catalogueValue}</p>
        </article>
      </div>

      <AdminPanel title="Nuwe produk">
        <form action={createProduct} className="grid gap-3 md:grid-cols-2">
          <label className="desk-label md:col-span-2">
            Titel
            <input className={deskField} name="title" required />
          </label>
          <label className="desk-label">
            Tipe lys
            <select className={deskField} name="listing_kind" defaultValue="item">
              <option value="item">Produk</option>
              <option value="bundle">Bundel</option>
            </select>
          </label>
          <label className="desk-label">
            Soort
            <select className={deskField} name="kind" defaultValue="Notas">
              {productKindOptions.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </select>
          </label>
          <label className="desk-label">
            Graad
            <select className={deskField} name="grade" defaultValue="11">
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
            <input className={deskField} name="price" type="number" min={0} defaultValue={80} />
          </label>
          <div className="md:col-span-2">
            <AdminBtn type="submit">Skep en wysig</AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <div className="mt-6">
        <AdminPanel title="Katalogus">
          {products.length === 0 ? (
            <AdminEmpty
              title="Nog geen produkte nie"
              body="Skep die eerste pak hierbo. Dit bly konsep tot jy dit publiseer."
            />
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id} className="desk-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{product.title}</p>
                      <AdminBadge tone={product.isPublished ? "live" : "draft"}>
                        {product.isPublished ? "Live" : "Konsep"}
                      </AdminBadge>
                      {product.listingKind === "bundle" ? <AdminBadge>Bundel</AdminBadge> : null}
                      {product.badge ? <AdminBadge tone="wait">{product.badge}</AdminBadge> : null}
                    </div>
                    <p className="text-sm text-white/55">
                      {product.kind}
                      {product.grade ? ` · Graad ${product.grade}` : ""}
                      {product.pages ? ` · ${product.pages} bladsye` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-xl font-extrabold text-white">R{product.price}</p>
                    <AdminBtn href={`/admin/products/${product.slug}`}>Wysig</AdminBtn>
                    <form action={deleteProduct}>
                      <input type="hidden" name="slug" value={product.slug} />
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
