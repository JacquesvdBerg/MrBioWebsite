import { AdminChrome } from "@/components/admin-chrome";
import { requireAdmin } from "@/lib/require-admin";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="mrbio desk">
      <AdminChrome>{children}</AdminChrome>
    </div>
  );
}
