import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useTheme from "../hooks/useTheme";

function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      title={theme === "light" ? "Dark theme" : "Light theme"}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-surface2 transition-colors"
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {theme === "light" ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}

const LINKS = [
  { to: "/", label: "This Week", match: (p) => p === "/" && !(p === "/dinners" || p.startsWith("/recipes")) },
  { to: "/dinners", label: "Dinners", match: (p) => p === "/dinners" || p.startsWith("/recipes") },
  { to: "/cookbook", label: "Power-Ups", match: (p) => p.startsWith("/cookbook") },
  { to: "/leftovers", label: "Leftovers", match: (p) => p.startsWith("/leftovers") },
  { to: "/fan", label: "The Fan", match: (p) => p === "/fan" },
  { to: "/favorites", label: "Favorites", match: (p) => p.startsWith("/favorites") },
];

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes (in-drawer link tap or
  // back/forward navigation). Intentional cross-system sync from routing to
  // component state; the drawer doesn't have a good "external subscribe" model.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    // Nav reads the semantic theme tokens (src/index.css) because it sits above
    // the recipe page, which can be in light mode. Off a recipe route no
    // data-theme is set, so the :root dark values apply and it matches the rest
    // of the site.
    <nav className="theme-fade border-b border-line bg-page/90 backdrop-blur-sm sticky top-0 z-20 print:hidden">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/favicon.png" alt="" className="w-6 h-6" />
          <span className="text-ink text-xs font-black tracking-wider uppercase">The Split Plate</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop nav — hidden below md */}
          <div className="hidden md:flex gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  l.match(pathname) ? "bg-brand text-brandink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Theme toggle — visible on every route + breakpoint */}
          <ThemeToggle />

          {/* Hamburger — only shown below md */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-ink hover:bg-surface2 transition-colors"
          >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-line bg-page">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  l.match(pathname) ? "bg-brand text-brandink" : "text-muted hover:bg-surface2 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
