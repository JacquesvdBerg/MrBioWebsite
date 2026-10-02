import { createProduct, deleteProduct } from "@/app/(admin)/admin/actions";
import { DeleteButton } from "@/components/admin-client";
import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminBtn,
  AdminEmpty,
  AdminNotice,
  AdminPanel,
  AdminStat,
  deskField,
} from "@/components/admin-ui";
import { Visual } from "@/components/visual";
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
      description="Notas, pakke en bundels. Die winkel werk met navrae — geen aanlyn betaling nie. Net gepubliseerde items verskyn op /shop."
      actions={
        <AdminBtn href="/shop" tone="ghost" icon="external" external>
          Bekyk winkel
        </AdminBtn>
      }
    >
      {params.error === "fields" ? (
        <AdminNotice tone="err">Titel is verpligtend, en ’n item het ’n graad nodig.</AdminNotice>
      ) : null}
      {params.error === "stoor" ? <AdminNotice tone="err">Kon nie die produk stoor nie.</AdminNotice> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Produkte" value={items.length} hint="Enkel pakke" icon="cart" tone="amber" />
        <AdminStat label="Bundels" value={bundles.length} hint="Meer vir minder" icon="list" tone="violet" />
        <AdminStat
          label="Live-katalogus"
          value={`R${catalogueValue}`}
          hint={`${live.length} van ${products.length} te koop`}
          icon="spark"
          tone="green"
          progress={products.length ? live.length / products.length : 0}
        />
      </div>

      <AdminPanel title="Nuwe produk" icon="plus" collapsible defaultOpen={products.length === 0}>
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
            <AdminBtn type="submit" icon="arrow">
              Skep en wysig
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>

      <div className="mt-6">
        {products.length === 0 ? (
          <AdminPanel>
            <AdminEmpty
              icon="cart"
              title="Nog geen produkte nie"
              body="Skep die eerste pak hierbo. Dit bly konsep tot jy dit publiseer."
            />
          </AdminPanel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="desk-product">
                <div className="relative">
                  <Visual file={product.imagePath} alt="" ratio="16/9" tone={product.tone} sizes="360px" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <AdminBadge tone={product.isPublished ? "live" : "draft"}>
                      {product.isPublished ? "Live" : "Konsep"}
                    </AdminBadge>
                    {product.listingKind === "bundle" ? <AdminBadge>Bundel</AdminBadge> : null}
                    {product.badge ? <AdminBadge tone="wait">{product.badge}</AdminBadge> : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/50">
                    {product.kind}
                    {product.grade ? ` · Graad ${product.grade}` : ""}
                    {product.pages ? ` · ${product.pages} bl.` : ""}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-snug text-white">{product.title}</h3>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <p className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                      R{product.price}
                      {product.wasPrice ? (
                        <span className="ml-2 text-sm font-semibold text-white/40 line-through">R{product.wasPrice}</span>
                      ) : null}
                    </p>
                    <div className="flex items-center gap-1">
                      <form action={deleteProduct}>
                        <input type="hidden" name="slug" value={product.slug} />
                        <DeleteButton label="" confirm="Verwyder hierdie produk uit die katalogus?" />
                      </form>
                      <AdminBtn href={`/admin/products/${product.slug}`} size="sm">
                        Wysig
                      </AdminBtn>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminPage>
  );
}
