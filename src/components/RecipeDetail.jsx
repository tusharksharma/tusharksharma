import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import track from "../hooks/useTrack";
import { liveRecipes } from "../data/recipes";
import cardImage from "../utils/cardImage";
import { balanceColumns, buildCookbookModel, buildRecipeModel, flattenSteps, ingredientText, isGroupHeader, parseGroups } from "../utils/recipeModel";
import CookingMode from "./CookingMode";
import LeftoversPanel from "./LeftoversPanel";
import RecipeActionBar, { StickyJump } from "./RecipeActionBar";

/*
 * Recipe page.
 *
 * Ordered around the dinner decision, not around the archive: hero image,
 * what it is, the six facts that decide whether you cook it, what could hurt
 * you, what to buy, how to cook it, how the two plates differ — then the
 * expertise material, then the video, then the promotional cards.
 *
 * Section order and shape come from buildRecipeModel(), so a split recipe and
 * a standard recipe render the same page with the same headings; a recipe
 * missing a section just drops it.
 */

/* Tone → token classes. Every surface reads from a semantic token so light
   mode is a theme rather than an inversion (see src/index.css). */
const TONE = {
  shared: { text: "text-brand", chip: "bg-brand/12 text-brand border-brand/30", dot: "bg-brand text-brandink" },
  adult: { text: "text-adult", chip: "bg-adultsoft text-adult border-adultline", dot: "bg-adult text-white" },
  kid: { text: "text-kid", chip: "bg-kidsoft text-kid border-kidline", dot: "bg-kid text-white" },
  danger: { text: "text-danger", chip: "bg-dangersoft text-danger border-dangerline", dot: "bg-danger text-white" },
  ok: { text: "text-ok", chip: "bg-ok/12 text-ok border-ok/30", dot: "bg-ok text-white" },
  brand: { text: "text-brand", chip: "bg-brand/12 text-brand border-brand/30", dot: "bg-brand text-brandink" },
  muted: { text: "text-muted", chip: "bg-surface2 text-muted border-line", dot: "bg-surface2 text-muted" },
  split: { text: "text-ink", chip: "bg-gradient-to-r from-adultsoft to-kidsoft text-ink border-line", dot: "" },
};
const tone = (t) => TONE[t] || TONE.muted;

/**
 * Renders one recipe. `recipe` is a dinner from data/recipes; `item` is a
 * cookbook entry from data/cookbook. Both are normalized to the same model so
 * the section order is identical either way — the dinner-only interactions
 * (household scaling, leftovers, related dinners, print card) are the only
 * things gated on which one it is.
 */
