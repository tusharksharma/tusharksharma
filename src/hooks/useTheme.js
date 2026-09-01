import { useCallback, useEffect, useState } from "react";

const KEY = "tsp-theme";

/**
 * Resolve the theme the same way the pre-flight script in index.html does:
 * an explicit stored choice wins, otherwise follow the OS.
 */
function resolveTheme() {
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
 * Light/dark theme for the recipe page.
 *
 * Applies `data-theme` to <html> while mounted and removes it on unmount.
 * That scoping is deliberate: only RecipeDetail and Nav read the semantic
 * tokens in index.css, so leaving `data-theme="light"` set after navigating
 * to, say, /dinners would give a light nav bar over a still-dark page. When
 * the token refactor reaches the rest of the site this hook should move up to
 * App and drop the cleanup.
 *
 * Returns `[theme, toggle]`.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(resolveTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    return () => root.removeAttribute("data-theme");
  }, [theme]);

  // Follow the OS only for readers who have never picked a side themselves.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!mq) return;
    const onChange = (e) => {
      try {
        if (localStorage.getItem(KEY)) return;
      } catch {
        /* no storage — treat as "never chose" and follow the OS */
      }
      setTheme(e.matches ? "light" : "dark");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* choice just won't survive the session */
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
