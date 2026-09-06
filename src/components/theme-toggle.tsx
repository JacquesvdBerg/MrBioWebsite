"use client";

import { useSyncExternalStore } from "react";
import {
  getServerTheme,
  readTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, getServerTheme);
  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Skakel na donker modus" : "Skakel na lig modus"}
      title={isLight ? "Donker modus" : "Lig modus"}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className={`theme-toggle ${className}`}
    >
      <span className="theme-toggle-track" aria-hidden>
        <span className="theme-toggle-icon theme-toggle-moon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
          </svg>
        </span>
        <span className="theme-toggle-icon theme-toggle-sun">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </span>
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
