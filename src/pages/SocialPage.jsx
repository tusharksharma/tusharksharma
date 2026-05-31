import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { liveRecipes } from "../data/recipes";
import { sauces, bases, breakfasts, desserts, quickLunches } from "../data/cookbook";
import useMeta from "../hooks/useMeta";

const ALL_COOKBOOK = [...sauces, ...bases, ...breakfasts, ...desserts, ...quickLunches];

const HASHTAG_BASE = [
  "#TheSplitPlate", "#CookOnceSplitSmart", "#SplitCook",
  "#HighProteinFamilyDinner", "#FamilyMealPrep", "#KidApprovedDinner",
  "#WeeknightDinner", "#FamilyDinnerIdeas", "#HighProtein",
];

const PROTEIN_HASHTAGS = {
  pork: ["#PorkChops", "#PorkDinner"],
  chicken: ["#ChickenDinner", "#ChickenRecipes"],
  beef: ["#BeefDinner", "#SteakDinner"],
  steak: ["#SteakNight", "#SteakDinner"],
};

function hashtagsFor(recipe) {
  const proteinTag = recipe.meta?.proteinTags?.[0];
  const proteinTags = PROTEIN_HASHTAGS[proteinTag] || [];
  const titleTags = recipe.title.split(/\s*[+,]\s*|\s+/)
    .filter((w) => w.length > 4 && !/^(the|and|with|drizzle|chops?)$/i.test(w))
    .slice(0, 3)
    .map((w) => `#${w.replace(/[^a-z0-9]/gi, "")}`)
    .filter((t) => t.length > 2);
  const carbTag = recipe.carbLevel === "low" || recipe.carbLevel === "none" ? ["#LowCarbDinner"] : [];
  return [...HASHTAG_BASE, ...proteinTags, ...carbTag, ...titleTags];
}

// Per-brand handles for Instagram (`ig`) and TikTok (`tiktok`). TikTok handles
// are verified via web search — many brands have DIFFERENT @ on TikTok vs IG.
// If a brand has no verified TikTok handle, omit `tiktok` and it's silently
// dropped from the TikTok caption (avoids posting a fake @).
const KNOWN_HANDLES = {
  "Dan-O's": { ig: "@danosseasoning", tiktok: "@danosseasoning" },
  "Kirkland Signature": { ig: "@kirklandsignature_costco" },
  "Kirkland": { ig: "@kirklandsignature_costco" },
  "Laughing Cow": { ig: "@thelaughingcow", tiktok: "@thelaughingcowus" },
  "Lea & Perrins": { ig: "@leaandperrins", tiktok: "@lea_and_perrins" },
  "Smash Kitchen": { ig: "@smashkitchenco", tiktok: "@getsmashkitchen" },
  "Kikkoman": { ig: "@kikkoman_usa", tiktok: "@kikkomankitchen" },
  "General Mills": { ig: "@generalmills", tiktok: "@generalmills" },
  "Lee Kum Kee": { ig: "@leekumkeeusa", tiktok: "@leekumkeeusa" },
  "Verka": { ig: "@verkadairy" },
  "Red Boat": { ig: "@redboatfishsauce", tiktok: "@redboatfishsauce" },
  "Tanimura & Antle": { ig: "@tanimuraantle" },
  "Chosen Foods": { ig: "@chosenfoods", tiktok: "@chosenfoods" },
  "Herdez": { ig: "@herdez", tiktok: "@herdezbrand" },
  "Daisy": { ig: "@daisybrand", tiktok: "@daisysourcreamofficial" },
  "Fage": { ig: "@fageusa" },
  "Philadelphia": { ig: "@philadelphia", tiktok: "@philadelphia" },
  "Whole Earth": { ig: "@wholeearthsweetener", tiktok: "@wholeearthsweetener" },
  "Ghirardelli": { ig: "@ghirardelli", tiktok: "@officalghirardelli" },
  "Nescafé": { ig: "@nescafe_usa", tiktok: "@nescafe.usa" },
  "HighKey": { ig: "@highkeysnacks", tiktok: "@highkeysnacks" },
  "PEScience": { ig: "@pescience", tiktok: "@pescience" },
  "Little Potato Co.": { ig: "@littlepotatoco", tiktok: "@littlepotatoco" },
  "NY Style Sausage Co.": { ig: "@nystylesausage" },
  "Dynasty": { ig: "@dynasty.foods" },
  "Bare Bones": { ig: "@barebonesbroth" },
  "Anthony's": { ig: "@anthonys.organic" },
  "Lily's": { ig: "@lilyssweets" },
  "Thrive Market": { ig: "@thrivemarket", tiktok: "@thrivemarket" },
  "Fairlife": { ig: "@fairlife", tiktok: "@fairlifeofficial" },
  "Nakano": { ig: "@nakanorice" },
  "Taste Flavor Co.": { ig: "@tasteflavorco" },
  "Opportuniteas": { ig: "@opportuniteas" },
  "Bob's Red Mill": { ig: "@bobsredmill", tiktok: "@bobsredmill" },
  "Marketside (Walmart)": { ig: "@marketside" },
  "Pete's Pasta": { ig: "@petespasta" },
  "Rao's": { ig: "@raoshomemade", tiktok: "@raoshomemade" },
  "Barilla": { ig: "@barillaus", tiktok: "@barilla" },
  "Falls Brand": { ig: "@fallsbrand" },
  "365 Whole Foods": { ig: "@wholefoods" },
};

