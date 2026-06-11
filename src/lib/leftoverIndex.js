// Leftover Ingredient Index
//
// Derives two indexes from recipes:
//   1. brandIndex — every branded SKU mentioned in recipes[].brands[]
//      (Kirkland Bone Broth, Wholly Guacamole, Rao's Alfredo, etc.)
//      Keyed by slugified brand+item, value: { brand, recipeIds }
//
//   2. genericIndex — generic ingredients (iceberg lettuce, ground beef,
//      asparagus, etc.) derived from recipes[].ingredients[] via keyword
//      matching. Keyed by ingredient slug, value: { label, category, recipeIds }
//
// Both indexes are unified by category for the LeftoversPage chip layout.
//
// Plus: findCrossRecipePairs(recipe, allRecipes, n) returns the top-N other
// recipes ranked by ingredient overlap. Used by LeftoversPanel on recipe pages.

// --- Generic ingredient catalog ----------------------------------------------
// Keys = slugs (used in URLs, IDs). Values = { label (display), category,
// match (regex or array of keyword strings that mark a recipe as having
// this ingredient when ANY of them appear in ingredients[] strings) }.
//
// Match keywords are CASE-INSENSITIVE substring tests against the joined
// ingredients[] text. Keep keywords distinctive — avoid false positives.

