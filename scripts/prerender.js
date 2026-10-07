/**
 * Post-build prerender script.
 * Generates route-specific index.html files with proper meta/OG tags
 * so crawlers see real content instead of an empty SPA shell.
 *
 * Run after `vite build`: node scripts/prerender.js
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { sauces, breakfasts, quickLunches, batchPrep, desserts, creamis, bases, powerups, snackBoxes } from "../src/data/cookbook.js";
import { liveRecipes } from "../src/data/recipes.js";

const DIST = "dist";
const DOMAIN = "https://thesplitplate.com";
const template = readFileSync(join(DIST, "index.html"), "utf-8").replace(/\r\n?/g, "\n");
if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender needs a fresh Vite build with an empty root container. Run vite build first.');
}

const recipes = liveRecipes;
const cookbookItems = [
  [sauces, "Sauce"], [breakfasts, "Breakfast"], [quickLunches, "Lunch"],
  [batchPrep, "Dinner"], [desserts, "Dessert"], [creamis, "Dessert"],
  [bases, "Base"], [powerups, "Sauce"], [snackBoxes, "Snack"],
].flatMap(([items, recipeCategory]) => items.map((item) => ({
  ...item, recipeCategory, description: item.tagline, image: item.heroImage || "",
})));

// Define all routes with metadata
const routes = [
  { path: "/", title: "The Split Plate — One Meal. Two Plates.", description: "High-protein family dinners with the Split Cook Method. One cook, two plates — adults and kids from the same workflow." },
  { path: "/dinners", title: "Dinners — The Split Plate", description: "High-protein family dinners with the Split Cook Method. Same cook, different plates for adults and kids." },
  { path: "/cookbook", title: "Power-Ups — The Split Plate", description: "Sauces, breakfasts, desserts, and quick meals — high-protein upgrades that take 10 minutes or less." },
  { path: "/leftovers", title: "Use Up Leftover Ingredients — The Split Plate", description: "Pick what's in your fridge — we'll find recipes that use it. Search by ingredient or brand across every Split Plate dinner." },
  { path: "/about", title: "About — The Split Plate", description: "One meal. Two plates. The Split Plate is a dinner system for families who want high-protein meals without cooking twice." },
  { path: "/fan", title: "In the Hands of the Fan — The Split Plate", description: "Can't decide what to cook? Spin the fan and let it pick your dinner." },
  { path: "/social", title: "Social Carousels — The Split Plate", description: "Private index of carousel pages for Instagram posting.", noindex: true },
  { path: "/privacy", title: "Privacy Policy — The Split Plate", description: "How The Split Plate handles your data — what we collect, what we don't, and how the Split Plate posting tool uses social account access." },
  { path: "/terms", title: "Terms of Service — The Split Plate", description: "The terms for using The Split Plate website and the Split Plate posting tool." },
  { path: "/studio", title: "Studio — The Split Plate", description: "Private caption composer.", noindex: true },
  { path: "/favorites", title: "Favorites — The Split Plate", description: "Products that earned a permanent place in our kitchen. Curated Amazon-affiliate picks — purchased, used, and we'd buy them again.", image: "/images/deli-dill-snack-box/hero-deli-dill-snack-box-polished.webp" },
  { path: "/favorites/snack-box-essentials", title: "Snack Box Essentials — Favorites", description: "The gear and staples behind our Snack Box Series — the containers we've used for two years plus the swaps that keep kid snacks high-protein.", image: "/images/deli-dill-snack-box/hero-deli-dill-snack-box-polished.webp" },
  { path: "/favorites/creami-essentials", title: "Creami Essentials — Favorites", description: "The Ninja Creami + the saved 4-line base. Everything that runs across the CrumblCreamiCut series on The Split Plate.", image: "/images/white-drop-cookies-n-creme-creami/hero-finished-white-drop-cookies-n-creme-creami-polished.webp" },
  { path: "/favorites/proffee-gear", title: "Proffee Gear — Favorites", description: "The 100-calorie iced protein coffee build — dairy base, instant coffee, sugar-free syrup. What we buy for daily proffee.", image: "/images/100-calorie-iced-protein-coffee/hero-finished-iced-protein-coffee-polished.webp" },
  { path: "/favorites/freezer-weeknight", title: "Freezer & Weeknight Shortcuts — Favorites", description: "The pantry and freezer staples that keep a 30-minute dinner actually 30 minutes. Kirkland ghee, Bare Bones broth, Dan-O's, TJ shawarma chicken.", image: "/images/split-protein-creamy-spinach-pasta/hero-split-adult-kid-plates-polished.webp" },
  { path: "/favorites/breakfast-powerups", title: "Breakfast Powerups — Favorites", description: "The fast, protein-forward breakfasts we default to on rest days. Happy Egg heritage-breed eggs, Bilinski's Cajun chicken sausage, Tony Chachere's Creole seasoning.", image: "/images/runny-sunny-eggs-chicken-sausage/hero-runny-sunny-eggs-chicken-sausage-polished.webp" },
  ...recipes.map((r) => {
    return {
      path: `/recipes/${r.slug}`,
      title: `${r.title} — The Split Plate`,
      description: r.description || `${r.title} — ${r.protein}g protein, ${r.calories} cal, ${r.time}.`,
      image: r.image,
      schema: buildRecipeSchema(r, "Dinner"),
    };
  }),
  ...recipes.map((r) => ({
    path: `/social/${r.slug}`,
    title: `Social Carousel — ${r.title} — The Split Plate`,
    description: `Instagram carousel for ${r.title}.`,
    image: r.image,
    noindex: true,
  })),
  ...cookbookItems.map((c) => ({
    path: `/social/cookbook/${c.id}`,
    title: `Social Carousel — ${c.title} — The Split Plate`,
    description: `Instagram carousel for ${c.title}.`,
    image: c.image,
    noindex: true,
  })),
  ...cookbookItems.map((c) => ({
    path: `/cookbook/${c.id}`,
    title: `${c.title} — The Split Plate`,
    description: c.description,
    image: c.image,
    schema: buildRecipeSchema(c, "Cookbook"),
  })),
];

// Convert "PREHEAT + RACK: Oven to 425°F." → {name: "Preheat + Rack", text: "Oven to 425°F."}
// Step text without a colon-prefix label just gets `text`, no `name`.
function toHowToStep(text) {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 40) {
    const label = text.slice(0, colonIdx).trim();
    const body = text.slice(colonIdx + 1).trim();
    if (body) return { "@type": "HowToStep", name: titleCase(label), text: body };
  }
  return { "@type": "HowToStep", text };
}
function titleCase(s) {
  return s.split(/\s+/).map((w) => w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(" ");
}

function recipeTotalMinutes(r) {
  if (typeof r?.meta?.totalMinutes === "number") return r.meta.totalMinutes;
  const raw = r?.time || "";
  if (/\+|overnight|\d+\s*[-–]\s*\d+/i.test(raw)) return null;
  const first = raw.match(/^\s*(?:about\s+|~)?(\d+)\s*(hr|hour|min|minute)/i);
  if (!first) return null;
  const hours = /^h/i.test(first[2]);
  const extraMinutes = hours ? Number(raw.slice(first[0].length).match(/^\s*(\d+)\s*min/i)?.[1] || 0) : 0;
  return Number(first[1]) * (hours ? 60 : 1) + extraMinutes;
}

function recipeIngredients(r) {
  const lists = r.splitCook
    ? [r.splitCook.sharedIngredients, r.splitCook.adult?.extraIngredients, r.splitCook.kid?.extraIngredients]
    : [r.ingredients];
  return lists.flatMap((list) => Array.isArray(list) ? list : [])
    .map((entry) => typeof entry === "string" ? entry : entry?.text)
    .filter((entry) => entry && !entry.startsWith("---") && !/^[A-Z][^:]{0,45}:$/.test(entry));
}

function recipeSteps(r) {
  const lists = r.splitCook
    ? [r.splitCook.sharedSteps, r.splitCook.adult?.steps, r.splitCook.kid?.steps]
    : [r.steps];
  return lists.flatMap((list) => Array.isArray(list) ? list : [])
    .map((step) => typeof step === "string" ? step : step?.text)
    .filter(Boolean);
}

function buildRecipeSchema(r, category) {
  const ingredients = recipeIngredients(r);
  const steps = recipeSteps(r);
  if (!ingredients.length || !steps.length) return null;
  const minutes = recipeTotalMinutes(r);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    description: r.tagline || r.description || "",
    image: r.image ? `${DOMAIN}${r.image}` : undefined,
    ...(minutes ? { totalTime: `PT${minutes}M` } : {}),
    recipeYield: String(r.servings || 1),
    author: { "@type": "Person", name: "Tushar Sharma" },
    recipeCategory: category === "Cookbook" ? r.recipeCategory : category,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map(toHowToStep),
  };
  if (!r.splitCook && r.caloriesPerServing != null && r.proteinPerServing != null) {
    schema.nutrition = { "@type": "NutritionInformation", calories: `${r.caloriesPerServing} calories`, proteinContent: `${r.proteinPerServing}g` };
  }
  if (r.tags?.length) schema.keywords = r.tags.join(", ");
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

// Google SERP truncates meta descriptions at ~155-160 chars; OG previews
// truncate ~200. Cap at 155 with smart boundary (sentence > word > hard cut).
// Mirrors the runtime truncation in src/hooks/useMeta.js so prerendered HTML
// matches what the client-side hook would render.
function truncateDesc(s, max = 155) {
  if (!s || s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastPeriod = slice.lastIndexOf(". ");
  if (lastPeriod > max * 0.55) return slice.slice(0, lastPeriod + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

function generateHTML(route) {
  const { path, title, description, image, schema, noindex } = route;
  const url = `${DOMAIN}${path}`;
  const ogImage = image ? `${DOMAIN}${image}` : `${DOMAIN}/images/logo.png`;
  const seoDescription = truncateDesc(description);

  let html = template;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace/add meta description (truncated at 155 for SERP-fit)
  html = html.replace(
    /<meta name="description"[^>]*\/>/,
    `<meta name="description" content="${escapeAttr(seoDescription)}" />`
  );

  // Insert OG tags + canonical + schema before </head>
  const headInsert = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(seoDescription)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${schema ? "article" : "website"}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:site_name" content="The Split Plate" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    noindex ? `<meta name="robots" content="noindex, nofollow" />` : "",
    schema ? `<script type="application/ld+json">${schema}</script>` : "",
  ].filter(Boolean).join("\n    ");

  html = html.replace("</head>", `    ${headInsert}\n  </head>`);

  // Add noscript content for crawlers
  const noscript = `<noscript><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);

  return html;
}

function escapeAttr(s) {
  return (s || "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function escapeHTML(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Generate files
let count = 0;
for (const route of routes) {
  const html = generateHTML(route);
  const filePath = route.path === "/"
    ? join(DIST, "index.html")
    : join(DIST, route.path, "index.html");

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
  count++;
}

// Auto-generate sitemap — omit lastmod (same date on every URL is noise)
const sitemapRoutes = routes.filter((r) => !r.noindex && !r.path.startsWith("/social"));
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map((r) => {
  const priority = r.path === "/" ? "1.0" : r.path.startsWith("/recipes/") ? "0.8" : r.path.startsWith("/cookbook/") && r.path !== "/cookbook" ? "0.7" : "0.9";
  return `  <url><loc>${DOMAIN}${r.path}</loc><priority>${priority}</priority></url>`;
}).join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemapXml);

console.log(`Prerendered ${count} routes. Sitemap: ${sitemapRoutes.length} URLs.`);
