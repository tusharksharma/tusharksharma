import { useSyncExternalStore } from "react";

const KEY = "tsp-theme";
const EVENT = "tsp-theme-change";

/**
 * Resolve the theme the same way the pre-flight script in index.html does:
 * an explicit stored choice wins, otherwise follow the OS.
 */
function resolveInitial() {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode — fall through to OS preference */
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Site-wide light/dark theme.
 *
 * A single module-level value shared by every caller (App applies it to
 * <html>, Nav and the recipe header render the toggle) via useSyncExternalStore
 * — so two toggles can't drift out of sync. The token set in src/index.css
 * now backs the whole site, so the theme persists across navigation instead of
 * being scoped to the recipe page. index.html pre-applies `data-theme` before
 * hydration to avoid a flash.
 *
 * Returns `[theme, toggle]`.
 */

let current = resolveInitial();

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

function setTheme(next) {
  if (next === current) return;
  current = next;
  emit();
}

function subscribe(cb) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // cross-tab
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return "dark";
}

// Follow the OS only for readers who have never picked a side themselves.
if (typeof window !== "undefined") {
  const mq = window.matchMedia?.("(prefers-color-scheme: light)");
  mq?.addEventListener?.("change", (e) => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      /* no storage — treat as "never chose" and follow the OS */
    }
    setTheme(e.matches ? "light" : "dark");
  });
}

export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* choice just won't survive the session */
    }
    setTheme(next);
  };
  return [theme, toggle];
}
