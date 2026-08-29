import { AdminSidebar } from "@/components/admin-sidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream md:flex-row">
      <AdminSidebar />
      <div className="flex-1 px-4 py-8 md:px-8">{children}</div>
    </div>
  );
}
