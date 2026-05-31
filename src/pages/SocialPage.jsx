import { useParams, Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import useMeta from "../hooks/useMeta";

// Brand palette (matches tailwind classes used across the site)
// bg-neutral-950 = #0a0a0a, amber-400 = #fbbf24, amber-500 = #f59e0b
// red-400 = #f87171 (adult), green-400 = #4ade80 (kid)

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

function brandHandles(recipe) {
  // Static IG handle map — verified against the most common brands on the site.
  // Add more as new brands ship.
  const KNOWN = {
    "Dan-O's": "@danosseasoning",
    "Kirkland Signature": "@kirklandsignature_costco",
    "Kirkland": "@kirklandsignature_costco",
    "Laughing Cow": "@thelaughingcow",
    "Lea & Perrins": "@leaandperrins",
    "Smash Kitchen": "@smashkitchenco",
    "Kikkoman": "@kikkoman_usa",
    "General Mills": "@generalmills",
    "Lee Kum Kee": "@leekumkeeusa",
    "Verka": "@verkadairy",
    "Red Boat": "@redboatfishsauce",
    "Tanimura & Antle": "@tanimuraantle",
    "Chosen Foods": "@chosenfoods",
    "Herdez": "@herdez",
    "Daisy": "@daisybrand",
    "Fage": "@fageusa",
    "Philadelphia": "@philadelphia",
    "Whole Earth": "@wholeearthsweetener",
    "Ghirardelli": "@ghirardelli",
    "Nescafé": "@nescafe_usa",
    "HighKey": "@highkeysnacks",
    "PEScience": "@pescience",
    "Little Potato Co.": "@littlepotatoco",
    "NY Style Sausage Co.": "@nystylesausage",
    "Dynasty": "@dynasty.foods",
    "Bare Bones": "@barebonesbroth",
    "Anthony's": "@anthonys.organic",
    "Lily's": "@lilyssweets",
    "Thrive Market": "@thrivemarket",
    "Fairlife": "@fairlife",
    "Nakano": "@nakanorice",
    "Taste Flavor Co.": "@tasteflavorco",
    "Opportuniteas": "@opportuniteas",
    "Bob's Red Mill": "@bobsredmill",
    "Marketside (Walmart)": "@marketside",
    "Pete's Pasta": "@petespasta",
    "Rao's": "@raoshomemade",
    "Barilla": "@barillaus",
    "Falls Brand": "@fallsbrand",
    "365 Whole Foods": "@wholefoods",
  };
  return (recipe.brands || [])
    .map((b) => KNOWN[b.name])
    .filter(Boolean);
}

// 1080x1080 Instagram square card. We render at ~540x540 in browser but the
// layout is locked square — Tushar screenshots and the post will scale up cleanly.
function Card({ children, className = "" }) {
  return (
    <div className={`relative aspect-square w-full max-w-[540px] bg-neutral-950 overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function BrandStripTop() {
  return (
    <div className="absolute top-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-20 pointer-events-none">
      <span className="text-amber-500/80 text-[10px] font-black tracking-[0.2em] uppercase">The Split Plate</span>
      <span className="text-neutral-500 text-[10px] tracking-wider">thesplitplate.com</span>
    </div>
  );
}

function HeroCard({ recipe }) {
  return (
    <Card>
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
    </Card>
  );
}

function MacroCard({ recipe }) {
  const m = recipe.meta?.macros || {};
  return (
    <Card className="p-7 justify-center">
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
    </Card>
  );
}

function ProcessImageCard({ src, caption }) {
  if (!src) return null;
  return (
    <Card>
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/30" />
      <BrandStripTop />
      {caption && (
        <div className="relative z-10 mt-auto p-6">
          <div className="w-8 h-0.5 bg-amber-400 mb-2" />
          <p className="text-white text-base font-semibold drop-shadow-lg">{caption}</p>
        </div>
      )}
    </Card>
  );
}

function SplitCard({ recipe }) {
  const adult = recipe.splitCook?.adult;
  const kid = recipe.splitCook?.kid;
  return (
    <Card className="p-7 justify-center">
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
    </Card>
  );
}

function HashtagCard({ recipe }) {
  const tags = hashtagsFor(recipe);
  const handles = brandHandles(recipe);
  return (
    <Card className="p-7 justify-center">
      <BrandStripTop />
      <div className="space-y-4">
        <div>
          <div className="w-12 h-1 bg-amber-400 mb-3" />
          <h2 className="text-white text-xl font-black">Recipe at thesplitplate.com</h2>
          <p className="text-neutral-400 text-xs mt-1 break-words">/recipes/{recipe.slug}</p>
        </div>
        {handles.length > 0 && (
          <div>
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">Brands featured</p>
            <p className="text-neutral-300 text-[11px] leading-relaxed break-words">{handles.join(" · ")}</p>
          </div>
        )}
        <div>
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">Tags</p>
          <p className="text-neutral-400 text-[10px] leading-relaxed break-words">{tags.join(" ")}</p>
        </div>
      </div>
    </Card>
  );
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

  // Pull up to 3 process images from the recipe steps
  const processImages = (recipe.steps || [])
    .flatMap((s) => (s.images || []).map((img) => ({ src: img, caption: s.text.split(/[:.]/)[0].trim().slice(0, 60) })))
    .filter((p) => p.src && p.src !== recipe.image)
    .slice(0, 3);

  const tags = hashtagsFor(recipe);
  const handles = brandHandles(recipe);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-white text-2xl font-black">Social Carousel</h1>
        <p className="text-neutral-400 text-sm mt-1">{recipe.title}</p>
        <p className="text-neutral-500 text-xs mt-2">Right-click each card → Save as Image, OR screenshot at 1080×1080 for Instagram. 6 cards = a full carousel post.</p>
        <div className="mt-4 text-xs space-y-2">
          <details className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
            <summary className="text-amber-400 cursor-pointer font-semibold">Copy-paste caption + tags</summary>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-neutral-500 mb-1">Suggested caption:</p>
                <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-2 rounded border border-neutral-800">{recipe.hook || recipe.makeThisWhen}</pre>
              </div>
              {handles.length > 0 && (
                <div>
                  <p className="text-neutral-500 mb-1">Brand tags:</p>
                  <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-2 rounded border border-neutral-800">{handles.join(" ")}</pre>
                </div>
              )}
              <div>
                <p className="text-neutral-500 mb-1">Hashtags:</p>
                <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-2 rounded border border-neutral-800">{tags.join(" ")}</pre>
              </div>
            </div>
          </details>
        </div>
      </div>
      <div className="max-w-2xl mx-auto space-y-6">
        <HeroCard recipe={recipe} />
        <MacroCard recipe={recipe} />
        {processImages[0] && <ProcessImageCard src={processImages[0].src} caption={processImages[0].caption} />}
        <SplitCard recipe={recipe} />
        {processImages[1] && <ProcessImageCard src={processImages[1].src} caption={processImages[1].caption} />}
        <HashtagCard recipe={recipe} />
      </div>
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <Link to={`/recipes/${recipe.slug}`} className="text-amber-400 text-sm hover:underline">← Back to recipe</Link>
      </div>
    </div>
  );
}
