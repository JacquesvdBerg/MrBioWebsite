"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MrBioLogo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Arrow } from "@/components/ui";
import { publicNav, type NavChild, type NavItem } from "@/lib/site";

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/") {
    return pathname === "/";
  }
  const hrefs = [item.href, ...(item.children?.map((child) => child.href) ?? [])];
  return hrefs.some((href) => !href.includes("#") && pathname.startsWith(href));
}

function NavIcon({ kind }: { kind: NavChild["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20M9 8h7M9 12h5" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14Z" />
          <path d="M5 19c3-4 6-7 10-10" />
        </svg>
      );
    case "puzzle":
      return (
        <svg {...common}>
          <path d="M9 4h3a2 2 0 1 1 4 0h3v5a2 2 0 1 1 0 4v6h-5a2 2 0 1 1-4 0H5v-5a2 2 0 1 1 0-4V4h4Z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z" />
          <path d="M8 9h8M8 12.5h5" />
        </svg>
      );
    case "forum":
      return (
        <svg {...common}>
          <path d="M3 5h12v8H7l-4 3z" />
          <path d="M15 9h6v8l-3-2h-6v-2" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M6 7h13l-1.5 8h-10z" />
          <path d="M6 7 5 4H3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        </svg>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8h12l1 12H5z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function SiteHeader({
  account,
}: {
  account?: { name: string; isAdmin: boolean } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        const bar = progressRef.current;
        if (bar) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
          bar.style.transform = `scaleX(${ratio})`;
        }
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The hover pill is driven straight from the DOM so it can glide between
  // links without re-rendering the whole header on every pointer move.
  const moveIndicator = useCallback((target: HTMLElement | null) => {
    const nav = navRef.current;
    const pill = indicatorRef.current;
    if (!nav || !pill) {
      return;
    }
    if (!target) {
      pill.style.opacity = "0";
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    pill.style.opacity = "1";
    pill.style.transform = `translateX(${rect.left - navRect.left}px)`;
    pill.style.width = `${rect.width}px`;
  }, []);

  const restIndicator = useCallback(() => {
    const active = navRef.current?.querySelector<HTMLElement>("[data-active='true']");
    moveIndicator(active ?? null);
  }, [moveIndicator]);

  useEffect(() => {
    restIndicator();
    // Re-measure once fonts have settled so the pill lands exactly.
    const timer = window.setTimeout(restIndicator, 350);
    return () => window.clearTimeout(timer);
  }, [pathname, restIndicator]);

  function openMenu(key: string) {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMenu(key);
  }

  function scheduleClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
    }
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  }

  return (
    <header
      className={`site-header sticky top-0 z-50 ${scrolled || open ? "is-scrolled" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMenu(null);
          setOpen(false);
        }
      }}
    >
      <div className="site-header-bar">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 md:px-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="MrBio tuis">
            <MrBioLogo />
          </Link>

          <div
            ref={navRef}
            className="relative mx-auto hidden items-center lg:flex"
            onPointerLeave={() => {
              restIndicator();
              scheduleClose();
            }}
          >
            <span ref={indicatorRef} className="nav-pill" aria-hidden />
            <nav className="relative flex items-center gap-0.5" aria-label="Hoofkieslys">
              {publicNav.map((item) => {
                const active = isActive(pathname, item);
                const hasChildren = Boolean(item.children?.length);
                const isOpen = menu === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onPointerEnter={(event) => {
                      moveIndicator(event.currentTarget.firstElementChild as HTMLElement);
                      if (hasChildren) {
                        openMenu(item.label);
                      } else {
                        setMenu(null);
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      data-active={active}
                      aria-expanded={hasChildren ? isOpen : undefined}
                      aria-haspopup={hasChildren ? "menu" : undefined}
                      onFocus={(event) => {
                        moveIndicator(event.currentTarget);
                        if (hasChildren) {
                          openMenu(item.label);
                        }
                      }}
                      className={`nav-link ${active ? "is-active" : ""}`}
                    >
                      {item.label}
                      {hasChildren ? (
                        <svg
                          viewBox="0 0 24 24"
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      ) : null}
                    </Link>

                    {hasChildren ? (
                      <div
                        className={`nav-panel ${isOpen ? "is-open" : ""} ${
                          item.children && item.children.length > 2 ? "nav-panel-wide" : ""
                        }`}
                        onPointerEnter={() => openMenu(item.label)}
                      >
                        <div className="nav-panel-grid">
                          {item.children?.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="nav-child"
                              onClick={() => setMenu(null)}
                            >
                              <span className="nav-child-icon">
                                <NavIcon kind={child.icon} />
                              </span>
                              <span>
                                <span className="block text-sm font-bold text-white">
                                  {child.label}
                                </span>
                                <span className="mt-0.5 block text-[12.5px] leading-5 text-white/55">
                                  {child.description}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={item.href}
                          className="nav-panel-foot"
                          onClick={() => setMenu(null)}
                        >
                          Sien alles onder {item.label.toLowerCase()}
                          <Arrow className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {account ? (
              <Link
                href="/rekening"
                className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-bold text-white/65 transition-colors hover:text-white xl:inline-flex"
              >
                {account.name}
              </Link>
            ) : (
              <Link
                href="/rekening"
                className="hidden rounded-full px-3.5 py-2 text-[13.5px] font-bold text-white/65 transition-colors hover:text-white xl:inline-flex"
              >
                Teken in
              </Link>
            )}
            <Link href="/shop" className="btn btn-lime btn-sm">
              <BagIcon />
              Winkel
            </Link>

            <button
              type="button"
              className="inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-white/12 bg-white/5 lg:hidden"
              aria-expanded={open}
              aria-controls="site-nav"
              aria-label={open ? "Sluit kieslys" : "Open kieslys"}
              onClick={() => setOpen((current) => !current)}
            >
              <span
                className={`h-[2px] w-[18px] rounded bg-white transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`h-[2px] w-[18px] rounded bg-white transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-[2px] w-[18px] rounded bg-white transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
        <span ref={progressRef} className="site-progress" aria-hidden />
      </div>

      <div
        id="site-nav"
        className={`fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto bg-bg px-4 pb-10 transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="mx-auto mt-4 grid max-w-md gap-5" aria-label="Mobiele kieslys">
          {publicNav.map((item, index) => {
            const active = isActive(pathname, item);
            const delay = open ? `${index * 45}ms` : "0ms";
            const motion = open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0";
            if (!item.children) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: delay }}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 font-display text-xl font-bold transition-all duration-300 ${motion} ${
                    active
                      ? "border-lime/40 bg-lime/10 text-lime"
                      : "border-white/10 bg-white/4 text-white"
                  }`}
                >
                  {item.label}
                  <Arrow className="h-5 w-5 opacity-60" />
                </Link>
              );
            }
            return (
              <div
                key={item.label}
                style={{ transitionDelay: delay }}
                className={`rounded-2xl border border-white/10 bg-white/4 p-2 transition-all duration-300 ${motion}`}
              >
                <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                  {item.label}
                </p>
                <div className="grid">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-colors hover:bg-white/6"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/6 text-lime">
                        <NavIcon kind={child.icon} />
                      </span>
                      <span>
                        <span className="block font-display text-base font-bold">
                          {child.label}
                        </span>
                        <span className="block text-[12.5px] text-white/50">
                          {child.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <div
            className={`flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-5 py-3 transition-all duration-300 ${
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: open ? `${publicNav.length * 45}ms` : "0ms" }}
          >
            <span className="text-sm font-bold text-white/70">Voorkoms</span>
            <ThemeToggle />
          </div>

          <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-lime btn-lg">
            <BagIcon />
            Kry studiemateriaal
          </Link>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-white/50">
            <Link href="/contact" onClick={() => setOpen(false)}>
              Kontak
            </Link>
            <Link href="/rekening" onClick={() => setOpen(false)}>
              {account ? account.name : "Teken in"}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
