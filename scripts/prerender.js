/**
 * Post-build prerender script.
 * Generates route-specific index.html files with proper meta/OG tags
 * so crawlers see real content instead of an empty SPA shell.
 *
 * Run after `vite build`: node scripts/prerender.js
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const DIST = "dist";
const DOMAIN = "https://thesplitplate.com";
const template = readFileSync(join(DIST, "index.html"), "utf-8");

// Import recipe/cookbook data
const recipesRaw = readFileSync("src/data/recipes.js", "utf-8");
const cookbookRaw = readFileSync("src/data/cookbook.js", "utf-8");

// Extract live recipe slugs + metadata via regex (avoids ESM import issues with JSX)
function extractRecipes(src) {
  const recipes = [];
  const blocks = src.split(/\n {2}\{/).slice(1);
  for (const block of blocks) {
    const id = block.match(/id:\s*(\d+)/)?.[1];
    const status = block.match(/status:\s*"([^"]+)"/)?.[1];
    if (status !== "live") continue;
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const description = block.match(/description:\s*"([^"]+)"/)?.[1];
    const image = block.match(/image:\s*"([^"]+)"/)?.[1];
    const protein = block.match(/protein:\s*(\d+)/)?.[1];
    const calories = block.match(/calories:\s*(\d+)/)?.[1];
    const time = block.match(/time:\s*"([^"]+)"/)?.[1];
    const servings = block.match(/servings:\s*(\d+)/)?.[1];
    if (slug && title) recipes.push({ id, slug, title, description, image, protein, calories, time, servings });
  }
  return recipes;
}

function extractCookbookItems(src) {
  const items = [];
  // Match recipe blocks that start with { followed by id: "slug-like-id"
  const blockRegex = /\{\s*\n\s*id:\s*"([a-z0-9-]+)",\s*\n\s*title:\s*"([^"]+)",\s*\n\s*tagline:\s*"([^"]+)",/g;
  let m;
  while ((m = blockRegex.exec(src)) !== null) {
    const id = m[1];
    // Find heroImage near this position
    const after = src.slice(m.index, m.index + 300);
    const hero = after.match(/heroImage:\s*"([^"]+)"/)?.[1] || "";
    items.push({ id, title: m[2], description: m[3], image: hero });
  }
  return items;
}

const recipes = extractRecipes(recipesRaw);
const cookbookItems = extractCookbookItems(cookbookRaw);

// Define all routes with metadata
const routes = [
  { path: "/", title: "The Split Plate — One Meal. Two Plates.", description: "High-protein family dinners with the Split Cook Method. One cook, two plates — adults and kids from the same workflow." },
  { path: "/dinners", title: "Dinners — The Split Plate", description: "High-protein family dinners with the Split Cook Method. Same cook, different plates for adults and kids." },
  { path: "/cookbook", title: "Power-Ups — The Split Plate", description: "Sauces, breakfasts, desserts, and quick meals — high-protein upgrades that take 10 minutes or less." },
  { path: "/about", title: "About — The Split Plate", description: "One meal. Two plates. The Split Plate is a dinner system for families who want high-protein meals without cooking twice." },
  { path: "/fan", title: "In the Hands of the Fan — The Split Plate", description: "Can't decide what to cook? Spin the fan and let it pick your dinner." },
  ...recipes.map((r) => {
    const idx = recipesRaw.indexOf(`slug: "${r.slug}"`);
    const ingredients = idx > -1 ? extractIngredients(recipesRaw, idx) : [];
    return {
      path: `/recipes/${r.slug}`,
      title: `${r.title} — The Split Plate`,
      description: r.description || `${r.title} — ${r.protein}g protein, ${r.calories} cal, ${r.time}.`,
      image: r.image,
      schema: buildRecipeSchema(r, ingredients),
    };
  }),
  ...cookbookItems.map((c) => ({
    path: `/cookbook/${c.id}`,
    title: `${c.title} — The Split Plate`,
    description: c.description,
    image: c.image,
  })),
];

function extractIngredients(src, startIdx) {
  // Extract ingredient strings from recipe source starting near startIdx
  const after = src.slice(startIdx, startIdx + 8000);
  const ingredBlock = after.match(/ingredients:\s*\[([\s\S]*?)\],/);
  if (!ingredBlock) return [];
  const raw = ingredBlock[1];
  const items = [];
  // Match plain strings: "ingredient text"
  // Skip strings that are URLs (/cookbook/...) or section headers (---)
  for (const m of raw.matchAll(/"([^"]+)"/g)) {
    const s = m[1];
    if (s.startsWith("---") || s.startsWith("/") || s === "text" || s === "link") continue;
    items.push(s);
  }
  return items;
}

function buildRecipeSchema(r, ingredients) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    description: r.description || "",
    image: r.image ? `${DOMAIN}${r.image}` : undefined,
    totalTime: `PT${(r.time || "30 min").replace(/\s*min.*/, "")}M`,
    recipeYield: `${r.servings || 4} servings`,
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${r.calories} calories`,
      proteinContent: `${r.protein}g`,
    },
    author: { "@type": "Person", name: "The Split Plate" },
    publisher: { "@type": "Organization", name: "The Split Plate", url: DOMAIN },
    recipeCategory: "Dinner",
    recipeCuisine: "American",
  };
  if (ingredients && ingredients.length > 0) {
    schema.recipeIngredient = ingredients;
  }
  return JSON.stringify(schema);
}

function generateHTML(route) {
  const { path, title, description, image, schema } = route;
  const url = `${DOMAIN}${path}`;
  const ogImage = image ? `${DOMAIN}${image}` : `${DOMAIN}/images/logo.png`;

  let html = template;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Replace/add meta description
  html = html.replace(
    /<meta name="description"[^>]*\/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );

  // Insert OG tags + canonical + schema before </head>
  const headInsert = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${schema ? "article" : "website"}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:site_name" content="The Split Plate" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
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

// Auto-generate sitemap from the same routes
const today = new Date().toISOString().split("T")[0];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => {
  const priority = r.path === "/" ? "1.0" : r.path.startsWith("/recipes/") ? "0.8" : r.path.startsWith("/cookbook/") && r.path !== "/cookbook" ? "0.7" : "0.9";
  return `  <url><loc>${DOMAIN}${r.path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
}).join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemapXml);

console.log(`Prerendered ${count} routes. Sitemap: ${routes.length} URLs.`);
