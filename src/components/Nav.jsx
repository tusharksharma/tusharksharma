import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  // back/forward navigation).
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/favicon.png" alt="" className="w-6 h-6" />
          <span className="text-white text-xs font-black tracking-wider uppercase">The Split Plate</span>
        </Link>

        {/* Desktop nav — hidden below md */}
        <div className="hidden md:flex gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 lg:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                l.match(pathname) ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Hamburger — only shown below md */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
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

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  l.match(pathname) ? "bg-amber-500 text-black" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
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