const GENERIC_INGREDIENTS = {
  // ─── Protein ──────────────────────────────────────────────────────────
  "ground-beef": {
    label: "Ground Beef",
    category: "Protein",
    match: ["ground beef", "93/7", "80/20"],
  },
  "ground-pork": {
    label: "Ground Pork",
    category: "Protein",
    match: ["ground pork", "pork mince"],
  },
  "chicken-thighs": {
    label: "Chicken Thighs",
    category: "Protein",
    match: ["chicken thigh", "skin-on thigh", "bone-in thigh", "boneless thigh"],
  },
  "chicken-breast": {
    label: "Chicken Breast",
    category: "Protein",
    match: ["chicken breast", "chicken fillet", "kirkland chicken"],
  },
  "italian-sausage": {
    label: "Italian Sausage",
    category: "Protein",
    match: ["italian sausage", "falls brand"],
  },
  "ground-chicken-sausage": {
    label: "Chicken Sausage",
    category: "Protein",
    match: ["chicken sausage", "bilinski"],
  },
  "beef-bacon": {
    label: "Beef Bacon",
    category: "Protein",
    match: ["beef bacon", "godshall"],
  },
  "steak": {
    label: "Steak / Sliced Beef",
    category: "Protein",
    match: ["bavette", "flank", "tri-tip", "sirloin", "quicksteak"],
  },
  "pork-chops": {
    label: "Pork Chops",
    category: "Protein",
    match: ["pork chop"],
  },
  "carnitas": {
    label: "Pre-Cooked Carnitas",
    category: "Protein",
    match: ["del real", "carnitas"],
  },
  "frozen-wings": {
    label: "Frozen Wings",
    category: "Protein",
    match: ["frozen wings", "buffalo wings", "kinder"],
  },
  "eggs": {
    label: "Eggs",
    category: "Protein",
    match: ["egg, ", "eggs,", "egg whites", " eggs "],
  },

  // ─── Vegetables ───────────────────────────────────────────────────────
  "iceberg-lettuce": {
    label: "Iceberg Lettuce",
    category: "Vegetables",
    match: ["iceberg"],
  },
  "romaine-lettuce": {
    label: "Romaine Lettuce",
    category: "Vegetables",
    match: ["romaine"],
  },
  "sweet-gem-lettuce": {
    label: "Sweet Gem / Little Gem",
    category: "Vegetables",
    match: ["sweet gem", "little gem", "tanimura"],
  },
  "spinach": {
    label: "Spinach",
    category: "Vegetables",
    match: ["spinach", "marketside baby"],
  },
  "asparagus": {
    label: "Asparagus",
    category: "Vegetables",
    match: ["asparagus"],
  },
  "broccoli": {
    label: "Broccoli",
    category: "Vegetables",
    match: ["broccoli"],
  },
  "roma-tomatoes": {
    label: "Roma Tomatoes",
    category: "Vegetables",
    match: ["roma tomato", "roma tomatoes"],
  },
  "cucumber": {
    label: "Cucumber",
    category: "Vegetables",
    match: ["cucumber"],
  },
  "carrots": {
    label: "Carrots",
    category: "Vegetables",
    match: ["baby carrot", "carrots"],
  },
  "green-onions": {
    label: "Green Onions / Scallions",
    category: "Vegetables",
    match: ["green onion", "scallion"],
  },
  "fresh-chilies": {
    label: "Fresh Chilies",
    category: "Vegetables",
    match: ["thai chili", "red chili", "fresh chili"],
  },
  "potatoes": {
    label: "Potatoes",
    category: "Vegetables",
    match: ["potato", "checkers fries", "smashed potato"],
  },

  // ─── Carbs ────────────────────────────────────────────────────────────
  "corn-tortillas": {
    label: "Corn Tortillas",
    category: "Carbs",
    match: ["corn tortilla", "yellow corn tortilla"],
  },
  "flour-tortillas": {
    label: "Flour Tortillas",
    category: "Carbs",
    match: ["flour tortilla", "carb-balance tortilla", "mission tortilla", "burrito"],
  },
  "rice": {
    label: "Rice",
    category: "Carbs",
    match: ["white rice", "basmati", "jasmine rice", "long-grain rice"],
  },
  "penne": {
    label: "Penne Pasta",
    category: "Carbs",
    match: ["penne", "carbe diem", "barilla mini"],
  },
  "rotini": {
    label: "Rotini / Protein Pasta",
    category: "Carbs",
    match: ["rotini", "pete's pasta"],
  },
  "slider-buns": {
    label: "Slider Rolls",
    category: "Carbs",
    match: ["slider roll", "slider bun"],
  },
  "keto-buns": {
    label: "Keto Buns",
    category: "Carbs",
    match: ["keto bun", "keto hamburger", "bettergoods keto"],
  },
  "tortilla-chips": {
    label: "Tortilla Chips",
    category: "Carbs",
    match: ["tostitos", "tortilla chip", "yellow corn tortilla chip"],
  },
  "protein-chips": {
    label: "Quest Protein Chips",
    category: "Carbs",
    match: ["quest protein chip", "quest loaded taco", "quest chip"],
  },
  "gnocchi": {
    label: "Gnocchi",
    category: "Carbs",
    match: ["gnocchi"],
  },
  "ramen-noodles": {
    label: "Ramen Noodles",
    category: "Carbs",
    match: ["ramen", "buldak", "miyoka"],
  },

  // ─── Dairy ────────────────────────────────────────────────────────────
  "cheddar": {
    label: "Cheddar Cheese",
    category: "Dairy",
    match: ["cheddar"],
  },
  "cottage-cheese": {
    label: "Cottage Cheese",
    category: "Dairy",
    match: ["cottage cheese", "daisy low-fat cottage"],
  },
  "sour-cream": {
    label: "Sour Cream",
    category: "Dairy",
    match: ["sour cream", "daisy sour"],
  },
  "milk": {
    label: "Milk (Fairlife)",
    category: "Dairy",
    match: ["fairlife", "skim milk", "whole milk"],
  },
  "laughing-cow": {
    label: "Laughing Cow Wedges",
    category: "Dairy",
    match: ["laughing cow"],
  },
  "blue-cheese": {
    label: "Blue Cheese",
    category: "Dairy",
    match: ["blue cheese"],
  },
  "mozzarella": {
    label: "Mozzarella",
    category: "Dairy",
    match: ["mozzarella", "pepper jack"],
  },

  // ─── Sauce & Flavor ───────────────────────────────────────────────────
  "bone-broth": {
    label: "Chicken Bone Broth",
    category: "Sauce & Flavor",
    match: ["bone broth", "kirkland chicken bone broth", "kirkland organic chicken", "kirkland sipping"],
  },
  "alfredo-sauce": {
    label: "Alfredo Sauce",
    category: "Sauce & Flavor",
    match: ["alfredo", "rao's homemade alfredo"],
  },
  "guacamole": {
    label: "Guacamole",
    category: "Sauce & Flavor",
    match: ["guacamole", "wholly guac", "wholly guacamole"],
  },
  "pickled-onions": {
    label: "Pickled Red Onions",
    category: "Sauce & Flavor",
    match: ["pickled red onion", "mezzetta pickled"],
  },
  "hot-sauce": {
    label: "Hot Sauce",
    category: "Sauce & Flavor",
    match: ["lucky dog", "hot sauce", "cholula", "tapatio"],
  },
  "soy-sauce": {
    label: "Soy Sauce",
    category: "Sauce & Flavor",
    match: ["kikkoman", "soy sauce"],
  },
  "fish-sauce": {
    label: "Fish Sauce",
    category: "Sauce & Flavor",
    match: ["red boat", "fish sauce"],
  },
  "chili-crisp": {
    label: "Chili Crisp / Chili Oil",
    category: "Sauce & Flavor",
    match: ["chili crisp", "chili oil", "dynasty sesame", "lee kum kee"],
  },
  "danos-seasoning": {
    label: "Dan-O's Seasoning",
    category: "Sauce & Flavor",
    match: ["dan-o"],
  },
  "taco-seasoning": {
    label: "Taco Seasoning",
    category: "Sauce & Flavor",
    match: ["spiceology taco", "taco seasoning"],
  },
  "ginger-garlic-paste": {
    label: "Ginger Garlic Paste",
    category: "Sauce & Flavor",
    match: ["verka", "ginger garlic paste"],
  },
  "chimichurri": {
    label: "Chimichurri",
    category: "Sauce & Flavor",
    match: ["chimichurri", "spiceology chimichurri"],
  },
  "money-mustard": {
    label: "Money Mustard",
    category: "Sauce & Flavor",
    match: ["money mustard"],
  },
  "caesar-dressing": {
    label: "Caesar Dressing",
    category: "Sauce & Flavor",
    match: ["bolthouse caesar", "caesar dressing"],
  },
  "herdez-cilantro": {
    label: "Herdez Avocado Cilantro",
    category: "Sauce & Flavor",
    match: ["herdez", "avocado cilantro"],
  },

  // ─── Pantry / Fats ────────────────────────────────────────────────────
  "avocado-oil-spray": {
    label: "Avocado Oil Spray",
    category: "Pantry",
    match: ["chosen foods", "avocado oil spray", "cooking spray"],
  },
  "olive-oil": {
    label: "Olive Oil",
    category: "Pantry",
    match: ["olive oil", "evoo"],
  },
  "ghee": {
    label: "Ghee",
    category: "Pantry",
    match: ["ghee"],
  },
};

