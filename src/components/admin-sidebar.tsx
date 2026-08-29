"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(admin)/admin/actions";
import { DnaMark } from "@/components/icons";
import { adminNav } from "@/lib/site";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-white md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream ring-1 ring-line">
          <DnaMark className="h-6 w-6" />
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-green">
            Admin
          </span>
          <span className="block font-display font-bold text-navy">
            Beheerpaneel
          </span>
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-navy text-white"
                  : "text-muted hover:bg-cream hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted hover:bg-cream hover:text-navy"
          >
            Teken uit
          </button>
        </form>
      </div>
    </aside>
  );
}
