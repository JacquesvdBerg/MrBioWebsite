export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "mrbio-theme";

/**
 * Runs inline in <head> before hydration so the chosen theme is applied
 * before first paint (no flash). Must stay dependency-free and ES5-safe.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function readTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function getServerTheme(): Theme {
  return "dark";
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, disabled cookies); the
    // attribute still applies for this page view.
  }
  emit();
}
