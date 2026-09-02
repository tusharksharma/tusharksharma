import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMyList } from "../hooks/useMyList";

/**
 * Floating "My List" drawer — the viewing surface for the recipe-page action
 * bar. Mounted once at the App level. Stays hidden until the reader has saved a
 * recipe or added a grocery line, so it never clutters a first visit.
 */
export default function MyListDrawer() {
  const { saved, grocery, removeSaved, toggleGrocery, removeGrocery, clearChecked, clearGrocery } = useMyList();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("grocery");

  const total = saved.length + grocery.length;

  // Nothing to show → don't render the button at all.
  useEffect(() => {
    if (total === 0 && open) setOpen(false);
  }, [total, open]);

  if (total === 0) return null;

  const groups = grocery.reduce((acc, g) => {
    (acc[g.source] ||= []).push(g);
    return acc;
  }, {});
  const checkedCount = grocery.filter((g) => g.checked).length;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open my list (${total} item${total === 1 ? "" : "s"})`}
          className="theme-fade fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-surface px-4 py-2.5 text-xs font-bold text-ink shadow-2xl print:hidden"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          My List
          <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] text-brandink">{total}</span>
        </button>
      )}

      {open && (
        <div className="theme-fade fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-2xl border border-line bg-surface shadow-2xl print:hidden sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96 sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTab("grocery")}
                className={`rounded-full px-3 py-1 text-xs font-bold ${tab === "grocery" ? "bg-brand text-brandink" : "text-muted hover:text-ink"}`}
              >
                Grocery ({grocery.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("saved")}
                className={`rounded-full px-3 py-1 text-xs font-bold ${tab === "saved" ? "bg-brand text-brandink" : "text-muted hover:text-ink"}`}
              >
                Saved ({saved.length})
              </button>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-faint hover:text-ink text-xl leading-none">
              &times;
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
            {tab === "grocery" &&
              (grocery.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">No grocery items yet. Add one from a recipe.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groups).map(([source, items]) => (
                    <div key={source}>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-faint">{source}</p>
                      <ul className="space-y-1">
                        {items.map((g) => (
                          <li key={g.id} className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={g.checked}
                              onChange={() => toggleGrocery(g.id)}
                              className="mt-1 accent-amber-500"
                            />
                            <span className={`flex-1 ${g.checked ? "text-faint line-through" : "text-ink"}`}>{g.line}</span>
                            <button type="button" onClick={() => removeGrocery(g.id)} aria-label="Remove" className="text-faint hover:text-ink">
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}

            {tab === "saved" &&
              (saved.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">No saved recipes yet.</p>
              ) : (
                <ul className="space-y-1">
                  {saved.map((s) => (
                    <li key={s.key} className="flex items-center gap-2 text-sm">
                      <Link to={s.href} onClick={() => setOpen(false)} className="flex-1 text-ink hover:text-brand">
                        {s.title}
                      </Link>
                      <button type="button" onClick={() => removeSaved(s.key)} aria-label="Remove" className="text-faint hover:text-ink">
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
          </div>

          {tab === "grocery" && grocery.length > 0 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs font-semibold">
              <button type="button" onClick={clearChecked} disabled={checkedCount === 0} className="text-muted enabled:hover:text-ink disabled:opacity-40">
                Clear checked ({checkedCount})
              </button>
              <button type="button" onClick={clearGrocery} className="text-muted hover:text-danger">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
