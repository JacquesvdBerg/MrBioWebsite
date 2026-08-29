"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DnaMark, SearchIcon } from "@/components/icons";
import { publicNav, siteName, siteTagline } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-sm)] ring-1 ring-line">
            <DnaMark className="h-7 w-7" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-bold text-navy md:text-xl">
              {siteName}
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
              {siteTagline}
            </span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-0.5 rounded-full border border-line bg-white/70 px-1.5 py-1.5 shadow-[var(--shadow-sm)] lg:flex">
          {publicNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href.startsWith("/#")
                  ? false
                  : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "text-navy/70 hover:bg-cream-dark/70 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy transition-colors hover:bg-cream-dark lg:inline-flex"
            aria-label="Soek"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </button>

          <Link
            href="/login"
            className="rounded-full bg-green px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(47,163,74,0.32)] transition-colors hover:bg-green-deep"
          >
            Teken in
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line bg-white lg:hidden"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Sluit kieslys" : "Open kieslys"}
            onClick={() => setOpen((current) => !current)}
          >
            <span
              className={`h-[2px] w-4 rounded bg-navy transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`h-[2px] w-4 rounded bg-navy transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-[2px] w-4 rounded bg-navy transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-nav"
          className="border-t border-line bg-cream px-4 pb-4 pt-2 lg:hidden"
        >
          <ul className="grid gap-1">
            {publicNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.href.startsWith("/#")
                    ? false
                    : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      active ? "bg-navy text-white" : "text-navy/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