// --- Index builders ----------------------------------------------------------

function slugifyBrand(name, item) {
  const itemKey = item.split(" (")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const nameKey = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${nameKey}--${itemKey}`.slice(0, 80);
}

export function buildBrandIndex(recipes) {
  const index = {};
  for (const r of recipes) {
    if (!r.brands || !Array.isArray(r.brands)) continue;
    for (const b of r.brands) {
      const key = slugifyBrand(b.name, b.item);
      if (!index[key]) {
        index[key] = {
          slug: key,
          label: b.name,
          sublabel: b.item.split(" (")[0],
          image: b.image,
          url: b.url,
          category: categorizeBrand(b),
          recipeIds: [],
        };
      }
      if (!index[key].recipeIds.includes(r.id)) {
        index[key].recipeIds.push(r.id);
      }
    }
  }
  return index;
}

function categorizeBrand(brand) {
  const text = `${brand.name} ${brand.item}`.toLowerCase();
  if (/broth|alfredo|guac|hot sauce|seasoning|chili|chimichurri|mustard|fish sauce|soy|sesame|caesar|cilantro|paste|spice|dan-o/.test(text)) return "Sauce & Flavor";
  if (/cheese|cheddar|cottage|sour cream|wedge|milk|fairlife|laughing/.test(text)) return "Dairy";
  if (/tortilla|chip|rice|penne|pasta|bun|gnocchi|noodle|ramen|wrap|roll/.test(text)) return "Carbs";
  if (/beef|pork|chicken|sausage|carnitas|bacon|steak|fillet|thigh|chop|wing/.test(text)) return "Protein";
  if (/lettuce|tomato|asparagus|spinach|broccoli|onion|chili|carrot|cucumber/.test(text)) return "Vegetables";
  return "Pantry";
}

export function buildGenericIndex(recipes) {
  const index = {};
  for (const [slug, info] of Object.entries(GENERIC_INGREDIENTS)) {
    index[slug] = {
      slug,
      label: info.label,
      category: info.category,
      recipeIds: [],
    };
  }
  for (const r of recipes) {
    if (!r.ingredients || !Array.isArray(r.ingredients)) continue;
    const text = r.ingredients.join(" || ").toLowerCase();
    for (const [slug, info] of Object.entries(GENERIC_INGREDIENTS)) {
      for (const keyword of info.match) {
        if (text.includes(keyword.toLowerCase())) {
          if (!index[slug].recipeIds.includes(r.id)) {
            index[slug].recipeIds.push(r.id);
          }
          break;
        }
      }
    }
  }
  // Strip ingredients with no matches
  for (const slug of Object.keys(index)) {
    if (index[slug].recipeIds.length === 0) delete index[slug];
  }
  return index;
}

// Unified index — both brands AND generics in one lookup, keyed by slug.
// Generic slugs win when there's a collision (generics are more findable).
export function buildUnifiedIndex(recipes) {
  const brand = buildBrandIndex(recipes);
  const generic = buildGenericIndex(recipes);
  return { brand, generic };
}

// --- Search / filter ---------------------------------------------------------

// Given an array of selected ingredient slugs (mix of brand + generic),
// return recipes that have ALL selected ingredients (AND match), sorted
// by # of total matches (most-matched first).
export function findRecipesMatching(selectedSlugs, brandIndex, genericIndex, allRecipes, mode = "AND") {
  if (!selectedSlugs || selectedSlugs.length === 0) return [];
  const recipeIdSets = selectedSlugs.map((slug) => {
    const entry = brandIndex[slug] || genericIndex[slug];
    return new Set(entry?.recipeIds || []);
  });
  let matchingIds;
  if (mode === "AND") {
    matchingIds = recipeIdSets.reduce((acc, set) => {
      if (acc === null) return new Set(set);
      return new Set([...acc].filter((id) => set.has(id)));
    }, null);
  } else {
    matchingIds = new Set();
    for (const set of recipeIdSets) {
      for (const id of set) matchingIds.add(id);
    }
  }
  // Build result with match count for sort
  const results = [...matchingIds]
    .map((id) => {
      const recipe = allRecipes.find((r) => r.id === id);
      if (!recipe) return null;
      const matchCount = recipeIdSets.reduce((acc, set) => acc + (set.has(id) ? 1 : 0), 0);
      return { recipe, matchCount };
    })
    .filter(Boolean);
  results.sort((a, b) => b.matchCount - a.matchCount);
  return results;
}

// --- Cross-recipe pairs (for LeftoversPanel) ---------------------------------

// Given a current recipe, find the top-N OTHER recipes that share the most
// ingredients with it. Scored by overlap of (brands + generic ingredients).
// Returns [{ recipe, sharedTags: [{slug, label}] }] sorted desc by overlap.
export function findCrossRecipePairs(currentRecipe, allRecipes, brandIndex, genericIndex, limit = 3) {
  // Collect tags for current recipe
  const currentTags = collectRecipeTags(currentRecipe, brandIndex, genericIndex);
  if (currentTags.length === 0) return [];

  // Score each other recipe by tag overlap
  const scored = [];
  for (const other of allRecipes) {
    if (other.id === currentRecipe.id) continue;
    if (other.status !== "live") continue;
    const otherTags = collectRecipeTags(other, brandIndex, genericIndex);
    const shared = currentTags.filter((t) => otherTags.find((o) => o.slug === t.slug));
    if (shared.length === 0) continue;
    scored.push({ recipe: other, sharedTags: shared, score: shared.length });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function collectRecipeTags(recipe, brandIndex, genericIndex) {
  const tags = [];
  for (const [slug, entry] of Object.entries(brandIndex)) {
    if (entry.recipeIds.includes(recipe.id)) {
      tags.push({ slug, label: entry.sublabel || entry.label, kind: "brand" });
    }
  }
  for (const [slug, entry] of Object.entries(genericIndex)) {
    if (entry.recipeIds.includes(recipe.id)) {
      tags.push({ slug, label: entry.label, kind: "generic" });
    }
  }
  return tags;
}

// --- Categorization helper for the LeftoversPage UI -------------------------

// Groups a unified set of (brand + generic) entries by category, returning:
//   [{ category: "Protein", items: [{slug, label, sublabel?, image?, recipeCount}] }, ...]
// Order is fixed: Protein, Vegetables, Carbs, Dairy, Sauce & Flavor, Pantry
export function groupByCategory(brandIndex, genericIndex) {
  const CATEGORY_ORDER = ["Protein", "Vegetables", "Carbs", "Dairy", "Sauce & Flavor", "Pantry"];
  const groups = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, []]));

  // Generics first (cleaner labels, no brand-specific noise)
  for (const entry of Object.values(genericIndex)) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push({
      slug: entry.slug,
      label: entry.label,
      recipeCount: entry.recipeIds.length,
      kind: "generic",
    });
  }
  // Then brands (with brand images)
  for (const entry of Object.values(brandIndex)) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push({
      slug: entry.slug,
      label: entry.label,
      sublabel: entry.sublabel,
      image: entry.image,
      recipeCount: entry.recipeIds.length,
      kind: "brand",
    });
  }
  // Sort each category by recipeCount desc
  for (const cat of CATEGORY_ORDER) {
    groups[cat].sort((a, b) => b.recipeCount - a.recipeCount);
  }
  return CATEGORY_ORDER.filter((c) => groups[c].length > 0).map((c) => ({
    category: c,
    items: groups[c],
  }));
}
