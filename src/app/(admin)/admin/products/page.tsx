import { AdminPage } from "@/components/admin-page";
import {
  AdminBadge,
  AdminEmpty,
  AdminPanel,
  AdminSoon,
} from "@/components/admin-ui";
import { bundles, products } from "@/lib/shop-data";

export const metadata = {
  title: "Produkte",
};

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const total = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <AdminPage
      title="Produkte"
      description="Wat ’n nota-pak bevat, hoe dit geprys word, en of dit te koop is — dit alles hoort hier. Tot die katalogus gekoppel is, sien jy die konsep wat tans op die werf staan."
    >
      <AdminSoon
        title="Katalogus wag op jou besluite"
        body="Bladsye, diagramme, memorandum, graad, prys — jy stel dit hier in wanneer julle besluit hoe ’n pak lyk. Geen stoor-knoppie nog nie, sodat niks stilweg verdwyn nie."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Konsep-produkte
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">{products.length}</p>
        </article>
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Bundels
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">{bundles.length}</p>
        </article>
        <article className="desk-stat">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            Katalogus-waarde
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold text-white">R{total}</p>
        </article>
      </div>

      <div className="mt-6">
        <AdminPanel title="Konsep-katalogus">
          {products.length === 0 ? (
            <AdminEmpty
              title="Geen produkte nie"
              body="Wanneer die eerste pak gereed is, verskyn dit hier en op /shop."
            />
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.slug} className="desk-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-white">{product.title}</p>
                      <AdminBadge tone="wait">Konsep</AdminBadge>
                      {product.badge ? <AdminBadge>{product.badge}</AdminBadge> : null}
                    </div>
                    <p className="text-sm text-white/55">
                      Graad {product.grade} · {product.kind}
                      {product.pages ? ` · ${product.pages} bladsye` : ""}
                    </p>
                    <p className="mt-1 text-sm text-white/55">{product.bullets.join(" · ")}</p>
                  </div>
                  <p className="font-display text-xl font-extrabold text-white">R{product.price}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <div className="mt-6">
        <AdminPanel title="Bundels">
          <ul>
            {bundles.map((bundle) => (
              <li key={bundle.title} className="desk-row">
                <div>
                  <p className="font-display font-bold text-white">{bundle.title}</p>
                  <p className="text-sm text-white/55">{bundle.body}</p>
                </div>
                <div className="text-right">
                  {bundle.was ? (
                    <p className="text-xs text-white/55 line-through">R{bundle.was}</p>
                  ) : null}
                  <p className="font-display text-xl font-extrabold text-white">R{bundle.price}</p>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}
