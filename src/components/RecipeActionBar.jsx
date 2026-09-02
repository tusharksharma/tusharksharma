import { useState } from "react";
import { useMyList } from "../hooks/useMyList";

/* Small inline icons so the bar carries no icon-font dependency. */
function Icon({ path, filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const HEART = <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />;
const SHARE = <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></>;
const CART = <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>;

function ActionButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-brand bg-brand/15 text-brand"
          : "border-line bg-surface2 text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function RecipeActionBar({ saveEntry, ingredients }) {
  const { isSaved, toggleSave, addGrocery } = useMyList();
  const saved = isSaved(saveEntry.key);
  const [shared, setShared] = useState(false);
  const [added, setAdded] = useState(null);

  const shareUrl = () =>
    typeof window !== "undefined" ? window.location.origin + saveEntry.href : saveEntry.href;

  const onShare = async () => {
    const url = shareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: saveEntry.title, url });
      } catch {
        /* user dismissed the share sheet — nothing to do */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const onAdd = () => {
    const n = addGrocery(ingredients, saveEntry.title);
    setAdded(n);
    setTimeout(() => setAdded(null), 1800);
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
      <ActionButton onClick={() => toggleSave(saveEntry)} active={saved}>
        <Icon path={HEART} filled={saved} />
        {saved ? "Saved" : "Save"}
      </ActionButton>

      <ActionButton onClick={onShare}>
        <Icon path={SHARE} />
        {shared ? "Link copied" : "Share"}
      </ActionButton>

      {ingredients.length > 0 && (
        <ActionButton onClick={onAdd}>
          <Icon path={CART} />
          {added != null ? (added > 0 ? `Added ${added}` : "Already on list") : "Add to grocery list"}
        </ActionButton>
      )}
    </div>
  );
}

/** Sticky in-page jump control between the two long sections. */
export function StickyJump() {
  return (
    <nav className="theme-fade sticky top-12 z-10 -mx-4 mb-2 border-b border-line bg-page/90 px-4 py-2 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-3xl gap-2 text-xs font-bold">
        <a href="#ingredients" className="rounded-full border border-line px-3 py-1 text-muted transition-colors hover:text-ink">
          Ingredients
        </a>
        <a href="#method" className="rounded-full border border-line px-3 py-1 text-muted transition-colors hover:text-ink">
          Method
        </a>
      </div>
    </nav>
  );
}
