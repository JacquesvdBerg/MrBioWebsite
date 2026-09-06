"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/(admin)/admin/actions";
import { AdminIcon } from "@/components/admin-icon";
import { DnaMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  adminNavGroups,
  adminNavItems,
  adminPageMeta,
  isAdminNavActive,
} from "@/lib/admin";

export function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const current = adminPageMeta(pathname);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQuery("");
        setOpen(false);
        return;
      }

      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return [];
    }
    return adminNavItems.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <>
      <aside className={`desk-sidebar ${open ? "is-open" : ""}`}>
        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-on-accent">
            <DnaMark className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-lime">
              MrBio desk
            </span>
            <span className="block font-display text-lg font-bold text-white">Beheer</span>
          </span>
        </div>

        <nav className="desk-nav" aria-label="Admin">
          {adminNavGroups.map((group) => (
            <div key={group.title} className="desk-nav-group">
              <p className="desk-nav-label">{group.title}</p>
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`desk-nav-link ${active ? "is-active" : ""}`}
                  >
                    <AdminIcon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-2 px-4 pb-5 pt-4">
          <Link href="/" className="desk-nav-link">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M14 5h6v6M20 5l-9 9" />
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
            </svg>
            Bekyk die werf
          </Link>
          <form action={signOut}>
            <button type="submit" className="desk-nav-link w-full">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M10 7H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4M15 16l4-4-4-4M19 12H9" />
              </svg>
              Teken uit
            </button>
          </form>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="desk-scrim"
          aria-label="Sluit kieslys"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="desk-main">
        <header className="desk-topbar">
          <button
            type="button"
            className="desk-icon-btn"
            aria-label="Open kieslys"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/45">
              {current?.label ?? "Admin"}
            </p>
            <p className="truncate text-sm text-white/65">
              {current?.description ?? "Beheerpaneel"}
            </p>
          </div>

          <div className="relative hidden min-w-[16rem] max-w-sm flex-1 md:block">
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Spring na…"
              className="desk-search"
              aria-label="Soek in die paneel"
            />
            {query ? null : <span className="desk-search-kbd">/</span>}
            {results.length > 0 ? (
              <div className="desk-search-results">
                {results.map((item) => (
                  <Link key={item.href} href={item.href} className="desk-search-item">
                    <AdminIcon name={item.icon} />
                    <span>
                      <span className="block font-bold text-white">{item.label}</span>
                      <span className="block text-xs text-white/50">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <ThemeToggle />
          <Link href="/" className="desk-ghost-btn hidden sm:inline-flex">
            Werf
          </Link>
          <span className="desk-user">
            <span className="desk-user-mark">MB</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold text-white">MrBio</span>
              <span className="block text-[11px] text-white/50">Eienaar</span>
            </span>
          </span>
        </header>
        <div className="desk-content">{children}</div>
      </div>
    </>
  );
}