export default function RecipeDetail({ recipe, item, group }) {
  const [searchParams] = useSearchParams();
  const model = useMemo(
    () => (recipe ? buildRecipeModel(recipe) : buildCookbookModel(item, group)),
    [recipe, item, group]
  );
  const isDinner = model.kind === "dinner";

  const [adults, setAdults] = useState(() => { const v = searchParams.get("adults"); return v !== null ? Number(v) || 1 : 2; });
  const [kids, setKids] = useState(() => { const v = searchParams.get("kids"); return v !== null ? Number(v) : 2; });
  const [leftovers, setLeftovers] = useState(() => searchParams.get("leftovers") === "1");
  const [checked, setChecked] = useState(() => new Set());
  const [cooking, setCooking] = useState(false);
  const [kidChoice, setKidChoice] = useState(0);

  const baseServings = (recipe || item).servings || 4;
  // fixedBatch recipes (e.g. one-bake meal preps that yield N containers) do
  // NOT scale by household size or leftovers — the batch quantity IS the
  // recipe. Scaling would ask the shopper to buy 2x tomatoes but the recipe
  // still says "one 45-min bake".
  // A cookbook entry's yield IS the recipe (a batch of sauce, a tray of
  // brownies), so it never scales by household — same rule as fixedBatch.
  const isFixedBatch = !isDinner || !!recipe.meta?.fixedBatch;
  const totalServings = isFixedBatch ? baseServings : adults + kids;
  const scale = isFixedBatch ? 1 : (totalServings / baseServings) * (leftovers ? 2 : 1);

  const cookSteps = useMemo(() => flattenSteps(model), [model]);

  // Shared + adult groups, then the selected kid lane, balanced across two
  // desktop columns as one list.
  const ingredientColumns = useMemo(() => {
    const choice = model.kidIngredientChoices[kidChoice];
    const kidGroups = choice
      ? parseGroups(choice.extraIngredients, {
          fallbackTitle: model.split?.kid.label || "Kid plate",
          tone: "kid",
          idPrefix: choice.id,
        })
      : [];
    return balanceColumns([...model.ingredientGroups, ...kidGroups], 2);
  }, [model, kidChoice]);

  const flatIngredients = useMemo(() => {
    const all = model.ingredientGroups.flatMap((g) => g.items);
    for (const choice of model.kidIngredientChoices) all.push(...choice.extraIngredients);
    return all.map((i) => scaleIngredientText(ingredientText(i), scale));
  }, [model, scale]);

  const saveEntry = useMemo(
    () =>
      recipe
        ? { key: `recipe:${recipe.id}`, kind: "recipe", title: model.title, href: `/recipes/${recipe.slug}` }
        : { key: `cookbook:${item.id}`, kind: "cookbook", title: model.title, href: `/cookbook/${item.id}` },
    [recipe, item, model.title]
  );

  const toggleCheck = (key) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="theme-fade min-h-screen bg-page text-ink">
      <RecipeHeader model={model} />

      {/* Compact print-only recipe card (2 pages max). Screen users see the
          full article below; print rendering swaps to this stripped view. */}
      <PrintCard model={model} />

      <article className="mx-auto max-w-3xl px-4 pb-16 print:hidden">
        {/* ── 1. Hero image. 4:3 on mobile, 16:9 on desktop. The video used to
               live here and ate the whole first screen; it now sits at the
               bottom under "Watch the full cook".

               Source photos are much taller than the frame, so `object-cover`
               throws away most of the height and a centred crop can land on the
               side dish instead of the protein. `imagePosition` lets a recipe
               anchor the crop on its own subject; leave it unset for the
               centred default. ── */}
        {model.hero.src && (
          <img
            {...cardImage(model.hero.src, { sizes: "(min-width: 768px) 768px, 100vw" })}
            alt={model.hero.alt}
            width="1280"
            height="960"
            className="mt-4 aspect-[4/3] w-full rounded-2xl border border-line object-cover sm:aspect-video"
            style={model.hero.position ? { objectPosition: model.hero.position } : undefined}
            fetchPriority="high"
          />
        )}

        {/* ── 2. The decision block. ── */}
        <header className="mt-6">
          {model.badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {model.badges.map((b, i) => (
                <span
                  key={i}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone(b.tone).chip}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}

          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {model.title}
          </h1>

          {model.hook && (
            <p className="mt-3 text-base leading-relaxed text-muted">{model.hook}</p>
          )}

          {model.makeThisWhen && (
            <div className="mt-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                Make this when
              </span>
              <p className="mt-1 text-sm leading-relaxed text-ink">{model.makeThisWhen}</p>
            </div>
          )}

          {/* ── 3. At-a-glance facts. ── */}
          {model.facts.length > 0 && <FactsRow facts={model.facts} />}

          {/* ── 4. Safety. Allergens and food-safety warnings stay visible;
                 label/macro caveats moved into Nutrition details. ── */}
          <SafetyBand safety={model.safety} />

          {/* Cookbook entries lead with what the result should taste like and,
              where it exists, the ratio you must not improvise. */}
          {model.callouts.map((c) => (
            <div
              key={c.id}
              className={`mt-4 rounded-xl border px-4 py-3 ${tone(c.tone).chip}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">{c.label}</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">{c.body}</p>
            </div>
          ))}

          {/* ── Reader actions: save, share, push ingredients to the list. ── */}
          <RecipeActionBar saveEntry={saveEntry} ingredients={flatIngredients} />
        </header>

        {/* Sticky jump between the two long sections. */}
        <StickyJump />

        {/* ── 5. Ingredients. ── */}
        <Section id="ingredients" title="Ingredients">
          <ServingsControl
            isFixedBatch={isFixedBatch}
            baseServings={baseServings}
            adults={adults}
            kids={kids}
            leftovers={leftovers}
            scale={scale}
            setAdults={setAdults}
            setKids={setKids}
            setLeftovers={setLeftovers}
          />

          {/* When the kid lane offers a choice, pick it before the list renders
              so the kid groups sit in the same two columns as everything else
              instead of starting a second block below them. */}
          {model.kidIngredientChoices.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {model.kidIngredientChoices.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setKidChoice(i)}
                  aria-pressed={kidChoice === i}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${kidChoice === i ? "bg-kid text-white" : "border border-line bg-surface text-muted hover:text-ink"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Two columns on desktop like the printed page, one on mobile. A
              recipe with a single group keeps the full width rather than
              leaving half the row empty. */}
          <div className={`mt-4 grid gap-x-5 ${ingredientColumns.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {ingredientColumns.map((col, i) => (
              <div key={i}>
                {col.map((g) => (
                  <IngredientGroup
                    key={g.id}
                    group={g}
                    scale={scale}
                    checked={checked}
                    onToggle={toggleCheck}
                  />
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* ── 6. Method. ── */}
        {cookSteps.length > 0 && (
          <Section id="method" title="Method">
            <button
              type="button"
              onClick={() => { track("cooking_mode_start", { recipe: recipe.title, slug: recipe.slug }); setCooking(true); }}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-black text-brandink cursor-pointer sm:w-auto sm:px-6"
            >
              Start cooking
              <span className="text-sm font-semibold opacity-70">
                · {cookSteps.length} steps, one at a time
              </span>
            </button>

            {model.method.splitPoint && (
              <div className="mb-5 rounded-xl border border-line bg-surface2 px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                  Split point
                </span>
                <p className="mt-1 text-sm leading-relaxed text-ink">{model.method.splitPoint}</p>
                {model.method.splitRatio && (
                  <p className="mt-1 text-xs font-bold text-muted">{model.method.splitRatio}</p>
                )}
              </div>
            )}

            <div className="space-y-8">
              {model.method.phases.map((phase) => (
                <MethodPhase
                  key={phase.id}
                  phase={phase}
                  // A lone generic phase just repeats the "Method" heading above it.
                  hideLabel={model.method.phases.length === 1 && phase.label === "Method"}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── 7. The signature: Adult Plate | Kid Plate. ── */}
        {model.split && <SplitPlates split={model.split} scale={scale} />}

        {/* ── 8. Three keys to success. The short version stays visible; the
               full diagnostic material is one tap down. ── */}
        {model.keys.length > 0 && (
          <Section id="keys" title="Three keys to success">
            <ol className="space-y-3">
              {model.keys.map((k, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-brandink">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{k}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── 9. Everything a cook only wants when something is going wrong. ── */}
        {(model.deepDive.length > 0 || model.troubleshooting.length > 0 || model.overview) && (
          <Section id="details" title="Go deeper">
            <div className="space-y-2">
              {model.troubleshooting.length > 0 && (
                <Disclosure title="Troubleshooting" hint={`${model.troubleshooting.length} fixes`}>
                  <div className="space-y-3">
                    {model.troubleshooting.map((t, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-ink">{t.problem}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted">{t.fix}</p>
                      </div>
                    ))}
                  </div>
                </Disclosure>
              )}
              {model.deepDive.map((d) => (
                <Disclosure key={d.id} title={d.title} hint={`${d.items.length}`}>
                  <ul className="space-y-2">
                    {d.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted">
                        <span className={`flex-shrink-0 ${tone(d.tone).text}`}>&bull;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              ))}
              {model.overview && (
                <Disclosure title="About this recipe">
                  <p className="text-sm leading-relaxed text-muted">{model.overview}</p>
                </Disclosure>
              )}
              {model.description && (
                <Disclosure title="Full description">
                  <p className="text-sm leading-relaxed text-muted">{model.description}</p>
                </Disclosure>
              )}
            </div>
          </Section>
        )}

        {/* ── 10. Storage + nutrition. ── */}
        <Section id="storage" title="Storage and nutrition">
          <div className="space-y-2">
            {model.storage && (
              <Disclosure title="Storage and reheating" defaultOpen hint={model.storage.lasts}>
                <div className="space-y-1.5 text-sm text-muted">
                  <p><span className="font-semibold text-ink">Storage:</span> {model.storage.storage}</p>
                  <p><span className="font-semibold text-ink">Reheat:</span> {model.storage.reheat}</p>
                  <p><span className="font-semibold text-ink">Lasts:</span> {model.storage.lasts}</p>
                </div>
                {model.storage.chainTo && (
                  <Link
                    to={model.storage.chainTo.href || `/recipes/${model.storage.chainTo.slug}`}
                    className="mt-3 flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 hover:bg-brand/15"
                  >
                    <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider text-brand">Meal chain</span>
                    <span className="text-xs text-ink">
                      <span className="font-bold text-brand">Reinvent as {model.storage.chainTo.title}</span>
                      {model.storage.chainTo.note && <span className="ml-2 text-muted">— {model.storage.chainTo.note}</span>}
                    </span>
                    <span className="ml-auto text-brand">&rarr;</span>
                  </Link>
                )}
              </Disclosure>
            )}
            <NutritionDetails nutrition={model.nutrition} tags={model.tags} />
            {model.nutrition.substitutions.length > 0 && (
              <Disclosure title="Swaps" hint={`${model.nutrition.substitutions.length}`}>
                <ul className="space-y-1.5">
                  {model.nutrition.substitutions.map((s, i) => (
                    <li key={i} className="text-sm leading-relaxed text-muted">— {s}</li>
                  ))}
                </ul>
              </Disclosure>
            )}
          </div>
        </Section>

        {/* ── 11. Video, last, behind a poster. ── */}
        {model.video && <VideoBlock src={model.video} poster={model.hero.src} title={model.title} />}

        {/* ── 12. Promotional + navigational tail. ── */}
        {model.brands.length > 0 && <Brands brands={model.brands} />}
        {isDinner ? (
          <>
            <LeftoversPanel recipe={recipe} />
            <RelatedRecipes current={recipe} />
          </>
        ) : (
          <CookbookTail item={item} />
        )}

        {model.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {model.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-faint">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      {cooking && (
        <CookingMode
          steps={cookSteps}
          ingredients={flatIngredients}
          title={model.title}
          onClose={() => setCooking(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   PAGE CHROME
   ════════════════════════════════════════════ */

function RecipeHeader({ model }) {
  return (
    <div className="theme-fade sticky top-0 z-10 border-b border-line bg-page/90 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
        {/* Breadcrumb — the current recipe is the last crumb, unlinked. */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-xs font-semibold text-faint">
            <li className="flex items-center gap-1.5">
              <Link to="/" className="flex items-center gap-1.5 hover:text-brand">
                <img src="/images/favicon.png" alt="" className="h-4 w-4" />
                <span className="hidden sm:inline">The Split Plate</span>
              </Link>
              <span aria-hidden="true">/</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Link to={model.breadcrumb.to} className="hover:text-brand">{model.breadcrumb.label}</Link>
              <span aria-hidden="true">/</span>
            </li>
            <li className="min-w-0 truncate text-muted" aria-current="page">{model.title}</li>
          </ol>
        </nav>

        <button
          type="button"
          onClick={() => { track("recipe_print", { recipe: model.title, slug: model.slug }); window.print(); }}
          className="flex-shrink-0 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted hover:text-brand cursor-pointer"
          title="Print this recipe"
        >
          Print
        </button>
      </div>
    </div>
  );
}

/**
 * The at-a-glance facts grid. The hairline seams are a `gap-px` over a `bg-line`
 * backdrop, so a partly-filled last row shows through as a block of seam colour
 * — four facts in three columns left a tinted orphan cell. Pad the row out with
 * blank surface tiles instead. The count differs per breakpoint (2 cols on
 * mobile, 3 from `sm`), so render both sets and let the breakpoint pick.
 */
function FactsRow({ facts }) {
  const pad = (cols) => Array.from({ length: (cols - (facts.length % cols)) % cols });
  return (
    <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.key} className="bg-surface px-3 py-3">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-faint">{f.label}</dt>
          <dd className={`mt-0.5 text-base font-bold ${f.highlight ? "text-brand" : "text-ink"}`}>
            {f.estimated ? "~" : ""}
            {f.value}
          </dd>
        </div>
      ))}
      {pad(2).map((_, i) => (
        <div key={`p2-${i}`} className="bg-surface sm:hidden" aria-hidden="true" />
      ))}
      {pad(3).map((_, i) => (
        <div key={`p3-${i}`} className="hidden bg-surface sm:block" aria-hidden="true" />
      ))}
    </dl>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="mb-4 text-xl font-black text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Disclosure({ title, hint, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex-1 text-sm font-bold text-ink">{title}</span>
        {hint && <span className="text-xs text-faint">{hint}</span>}
        <span className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          &#9662;
        </span>
      </button>
      {open && <div className="border-t border-line px-4 py-4">{children}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════════ */

function SafetyBand({ safety }) {
  const hasCritical = safety.allergens.length > 0 || safety.critical.length > 0;
  if (!hasCritical && safety.headsUp.length === 0 && !safety.correction) return null;

  return (
    <div className="mt-4 space-y-2">
      {safety.correction && (
        <div className="rounded-xl border border-dangerline bg-dangersoft px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-danger">Tested correction</span>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            <span className="font-semibold">{safety.correction.what}</span> {safety.correction.fix}
          </p>
        </div>
      )}

      {hasCritical && (
        <div className="rounded-xl border border-dangerline bg-dangersoft px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-danger">
            Allergens and safety
          </span>
          {safety.allergens.length > 0 && (
            <p className="mt-1 text-sm text-ink">
              <span className="font-semibold">Contains:</span> {safety.allergens.join(", ")}
            </p>
          )}
          {safety.critical.length > 0 && (
            <ul className="mt-1.5 space-y-1">
              {safety.critical.map((w) => (
                <li key={w.label} className="text-sm leading-snug text-danger">
                  <span className="font-semibold">{w.label}</span>
                  {w.detail ? <span className="text-danger/80"> — {w.detail}</span> : null}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted">
            Packaged ingredients change formulas — check the label on what's actually in your kitchen.
          </p>
        </div>
      )}

      {safety.headsUp.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {safety.headsUp.map((w) => (
            <span
              key={w.label}
              title={w.detail || undefined}
              className="rounded-full border border-warnline bg-warnsoft px-2.5 py-1 text-xs font-semibold text-warn"
            >
              {w.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ServingsControl({ isFixedBatch, baseServings, adults, kids, leftovers, scale, setAdults, setKids, setLeftovers }) {
  if (isFixedBatch) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-surface2 px-4 py-3">
        <span className="rounded border border-brand/30 bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
          Batch cook
        </span>
        <span className="text-xs text-muted">
          Yields {baseServings} servings — quantities below are the full batch.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-surface2 px-4 py-3">
      <div className="flex items-center gap-2" role="group" aria-label="Adult servings">
        <span className="text-[10px] font-bold uppercase tracking-wider text-faint">Adults</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setAdults(n)}
              aria-pressed={adults === n}
              aria-label={`${n} adult${n === 1 ? "" : "s"}`}
              className={`h-7 w-7 rounded text-xs font-bold cursor-pointer ${adults === n ? "bg-adult text-white" : "bg-surface text-muted hover:text-ink"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2" role="group" aria-label="Kid servings">
        <span className="text-[10px] font-bold uppercase tracking-wider text-faint">Kids</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setKids(n)}
              aria-pressed={kids === n}
              aria-label={`${n} kid${n === 1 ? "" : "s"}`}
              className={`h-7 w-7 rounded text-xs font-bold cursor-pointer ${kids === n ? "bg-kid text-white" : "bg-surface text-muted hover:text-ink"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => setLeftovers(!leftovers)}
        aria-pressed={leftovers}
        className={`rounded px-2.5 py-1 text-[11px] font-bold cursor-pointer ${leftovers ? "bg-brand text-brandink" : "bg-surface text-muted hover:text-ink"}`}
      >
        {leftovers ? "✓ " : ""}Leftovers
      </button>
      {scale !== 1 && (
        <span className="ml-auto text-[11px] font-bold text-brand">
          Scaled {leftovers ? "2× for leftovers" : `to ${adults + kids}`}
        </span>
      )}
    </div>
  );
}

function IngredientGroup({ group, scale, checked, onToggle, accent }) {
  const t = tone(accent || group.tone);
  return (
    <div className="mb-5">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <h3 className={`border-b border-line bg-surface2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${t.text}`}>
          {group.title}
        </h3>
        <ul className="divide-y divide-line">
          {group.items.map((item, i) => {
            const key = `${group.id}:${i}`;
            const text = ingredientText(item);
            const isNote = text.startsWith("  ");
            const link = typeof item === "object" ? item.link : null;
            const isChecked = checked.has(key);

            if (isNote) {
              return (
                <li key={key} className="px-4 py-2 pl-11 text-xs italic text-faint">
                  {text.trim()}
                </li>
              );
            }
            return (
              <li key={key}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(key)}
                    className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer accent-[var(--brand)]"
                  />
                  <span className={`text-sm leading-snug ${isChecked ? "text-faint line-through" : "text-ink"}`}>
                    {link ? (
                      <Link to={link} className="font-semibold text-brand hover:underline">
                        {scaleIngredientText(text, scale)}
                      </Link>
                    ) : (
                      scaleIngredientText(text, scale)
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MethodPhase({ phase, hideLabel = false }) {
  const [active, setActive] = useState(0);
  const t = tone(phase.tone);
  const steps = phase.choices ? phase.choices[active].steps : phase.steps;

  return (
    <div>
      {(!hideLabel || phase.subtitle) && (
        <div className={`mb-4 border-l-4 pl-4 ${phase.tone === "adult" ? "border-adult" : phase.tone === "kid" ? "border-kid" : "border-brand"}`}>
          {!hideLabel && (
            <h3 className={`text-sm font-bold uppercase tracking-wider ${t.text}`}>{phase.label}</h3>
          )}
          {phase.subtitle && <p className="mt-0.5 text-xs text-faint">{phase.subtitle}</p>}
        </div>
      )}

      {phase.choices && phase.choices.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {phase.choices.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={`rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${active === i ? "bg-kid text-white" : "border border-line bg-surface text-muted hover:text-ink"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <StepList steps={steps} startAt={phase.startAt} tone={phase.tone} />
    </div>
  );
}

/** The signature element: two parallel plates, terracotta and sage. */
function SplitPlates({ split, scale }) {
  const [kidChoice, setKidChoice] = useState(0);
  const kid = split.kid.choices[kidChoice] || split.kid.choices[0];

  return (
    <Section id="split" title="Adult plate | Kid plate">
      {split.ratio && (
        <p className="-mt-2 mb-4 text-sm text-muted">{split.ratio}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PlateCard
          label={split.adult.label}
          side="Adult"
          toneKey="adult"
          protein={split.adult.protein}
          calories={split.adult.calories}
          items={split.adult.extras}
          body={split.adult.body}
          note={split.adult.note}
          scale={scale}
        />
        <PlateCard
          label={split.kid.label}
          side="Kid"
          toneKey="kid"
          protein={split.kid.protein}
          calories={split.kid.calories}
          items={kid?.extraIngredients || []}
          body={split.kid.body}
          note={split.kid.proteinSwap || split.kid.note}
          scale={scale}
          choices={split.kid.choices.length > 1 ? split.kid.choices : null}
          activeChoice={kidChoice}
          onChoice={setKidChoice}
        />
      </div>
    </Section>
  );
}

function PlateCard({ label, side, toneKey, protein, calories, items, body, note, scale, choices, activeChoice, onChoice }) {
  const isAdult = toneKey === "adult";
  const visible = (items || []).filter((i) => !isGroupHeader(i));

  return (
    <div className={`overflow-hidden rounded-2xl border ${isAdult ? "border-adultline bg-adultsoft" : "border-kidline bg-kidsoft"}`}>
      <div className={`px-4 py-3 ${isAdult ? "bg-adult" : "bg-kid"}`}>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{side} plate</span>
        <h3 className="text-base font-black leading-tight text-white">{label}</h3>
      </div>

      <div className="px-4 py-3">
        {(protein != null || calories != null) && (
          <div className="flex gap-4">
            {protein != null && (
              <div>
                <div className={`text-xl font-black ${isAdult ? "text-adult" : "text-kid"}`}>{protein}g</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-faint">Protein</div>
              </div>
            )}
            {calories != null && (
              <div>
                <div className="text-xl font-black text-ink">{calories}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-faint">Calories</div>
              </div>
            )}
          </div>
        )}
        {/* Cookbook entries describe the difference in prose instead of
            publishing per-plate macros, so that text stands in for the macro
            row rather than sitting under an apology for missing numbers. */}
        {body && <p className="text-sm leading-relaxed text-ink">{body}</p>}
        {!body && protein == null && calories == null && (
          <p className="text-xs italic text-faint">
            Macros not published for this plate — portion it to their appetite.
          </p>
        )}

        {choices && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {choices.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoice(i)}
                aria-pressed={activeChoice === i}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer ${activeChoice === i ? "bg-kid text-white" : "border border-kidline bg-surface text-muted"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {visible.length > 0 && (
          <>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-faint">
              What makes it different
            </p>
            <ul className="mt-1 space-y-1">
              {visible.map((item, i) => (
                <li key={i} className="text-sm leading-snug text-ink">
                  {scaleIngredientText(ingredientText(item), scale)}
                </li>
              ))}
            </ul>
          </>
        )}

        {note && <p className="mt-3 text-xs leading-relaxed text-muted">{note}</p>}
      </div>
    </div>
  );
}

function NutritionDetails({ nutrition, tags }) {
  const { macros, batch, estimated, honesty, costPerServing, dietTags, splitAxes, caveats } = nutrition;
  if (!macros && !batch && !honesty && dietTags.length === 0) return null;

  return (
    <Disclosure
      title="Nutrition details"
      hint={estimated ? "Estimated" : macros ? "Verified" : undefined}
    >
      <div className="space-y-3 text-sm text-muted">
        {/* The glance row shows per-serving; this is the whole batch, labelled
            so the two numbers can't be mistaken for each other. */}
        {batch && (
          <p className="text-ink">
            <span className="font-semibold">Whole batch:</span> {batch.protein}g protein ·{" "}
            {batch.calories} cal
            {batch.servings != null && <span className="text-muted"> across {batch.servings} servings</span>}
            {batch.servingSize && <span className="text-muted"> ({batch.servingSize} each)</span>}
          </p>
        )}
        {macros && (
          <p className="text-ink">
            <span className="font-semibold">
              {estimated ? "~" : ""}{macros.protein}g protein / {macros.fat}g fat / {macros.carbs}g carbs
            </span>
            {macros.netCarbs != null && <span> ({macros.netCarbs}g net carbs)</span>}
            {costPerServing && <span className="text-muted"> · {costPerServing} per serving</span>}
          </p>
        )}
        <p className="leading-relaxed">
          {estimated
            ? "Estimated from ingredient averages, not lab-measured. Stated calories can drift from a strict 4P + 9F + 4C sum because of label rounding, fiber and sugar-alcohol net-carb accounting, and brand-specific label methodology."
            : "Calculated per-ingredient at the listed brands and quantities."}
        </p>
        {honesty && <p className="leading-relaxed">{honesty}</p>}
        {caveats.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {caveats.map((c) => (
              <li key={c.label} title={c.detail || undefined} className="rounded border border-line px-2 py-0.5 text-xs text-faint">{c.label}</li>
            ))}
          </ul>
        )}
        {(dietTags.length > 0 || splitAxes.length > 0) && (
          <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
            {dietTags.map((t) => (
              <span key={t} className="rounded bg-surface2 px-2 py-0.5 text-xs text-muted">{t}</span>
            ))}
            {splitAxes.map((a) => (
              <span key={a} className="rounded border border-brand/30 px-2 py-0.5 text-xs text-brand">split: {a}</span>
            ))}
          </div>
        )}
        {tags.length > 0 && (
          <p className="text-xs text-faint">{tags.map((t) => `#${t}`).join(" ")}</p>
        )}
      </div>
    </Disclosure>
  );
}

/** Video, at the bottom, behind a poster. Nothing downloads until a tap. */
function VideoBlock({ src, poster, title }) {
  const [playing, setPlaying] = useState(false);

  return (
    <Section id="video" title="Watch the full cook">
      <div className="mx-auto aspect-[9/16] max-h-[520px] overflow-hidden rounded-2xl border border-line bg-black sm:aspect-video">
        {playing ? (
          <video
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play the ${title} cook-along video`}
            className="group relative h-full w-full cursor-pointer"
          >
            {poster && (
              <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover opacity-70" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-black shadow-lg group-hover:bg-white">
                &#9654;
              </span>
            </span>
          </button>
        )}
      </div>
    </Section>
  );
}

function Brands({ brands }) {
  return (
    <Section id="brands" title="Brands I use">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {brands.map((b, i) => {
          const inner = (
            <div className="overflow-hidden rounded-xl border border-line bg-surface hover:border-brand/40">
              {b.image && (
                <div className="flex h-32 items-center justify-center bg-white p-3">
                  <img src={b.image} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
              )}
              <div className="p-4">
                <div className="text-sm font-black text-brand">{b.name}</div>
                <div className="mt-0.5 text-xs font-semibold text-ink">{b.item}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-muted">{b.why}</div>
              </div>
            </div>
          );
          if (!b.url) return <div key={i}>{inner}</div>;
          const isInternal = b.url.startsWith("/");
          return isInternal ? (
            <Link key={i} to={b.url} onClick={() => track("brand_click", { brand: b.name, item: b.item, url: b.url })} className="block">
              {inner}
            </Link>
          ) : (
            <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" onClick={() => track("brand_click", { brand: b.name, item: b.item, url: b.url })} className="block">
              {inner}
            </a>
          );
        })}
      </div>
    </Section>
  );
}

/* ════════════════════════════════════════════
   SHARED HELPERS
   ════════════════════════════════════════════ */

function StepImages({ images }) {
  const [expanded, setExpanded] = useState(null);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === "Escape") setExpanded(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);
  if (!images || images.length === 0) return null;
  const stepLabel = (src) => {
    const m = src.match(/step-\d+-([a-z0-9-]+)/i);
    return m ? `Step photo: ${m[1].replace(/-/g, " ")}` : "Step photo";
  };
  return (
    <>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setExpanded(src)}
            aria-label={`Expand ${stepLabel(src)}`}
            className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-line cursor-pointer hover:border-brand focus:border-brand focus:outline-none sm:h-32 sm:w-32"
          >
            <img src={src} alt={stepLabel(src)} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4"
          onClick={() => setExpanded(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded step photo"
        >
          <img src={expanded} alt={stepLabel(expanded)} className="max-h-[90vh] max-w-full rounded-xl object-contain" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(null); }}
            aria-label="Close expanded photo"
            className="absolute right-4 top-4 text-2xl font-bold text-white/70 hover:text-white"
          >&times;</button>
        </div>
      )}
    </>
  );
}

function StepList({ steps, startAt = 1, tone: toneKey }) {
  const t = tone(toneKey);
  return (
    <ol className="space-y-5">
      {steps.map((step, i) => {
        const colonIdx = step.text.indexOf(":");
        const hasLabel = colonIdx > 0 && colonIdx < 30 && step.text[0] === step.text[0].toUpperCase();
        const label = hasLabel ? step.text.slice(0, colonIdx) : null;
        const body = hasLabel ? step.text.slice(colonIdx + 1).trim() : step.text;

        return (
          <li key={i} className="flex gap-3">
            <span className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${t.dot}`}>
              {startAt + i}
            </span>
            <div className="min-w-0 flex-1">
              {label && (
                <span className={`mb-1 block text-xs font-bold uppercase tracking-wider ${t.text}`}>
                  {label}
                </span>
              )}
              <p className="text-base leading-relaxed text-ink">{body}</p>
              <StepImages images={step.images} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function parseFrac(s) {
  s = s.trim();
  // "1/2" → 0.5, "3/4" → 0.75
  if (s.includes("/")) {
    const [num, den] = s.split("/").map(Number);
    return den ? num / den : parseFloat(s);
  }
  return parseFloat(s);
}

function formatNum(n) {
  // Try to express as a clean fraction if close
  const fracs = [[0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"]];
  const whole = Math.floor(n);
  const remainder = n - whole;
  if (remainder < 0.05) return whole.toString();
  for (const [val, str] of fracs) {
    if (Math.abs(remainder - val) < 0.05) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function scaleIngredientText(text, scale) {
  if (scale === 1) return text;
  // Match leading quantities: "24", "1.25", "2-2.5", "1/2", "3/4",
  // optionally prefixed with "~" for creator estimates ("~300 g cottage cheese").
  return text.replace(/^(~?)(\d+\/\d+|\d+(?:\.\d+)?(?:\s*[-–]\s*(?:\d+\/\d+|\d+(?:\.\d+)?))?)/g, (_match, tilde, num) => {
    // Handle ranges like "2-2.5" or "1/2-3/4"
    if (/[-–]/.test(num) && !num.startsWith("-")) {
      const parts = num.split(/\s*[-–]\s*/).map((p) => formatNum(parseFrac(p) * scale));
      return tilde + parts.join("–");
    }
    return tilde + formatNum(parseFrac(num) * scale);
  });
}

// Print-only 2-page recipe card. Hidden on screen (`hidden`), visible when
// printing (`print:block`). Renders title + one-line macros + ingredients
// (with section headers) + numbered steps. Skips whyMostFail, whyThisWorks,
// executionRules, troubleshooting, brands, mealPrep, splitCook adult/kid
// branches — those live only on the screen article.
// Driven off the model rather than the raw record so it covers cookbook
// entries, and so split dinners that keep their steps only under splitCook
// lanes still print a method instead of an empty list.
function PrintCard({ model }) {
  return (
    <div className="mx-auto hidden max-w-3xl px-6 py-4 print:block">
      <div className="mb-3 flex items-baseline justify-between border-b border-neutral-300 pb-2">
        <h2 className="text-2xl font-black text-black">{model.title}</h2>
        <span className="text-[10px] text-neutral-600">thesplitplate.com{model.path}</span>
      </div>
      {model.facts.length > 0 && (
        <p className="mb-3 text-sm text-neutral-800">
          {model.facts.map((f, i) => (
            <span key={f.key}>
              {i > 0 && " · "}
              <strong>{f.estimated ? "~" : ""}{f.value}</strong> {f.label.toLowerCase()}
            </span>
          ))}
        </p>
      )}
      {model.split && (
        <p className="mb-3 text-xs italic text-neutral-700">
          Split: {model.split.adult.label} · {model.split.kid.label}
        </p>
      )}

      <h2 className="mt-4 mb-1 border-b border-neutral-300 pb-0.5 text-xs font-black uppercase tracking-wider text-black">Ingredients</h2>
      {model.ingredientGroups.map((g) => (
        <div key={g.id}>
          <p className="mt-1.5 text-[10px] font-bold uppercase text-neutral-600">{g.title}</p>
          <ul className="space-y-0.5 text-[11px] leading-snug text-neutral-900">
            {g.items.map((it, i) => (
              <li key={i} className="-indent-3 pl-3">• {ingredientText(it)}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="mt-4 mb-1 border-b border-neutral-300 pb-0.5 text-xs font-black uppercase tracking-wider text-black">Method</h2>
      <ol className="ml-4 list-decimal space-y-1 text-[11px] leading-snug text-neutral-900">
        {flattenSteps(model).map((s, i) => (
          <li key={i}>
            {s.lane && <em className="text-neutral-600">{s.lane}: </em>}
            {s.text}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Cookbook counterpart to RelatedRecipes: dinners that mention this item,
 * plus a way back to the index. Same contextual scoring the old page used.
 */
function CookbookTail({ item }) {
  const related = useMemo(() => {
    const keywords = (item.title || "").toLowerCase().split(/\s+/);
    return liveRecipes
      .filter((r) => r.pillar === "Protein Meals")
      .map((r) => {
        const text = `${r.title} ${r.description || ""} ${(r.tags || []).join(" ")}`.toLowerCase();
        return { ...r, score: keywords.reduce((s, kw) => s + (text.includes(kw) ? 1 : 0), 0) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }, [item]);

  return (
    <Section id="related" title="Try it with">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {related.map((r) => (
          <Link
            key={r.id}
            to={`/recipes/${r.slug}`}
            className="block overflow-hidden rounded-xl border border-line bg-surface hover:border-brand/40"
          >
            <img
              {...cardImage(r.image)}
              alt={r.title}
              width="640"
              height="360"
              className="h-36 w-full object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <h3 className="text-sm font-bold leading-tight text-ink">{r.title}</h3>
              <div className="mt-2 flex gap-2 text-[10px] text-faint">
                <span className="font-bold text-brand">{r.protein}g protein</span>
                <span>{r.calories} cal</span>
                <span>{r.time}</span>
              </div>
            </div>
          </Link>
        ))}
        <Link
          to="/cookbook"
          className="flex items-center justify-center rounded-xl border border-line bg-surface hover:border-brand/40"
        >
          <div className="p-6 text-center">
            <span className="mb-2 block text-2xl font-black text-brand">&larr;</span>
            <h3 className="text-sm font-bold text-ink">All cookbook recipes</h3>
            <p className="mt-1 text-[10px] text-faint">Sauces, breakfasts, and more</p>
          </div>
        </Link>
      </div>
    </Section>
  );
}

function RelatedRecipes({ current }) {
  const related = useMemo(() => {
    const dinners = liveRecipes.filter(
      (r) => r.pillar === "Protein Meals" && r.id !== current.id
    );
    // Prefer different proteinAnchor for variety
    const different = dinners.filter(
      (r) => r.proteinAnchor !== current.proteinAnchor
    );
    const pool = different.length >= 2 ? different : dinners;
    // Shuffle deterministically based on current id
    const sorted = [...pool].sort(
      (a, b) => ((a.id * 7 + current.id) % 13) - ((b.id * 7 + current.id) % 13)
    );
    return sorted.slice(0, 2);
  }, [current.id, current.proteinAnchor]);

  return (
    <Section id="related" title="Related recipes">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {related.map((r) => (
          <Link
            key={r.id}
            to={`/recipes/${r.slug}`}
            className="block overflow-hidden rounded-xl border border-line bg-surface hover:border-brand/40"
          >
            <img
              {...cardImage(r.image)}
              alt={r.title}
              width="640"
              height="360"
              className="h-36 w-full object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <h3 className="text-sm font-bold leading-tight text-ink">{r.title}</h3>
              <div className="mt-2 flex gap-2 text-[10px] text-faint">
                <span className="font-bold text-brand">{r.protein}g protein</span>
                <span>{r.calories} cal</span>
                <span>{r.time}</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Power-up: Money Mustard */}
        <Link
          to="/cookbook/money-mustard"
          className="block overflow-hidden rounded-xl border border-line bg-surface hover:border-brand/40"
        >
          <div className="flex h-36 items-center justify-center bg-brand/10">
            <span className="text-3xl font-black text-brand">+</span>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-bold leading-tight text-ink">Money Mustard</h3>
            <div className="mt-2 flex gap-2 text-[10px] text-faint">
              <span className="font-bold text-brand">Power-Up</span>
              <span>Pairs with everything</span>
            </div>
          </div>
        </Link>
      </div>
    </Section>
  );
}