function brandHandles(recipe, platform = "ig") {
  return (recipe.brands || [])
    .map((b) => KNOWN_HANDLES[b.name]?.[platform])
    .filter(Boolean);
}

// TikTok performs best with 3-5 well-targeted hashtags. We pick exactly 5:
//   1. #TheSplitPlate (brand)
//   2. #CookOnceSplitSmart (brand tagline — the search-discoverable phrase)
//   3. Recipe-specific protein tag (#PorkChops, #ChickenDinner, etc.)
//   4. Audience tag based on macros (high-protein, low-carb, or meal-prep)
//   5. Format tag (#WeeknightDinner or #FamilyDinner — broad reach)
function tiktokHashtagsFor(recipe) {
  const tags = ["#TheSplitPlate", "#CookOnceSplitSmart"];
  const proteinTag = recipe.meta?.proteinTags?.[0];
  const proteinHashtag = (PROTEIN_HASHTAGS[proteinTag] || [])[0];
  if (proteinHashtag) tags.push(proteinHashtag);
  if (recipe.carbLevel === "low" || recipe.carbLevel === "none") tags.push("#LowCarbDinner");
  else if ((recipe.protein || 0) >= 40) tags.push("#HighProteinDinner");
  else tags.push("#MealPrep");
  tags.push("#WeeknightDinner");
  return tags.slice(0, 5);
}

function extractCookbookLinks(recipe) {
  const ids = new Set();
  const scan = (arr) => {
    arr?.forEach((item) => {
      if (typeof item === "object" && item.link?.startsWith("/cookbook/")) {
        const id = item.link.replace("/cookbook/", "").replace(/\/$/, "");
        if (id) ids.add(id);
      }
    });
  };
  scan(recipe.ingredients);
  scan(recipe.splitCook?.sharedIngredients);
  scan(recipe.splitCook?.adult?.extraIngredients);
  scan(recipe.splitCook?.kid?.extraIngredients);
  return [...ids].map((id) => ALL_COOKBOOK.find((c) => c.id === id)).filter(Boolean);
}

