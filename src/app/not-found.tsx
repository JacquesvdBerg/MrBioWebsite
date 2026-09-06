import SiteNotFound from "@/app/(site)/not-found";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Unmatched URLs resolve here (route-group not-found files only catch
// notFound() calls inside their segment), so wrap the public 404 in the
// public chrome instead of showing Next's bare default.
export default function RootNotFound() {
  return (
    <div className="mrbio">
      <SiteHeader />
      <main className="flex-1">
        <SiteNotFound />
      </main>
      <SiteFooter />
    </div>
  );
}
