import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const { pathname } = useLocation();
  const isWeekly = pathname === "/";
  const isDinners = pathname === "/dinners" || pathname.startsWith("/recipes");
  const isCookbook = pathname.startsWith("/cookbook");
  const isFan = pathname === "/fan";

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/favicon.png" alt="" className="w-6 h-6" />
          <span className="text-white text-xs font-black tracking-wider uppercase hidden sm:inline">The Split Plate</span>
        </Link>
        <div className="flex gap-1">
          <Link
            to="/"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isWeekly && !isDinners ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            This Week
          </Link>
          <Link
            to="/dinners"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isDinners ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Dinners
          </Link>
          <Link
            to="/cookbook"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isCookbook ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            Power-Ups
          </Link>
          <Link
            to="/fan"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isFan ? "bg-amber-500 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            The Fan
          </Link>
        </div>
      </div>
    </nav>
  );
}