// Mobile Safari taints the canvas when images are loaded without explicit CORS,
// even for same-origin images. This pre-fetches every <img> in the given root
// and inlines it as a base64 data URL — toPng then has clean, known-good pixels.
//
// Pitfalls fixed in this version:
//   - img.complete returns true for the OLD image right after setting new src,
//     so the previous resolve-immediately code skipped the actual load wait.
//     Now uses img.decode() (the standard way to guarantee paint-ready state)
//     with onload/onerror fallback for browsers without decode().
//   - Errors used to be swallowed → blank cards with no signal. Now thrown so
//     the export wrapper can surface a meaningful alert.
//   - cache: "no-store" forces a fresh CORS-aware fetch (cached responses may
//     have been retrieved without CORS headers on the first page load).
async function preloadImagesWithCors(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  const failures = [];
  await Promise.all(imgs.map(async (img) => {
    if (img.src.startsWith("data:")) return;
    if (img.src.startsWith("blob:")) return;
    const originalSrc = img.src;
    try {
      // Default mode (same-origin) works for all our /images/* URLs. We deliberately
      // DON'T pass mode:"cors" — that forces CORS validation even for same-origin
      // and Vercel's static-asset serving doesn't send CORS headers, so cors mode
      // would fail entirely.
      const res = await fetch(originalSrc, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      // Blob URLs > data URLs: no base64 bloat (~33% size penalty), no Mobile
      // Safari size limits, browser treats them as same-origin so the canvas
      // doesn't get tainted. The old approach choked on the 2.2 MB gnocchi PNGs
      // because base64-encoding pushed them past Mobile Safari's data URL ceiling.
      img.src = URL.createObjectURL(blob);
      // Wait for the browser to actually decode the new src before toPng reads.
      // img.decode() is the modern guarantee; falls back to onload for older browsers.
      if (typeof img.decode === "function") {
        await img.decode().catch(() => {
          // decode() rejected — fall back to onload race
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 500);
          });
        });
      } else {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 500);
        });
      }
    } catch (e) {
      failures.push({ src: originalSrc, error: e.message });
      console.warn("preload failed for", originalSrc, e);
    }
  }));
  if (failures.length > 0 && failures.length === imgs.length) {
    // Every image failed — surface this loudly, otherwise the user gets a blank card
    throw new Error(`All ${imgs.length} images failed to preload. Check Network tab for the URLs.`);
  }
  return failures;
}

function BrandStripTop() {
  return (
    <div className="absolute top-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-20 pointer-events-none">
      <span className="text-amber-500/80 text-[10px] font-black tracking-[0.2em] uppercase">The Split Plate</span>
      <span className="text-neutral-500 text-[10px] tracking-wider">thesplitplate.com</span>
    </div>
  );
}

// Each downloadable card is 1080×1080 exported at 2x pixelRatio.
// In the browser we render at 540×540 for screen; the PNG saves at 1080.
function DownloadableCard({ children, filename, label }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  async function exportCard() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const failures = await preloadImagesWithCors(ref.current);
      if (failures.length > 0) {
        console.warn(`Partial preload — ${failures.length} image(s) failed:`, failures);
      }
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, width: 540, height: 540, cacheBust: true, skipFonts: false });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: "image/png" });

      // Mobile-first: Web Share API → native share sheet → "Save to Photos" / IG / etc.
      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (e) {
          if (e.name === "AbortError") return; // user cancelled — don't fallback
          // fall through to download
        }
      }

      // Desktop fallback: classic download
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Card export failed:", e);
      alert("Export failed — check console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        <button
          onClick={exportCard}
          disabled={busy}
          className="text-amber-400 text-xs font-bold hover:underline cursor-pointer disabled:opacity-50"
        >
          {busy ? "Exporting…" : "Save image ↓"}
        </button>
      </div>
      <div ref={ref} className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex flex-col" style={{ width: 540, height: 540 }}>
        {children}
      </div>
    </div>
  );
}

function HeroCardInner({ recipe }) {
  return (
    <>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/10" />
      <BrandStripTop />
      <div className="relative z-10 mt-auto p-6">
        <div className="w-12 h-1 bg-amber-400 mb-3" />
        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-lg">{recipe.title}</h1>
        <p className="text-amber-400 text-sm font-semibold mt-2">Cook once. Split smart.</p>
      </div>
    </>
  );
}

