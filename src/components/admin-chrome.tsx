"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/(admin)/admin/actions";
import { AdminIcon } from "@/components/admin-icon";
import { initialsOf } from "@/components/admin-ui";
import { MrBioMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  adminGroupFor,
  adminNavGroups,
  adminNavItems,
  adminPageMeta,
  adminQuickActions,
  isAdminNavActive,
  type AdminNavItem,
} from "@/lib/admin";

export type AdminCounts = Partial<Record<string, number>>;

export function AdminChrome({
  children,
  counts = {},
  user,
}: {
  children: ReactNode;
  /** Badge numbers keyed by nav href, e.g. unread chats on /admin/live-chat. */
  counts?: AdminCounts;
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [seenPath, setSeenPath] = useState(pathname);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = adminPageMeta(pathname);
  const group = adminGroupFor(pathname);

  // Close the drawer and clear the search whenever the page changes.
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
    setQuery("");
  }

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
        searchRef.current?.blur();
        return;
      }

      const isPalette = (event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!isPalette && !isSlash) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (isSlash && (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable)) {
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
      return { pages: [] as AdminNavItem[], actions: [] as AdminNavItem[] };
    }
    const match = (item: AdminNavItem) =>
      item.label.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle);
    return {
      pages: adminNavItems.filter(match),
      actions: adminQuickActions.filter(match),
    };
  }, [query]);

  const firstResult = results.pages[0] ?? results.actions[0] ?? null;
  const hasResults = results.pages.length + results.actions.length > 0;

  return (
    <>
      <aside className={`desk-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/admin" className="desk-brand">
          <MrBioMark className="h-11 w-11" />
          <span className="leading-tight">
            <span className="block font-display text-xl font-extrabold tracking-[-0.03em] text-white">
              Mnr<span className="text-lime">Bio</span>
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Lessenaar
            </span>
          </span>
        </Link>

        <nav className="desk-nav" aria-label="Admin">
          {adminNavGroups.map((navGroup) => (
            <div key={navGroup.title} className="desk-nav-group">
              <p className="desk-nav-label">{navGroup.title}</p>
              {navGroup.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href);
                const count = counts[item.href] ?? 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`desk-nav-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <AdminIcon name={item.icon} className="h-[1.1rem] w-[1.1rem]" />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 ? (
                      <span className="desk-nav-count" aria-label={`${count} nuut`}>
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="desk-side-foot">
          <span className="desk-user-mark">{initialsOf(user.name)}</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-bold text-white">{user.name}</span>
            <span className="block truncate text-[11px] text-white/50">{user.email}</span>
          </span>
          <Link
            href="/"
            className="desk-side-btn"
            target="_blank"
            rel="noreferrer"
            aria-label="Bekyk die werf"
            title="Bekyk die werf"
          >
            <AdminIcon name="external" className="h-[1.1rem] w-[1.1rem]" />
          </Link>
          <form action={signOut}>
            <button type="submit" className="desk-side-btn" aria-label="Teken uit" title="Teken uit">
              <AdminIcon name="logout" className="h-[1.1rem] w-[1.1rem]" />
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

          <nav className="desk-crumbs min-w-0 flex-1" aria-label="Broodkrummels">
            <Link href="/admin">Lessenaar</Link>
            {group && group !== "Werk" ? (
              <>
                <span aria-hidden>/</span>
                <span className="hidden sm:inline">{group}</span>
                <span aria-hidden className="hidden sm:inline">/</span>
              </>
            ) : (
              <span aria-hidden>/</span>
            )}
            <span className="truncate font-bold text-white">{current?.label ?? "Oorsig"}</span>
          </nav>

          <div className="desk-search-wrap">
            <AdminIcon name="search" className="desk-search-icon h-4 w-4" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && firstResult) {
                  event.preventDefault();
                  router.push(firstResult.href);
                }
              }}
              placeholder="Soek of skep…"
              className="desk-search"
              aria-label="Soek in die lessenaar"
            />
            {query ? null : <span className="desk-search-kbd">Ctrl K</span>}
            {query ? (
              <div className="desk-search-results">
                {hasResults ? (
                  <>
                    {results.pages.length > 0 ? (
                      <p className="desk-search-group">Bladsye</p>
                    ) : null}
                    {results.pages.map((item) => (
                      <SearchItem key={item.href} item={item} />
                    ))}
                    {results.actions.length > 0 ? (
                      <p className="desk-search-group">Aksies</p>
                    ) : null}
                    {results.actions.map((item) => (
                      <SearchItem key={`action-${item.href}-${item.label}`} item={item} />
                    ))}
                  </>
                ) : (
                  <p className="px-4 py-5 text-sm text-white/50">Niks gevind vir “{query}” nie.</p>
                )}
              </div>
            ) : null}
          </div>

          <ThemeToggle />
        </header>
        <div className="desk-content">{children}</div>
      </div>
    </>
  );
}

function SearchItem({ item }: { item: AdminNavItem }) {
  return (
    <Link href={item.href} className="desk-search-item">
      <span className="desk-tile is-small">
        <AdminIcon name={item.icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-white">{item.label}</span>
        <span className="block truncate text-xs text-white/50">{item.description}</span>
      </span>
    </Link>
  );
}