function MacroCardInner({ recipe }) {
  const m = recipe.meta?.macros || {};
  return (
    <div className="absolute inset-0 p-7 flex flex-col justify-center">
      <BrandStripTop />
      <div className="space-y-5">
        <div>
          <div className="w-12 h-1 bg-amber-400 mb-3" />
          <h2 className="text-white text-2xl font-black leading-tight">{recipe.title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-amber-400 text-3xl font-black">{m.protein || recipe.protein}g</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Protein</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-white text-3xl font-black">~{m.calories || recipe.calories}</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Calories</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-emerald-300 text-3xl font-black">{m.netCarbs != null ? m.netCarbs : m.carbs}g</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Net Carbs</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-white text-3xl font-black">{recipe.time}</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total</div>
          </div>
        </div>
        {recipe.meta?.costPerServing && (
          <p className="text-center text-neutral-400 text-xs">{recipe.meta.costPerServing} per serving · {recipe.servings} servings</p>
        )}
      </div>
    </div>
  );
}

function ProcessImageCardInner({ src, caption }) {
  return (
    <>
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/30" />
      <BrandStripTop />
      {caption && (
        <div className="relative z-10 mt-auto p-6">
          <div className="w-8 h-0.5 bg-amber-400 mb-2" />
          <p className="text-white text-base font-semibold drop-shadow-lg">{caption}</p>
        </div>
      )}
    </>
  );
}

function SplitCardInner({ recipe }) {
  const adult = recipe.splitCook?.adult;
  const kid = recipe.splitCook?.kid;
  return (
    <div className="absolute inset-0 p-7 flex flex-col justify-center">
      <BrandStripTop />
      <div>
        <div className="w-12 h-1 bg-amber-400 mb-3" />
        <h2 className="text-white text-xl font-black mb-5">One cook, two plates</h2>
        <div className="space-y-3">
          {adult && (
            <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4">
              <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Adult</span>
              <p className="text-neutral-200 text-sm mt-1 leading-snug">{adult.label}</p>
              {adult.protein != null && (
                <p className="text-neutral-500 text-xs mt-2">{adult.protein}g protein · ~{adult.calories} cal</p>
              )}
            </div>
          )}
          {kid && (
            <div className="bg-green-950/30 border border-green-900/40 rounded-xl p-4">
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Kid</span>
              <p className="text-neutral-200 text-sm mt-1 leading-snug">{kid.label}</p>
              {kid.protein != null && (
                <p className="text-neutral-500 text-xs mt-2">{kid.protein}g protein · ~{kid.calories} cal</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentCardInner({ item, kind }) {
  return (
    <>
      {item.heroImage && (
        <img src={item.heroImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/20" />
      <BrandStripTop />
      <div className="relative z-10 mt-auto p-6">
        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">{kind}</span>
        <div className="w-12 h-1 bg-amber-400 mt-2 mb-2" />
        <h2 className="text-white text-2xl font-black leading-tight drop-shadow-lg">{item.title}</h2>
        {item.tagline && <p className="text-neutral-200 text-xs mt-2 drop-shadow leading-snug line-clamp-3">{item.tagline}</p>}
      </div>
    </>
  );
}

// Single clean end card — recipe URL + brand wordmark + tagline. No @ handles,
// no hashtags. Those live in the COPY-PASTE caption block at the top of the
// page. Carousel slot is too valuable for tag text — use it for more photos.
function EndCardInner({ recipe }) {
  return (
    <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <BrandStripTop />
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <span className="text-amber-500/80 text-[10px] font-black tracking-[0.4em] uppercase">The Split Plate</span>
        <div className="w-16 h-1 bg-amber-400 my-5" />
        <h2 className="text-white text-2xl font-black leading-tight">{recipe.title}</h2>
        <p className="text-amber-400 text-sm font-bold mt-4">Cook once. Split smart.</p>
      </div>
      <div className="text-center">
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Full recipe</p>
        <p className="text-white text-sm font-semibold mt-1">thesplitplate.com</p>
        <p className="text-neutral-500 text-[10px] mt-1 break-all">/recipes/{recipe.slug}</p>
      </div>
    </div>
  );
}

// Flatten ingredient list (handles string + {text, link} + comment headers like "--- ADULT ---")
function flattenIngredients(arr) {
  if (!arr) return [];
  return arr
    .map((item) => typeof item === "string" ? item : item?.text)
    .filter(Boolean)
    .filter((line) => !/^---/.test(line)); // drop section headers
}

function longCaption(recipe, components, platform = "tiktok") {
  const handles = brandHandles(recipe, platform);
  const tags = platform === "tiktok" ? tiktokHashtagsFor(recipe) : hashtagsFor(recipe);
  const lines = [];
  const m = recipe.meta?.macros || {};

  // HOOK — first line, the one that has to land in 1 sec
  lines.push(recipe.role || recipe.title);
  lines.push("");

  // QUICK STATS
  lines.push(`✓ ${m.protein || recipe.protein}g protein`);
  lines.push(`✓ ~${m.calories || recipe.calories} cal per serving`);
  if (m.netCarbs != null) lines.push(`✓ ~${m.netCarbs}g net carbs`);
  lines.push(`✓ ${recipe.time} · ${recipe.servings} servings`);
  lines.push(`✓ One cook, two plates (adult + kid)`);
  lines.push("");

  // SPLIT
  if (recipe.splitCook?.adult?.label || recipe.splitCook?.kid?.label) {
    lines.push("THE SPLIT");
    if (recipe.splitCook.adult?.label) lines.push(`👨‍🍳 Adult: ${recipe.splitCook.adult.label}`);
    if (recipe.splitCook.kid?.label) lines.push(`🧒 Kid: ${recipe.splitCook.kid.label}`);
    lines.push("");
  }

  // INGREDIENTS — pull shared + adult + kid distinctly
  const shared = flattenIngredients(recipe.splitCook?.sharedIngredients);
  const adult = flattenIngredients(recipe.splitCook?.adult?.extraIngredients);
  const kid = flattenIngredients(recipe.splitCook?.kid?.extraIngredients);
  const flat = flattenIngredients(recipe.ingredients);

  if (shared.length) {
    lines.push("INGREDIENTS (shared)");
    shared.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (adult.length) {
    lines.push("ADULT EXTRAS");
    adult.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (kid.length) {
    lines.push("KID EXTRAS");
    kid.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (!shared.length && flat.length) {
    lines.push("INGREDIENTS");
    flat.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }

  // METHOD — first sentence of each step
  if (recipe.steps?.length) {
    lines.push("METHOD");
    recipe.steps.forEach((s, i) => {
      const first = (s.text || "").split(/[:.]/)[0].trim();
      if (first) lines.push(`${i + 1}. ${first}.`);
    });
    lines.push("");
  }

  // COMPONENTS (cross-linked sauces / sides)
  if (components.length) {
    lines.push("BUILT WITH");
    components.forEach((c) => lines.push(`• ${c.title} — thesplitplate.com/cookbook/${c.id}`));
    lines.push("");
  }

  // CTA
  lines.push(`Full recipe → thesplitplate.com/recipes/${recipe.slug}`);
  lines.push("");

  // BRAND TAGS
  if (handles.length) {
    lines.push(handles.join(" "));
    lines.push("");
  }

  // HASHTAGS
  lines.push(tags.join(" "));

  return lines.join("\n");
}

function classifyCookbook(item) {
  if (sauces.includes(item)) return "Sauce";
  if (bases.includes(item)) return "Side / Base";
  if (breakfasts.includes(item)) return "Breakfast";
  if (desserts.includes(item)) return "Dessert";
  if (quickLunches.includes(item)) return "Quick Lunch";
  return "Component";
}

export default function SocialPage() {
  const { slug } = useParams();
  const recipe = liveRecipes.find((r) => r.slug === slug);
  useMeta({ title: `Social Carousel — ${recipe?.title || "Not Found"}`, description: "Instagram carousel for screenshot + post." });

  if (!recipe) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
        <p>Recipe not found. Try <Link to="/dinners" className="text-amber-400">/dinners</Link>.</p>
      </div>
    );
  }

  // Pull up to 5 unique process images — gives us enough cards to fill a full
  // carousel without recycling text-heavy slots. De-duped by src.
  const seen = new Set();
  const processImages = (recipe.steps || [])
    .flatMap((s) => (s.images || []).map((img) => ({ src: img, caption: s.text.split(/[:.]/)[0].trim().slice(0, 60) })))
    .filter((p) => {
      if (!p.src || p.src === recipe.image || seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    })
    .slice(0, 5);

  const components = extractCookbookLinks(recipe);
  const igTags = hashtagsFor(recipe);
  const igHandles = brandHandles(recipe, "ig");
  const tiktokTags = tiktokHashtagsFor(recipe);
  const tiktokHandlesList = brandHandles(recipe, "tiktok");

  // Build the card sequence dynamically. Goal: photos > text. The carousel is
  // 1 hero + 1 macros + 1 split + N process + M components + 1 end = whatever
  // fits up to Instagram's 10-card max.
  const processCards = processImages.map((p, i) => ({
    id: `process-${i + 1}`,
    label: `Card · Process ${i + 1}`,
    filename: `${slug}-process-${i + 1}`,
    render: <ProcessImageCardInner src={p.src} caption={p.caption} />,
  }));
  const componentCards = components.map((c, i) => ({
    id: `component-${c.id}`,
    label: `Card · ${classifyCookbook(c)} → ${c.title}`,
    filename: `${slug}-component-${i + 1}-${c.id}`,
    render: <ComponentCardInner item={c} kind={classifyCookbook(c)} />,
  }));
  // Interleave: hero → macros → process1 → split → components → process2..N → end
  const allCards = [
    { id: "hero", label: "Card · Hero", filename: `${slug}-1-hero`, render: <HeroCardInner recipe={recipe} /> },
    { id: "macros", label: "Card · Macros", filename: `${slug}-2-macros`, render: <MacroCardInner recipe={recipe} /> },
    ...(processCards[0] ? [processCards[0]] : []),
    { id: "split", label: "Card · Split", filename: `${slug}-split`, render: <SplitCardInner recipe={recipe} /> },
    ...componentCards,
    ...processCards.slice(1),
    { id: "end", label: "Card · End / Recipe Link", filename: `${slug}-end`, render: <EndCardInner recipe={recipe} /> },
  ];
  // Instagram carousel max = 10 cards. If we go over, drop the last process
  // images (preserve hero, macros, split, components, end).
  const cards = allCards.slice(0, 10);

  async function saveAll() {
    // Render every card to a File first, then either share or download
    const files = [];
    for (const card of cards) {
      const el = document.querySelector(`[data-card-id="${card.id}"] [data-export]`);
      if (!el) continue;
      try {
        await preloadImagesWithCors(el);
        const dataUrl = await toPng(el, { pixelRatio: 2, width: 540, height: 540, cacheBust: true, skipFonts: false });
        const blob = await (await fetch(dataUrl)).blob();
        files.push(new File([blob], `${card.filename}.png`, { type: "image/png" }));
      } catch (e) {
        console.error(`Failed export of ${card.id}:`, e);
      }
    }
    if (files.length === 0) {
      alert("No cards exported. Check console.");
      return;
    }

    // Mobile-first: try Web Share API with all files — iOS/Android opens share sheet
    // → "Save N Images" goes straight to Photos. Single user gesture.
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files })) {
      try {
        await navigator.share({ files, title: `${recipe.title} carousel` });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
        // fall through to per-file download
      }
    }

    // Desktop fallback: trigger downloads sequentially with 400ms gaps
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.download = file.name;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-white text-2xl font-black">Social Carousel</h1>
        <p className="text-neutral-400 text-sm mt-1">{recipe.title}</p>
        <p className="text-neutral-500 text-xs mt-2">{cards.length} cards · 1080×1080 each. <span className="text-amber-400">All photos + one clean end card. @ handles and hashtags live in the copy-paste captions below (TikTok / Instagram versions) — not on the card images.</span></p>
        <p className="text-neutral-600 text-[10px] mt-1">
          <span className="text-neutral-500">On phone:</span> tap "Save all" — your share sheet pops up, choose "Save {cards.length} Images" → all go to Photos.
          <br />
          <span className="text-neutral-500">On desktop:</span> tap "Save all" — {cards.length} PNGs download to your Downloads folder.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveAll} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer">
            Save all {cards.length} images
          </button>
          <Link to={`/recipes/${recipe.slug}`} className="text-amber-400 text-xs hover:underline">← Back to recipe</Link>
        </div>

        <details className="mt-4 bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-xs" open>
          <summary className="text-pink-400 cursor-pointer font-semibold">TikTok caption · long-form · TikTok @ handles · 5 hashtags</summary>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(longCaption(recipe, components, "tiktok"));
                alert("TikTok caption copied to clipboard.");
              }}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              Copy TikTok caption
            </button>
            <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-3 rounded border border-neutral-800 max-h-96 overflow-y-auto leading-relaxed">{longCaption(recipe, components, "tiktok")}</pre>
          </div>
        </details>

        <details className="mt-3 bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-xs" open>
          <summary className="text-orange-400 cursor-pointer font-semibold">Instagram caption · long-form · IG @ handles · full hashtag set</summary>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(longCaption(recipe, components, "ig"));
                alert("Instagram caption copied to clipboard.");
              }}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              Copy Instagram caption
            </button>
            <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-3 rounded border border-neutral-800 max-h-96 overflow-y-auto leading-relaxed">{longCaption(recipe, components, "ig")}</pre>
          </div>
        </details>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {cards.map((card) => (
          <div key={card.id} data-card-id={card.id}>
            <DownloadableCard filename={card.filename} label={card.label}>
              <div data-export className="absolute inset-0 bg-neutral-950 flex flex-col">
                {card.render}
              </div>
            </DownloadableCard>
          </div>
        ))}
      </div>
    </div>
  );
}
