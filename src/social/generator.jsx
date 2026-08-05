// Structured-carousel generator.
//
// Contract: buildStructuredCards(recipe, opts) returns an array of card objects
// compatible with SocialPage.jsx's cards[] pipeline. Each card is:
//   {
//     id: string,
//     kind: "hero" | "recipe-ingredients" | "recipe-method" | "process"
//         | "serving" | "component" | "end",
//     label: string,
//     filename: string,
//     layout?: object,               // consumed by drawRecipeCard / drawStructuredCard / drawStructuredHero / drawStructuredEnd / drawProcessCard
//     render: React.ReactNode,       // DOM preview at 540×540
//   }
//
// Card sequence for a split-plate dinner (target 8):
//   1. Hero (photo + title + macros)
//   2. Recipe-ingredients card (paper background, two columns)  [1-2 cards]
//   3. Recipe-method card (paper background, numbered)          [1-2 cards]
//   4-6. Process cards (full-bleed action photos + short label) [2-3 cards]
//   7. Serving (adult + smaller-plate labels)
//   8. End
//
// Rules:
//   - Never exceed 10 cards total.
//   - Never fragment ingredients past 2 cards; if content doesn't fit, curator
//     must trim.
//   - Never fragment methods past 2 cards; same rule.
//   - Ingredients + method paginate by MEASURED height (recipeCard.js's
//     paginateIntoRecipeCards). Fixed item caps are gone.
//   - Process cards come from curated.processCards; auto-derive falls back to
//     recipe.socialImages (skipping any that match hero, ingredients, method,
//     or serving photos).

import React from "react";
import { buildServingLayout, resolveGroup } from "./structuredCard";
import StructuredCardInner from "./StructuredCardInner";
import { buildHeroLayout, HeroStructuredInner } from "./hero.jsx";
import { buildEndLayout, EndStructuredInner } from "./end.jsx";
import { paginateIntoRecipeCards } from "./recipeCard";
import RecipeCardInner from "./RecipeCardInner.jsx";

const MAX_INGREDIENT_CARDS = 2;
const MAX_METHOD_CARDS = 2;
const MAX_PROCESS_CARDS = 3;

export function buildStructuredCards(recipe, opts) {
  const {
    slugForFiles,
    slug,
    isCookbook,
    isSnackBox,
    isPowerup,
    components = [],
  } = opts;

  const sc = recipe.socialCarousel || {};

  const heroPhoto = sc.heroPhoto || recipe.image || recipe.heroImage || null;
  const servingPhoto = sc.servingPhoto || heroPhoto;

  // ---------- Build sections ----------

  const ingredientSections = normalizeIngredientSections(resolveGroup(
    sc.ingredientGroups,
    () => deriveIngredientSections(recipe),
    { required: true },
  ));
  const methodSections = normalizeMethodSections(resolveGroup(
    sc.methodGroups,
    () => deriveMethodSections(recipe),
    { required: true },
  ));
  const servingBlocks = resolveGroup(
    sc.servingGroups,
    () => deriveServingBlocks(recipe),
    { required: false },
  );

  // Recipe-card meta pulled once, embedded on every paginated card.
  const meta = buildRecipeMeta(recipe);

  // ---------- Paginate into recipe cards ----------

  const ingredientRecipeCards = paginateIntoRecipeCards(ingredientSections, "recipe-ingredients", { maxCards: MAX_INGREDIENT_CARDS });
  const methodRecipeCards = paginateIntoRecipeCards(methodSections, "recipe-method", { maxCards: MAX_METHOD_CARDS });

  // ---------- Assembly ----------
  const cards = [];

  cards.push({
    id: "hero",
    kind: "hero",
    label: "Card · Hero",
    filename: `${slugForFiles}-1-hero`,
    layout: buildHeroLayout(recipe, sc, { index: 0, total: 0, isCookbook, isSnackBox, isPowerup }),
  });

  ingredientRecipeCards.forEach((rc, i) => {
    cards.push({
      id: `ingredients-${i + 1}`,
      kind: "recipe-ingredients",
      label: ingredientRecipeCards.length === 1
        ? "Card · Ingredients"
        : `Card · Ingredients (${i + 1}/${ingredientRecipeCards.length})`,
      filename: `${slugForFiles}-ingredients-${i + 1}`,
      layout: {
        kind: "recipe-ingredients",
        index: 0, total: 0,
        recipeName: recipe.title || "",
        eyebrow: ingredientRecipeCards.length === 1 ? "INGREDIENTS" : `INGREDIENTS (${i + 1}/${ingredientRecipeCards.length})`,
        meta,
        columns: rc.columns,
        footer: "thesplitplate.com",
      },
    });
  });

  methodRecipeCards.forEach((rc, i) => {
    cards.push({
      id: `method-${i + 1}`,
      kind: "recipe-method",
      label: methodRecipeCards.length === 1
        ? "Card · Method"
        : `Card · Method (${i + 1}/${methodRecipeCards.length})`,
      filename: `${slugForFiles}-method-${i + 1}`,
      layout: {
        kind: "recipe-method",
        index: 0, total: 0,
        recipeName: recipe.title || "",
        eyebrow: methodRecipeCards.length === 1 ? "METHOD" : `METHOD (${i + 1}/${methodRecipeCards.length})`,
        meta,
        columns: rc.columns,
        footer: "thesplitplate.com",
      },
    });
  });

  // Process cards — curated preferred, else auto-derived from socialImages.
  const processImages = collectProcessImages(recipe, sc, { heroPhoto, servingPhoto });
  processImages.slice(0, MAX_PROCESS_CARDS).forEach((p, i) => {
    cards.push({
      id: `process-${i + 1}`,
      kind: "process",
      label: `Card · Process ${i + 1}`,
      filename: `${slugForFiles}-process-${i + 1}`,
      src: p.src,
      caption: p.caption,
    });
  });

  if (servingBlocks && servingBlocks.length > 0) {
    cards.push({
      id: "serving",
      kind: "serving",
      label: "Card · Serving",
      filename: `${slugForFiles}-serving`,
      layout: buildServingLayout(recipe, { ...sc, servingGroups: servingBlocks, engagementQuestion: sc.engagementQuestion }, {
        index: 0, total: 0, photoSrc: servingPhoto,
      }),
    });
  }

  const criticalSlug = sc.criticalComponent;
  const criticalComponent = criticalSlug
    ? components.find((c) => c.id === criticalSlug) || components[0]
    : components[0];
  if (criticalComponent) {
    cards.push({
      id: `component-${criticalComponent.id}`,
      kind: "component",
      label: `Card · Component → ${criticalComponent.title}`,
      filename: `${slugForFiles}-component-${criticalComponent.id}`,
      item: criticalComponent,
      componentKind: sc.criticalComponentKind || "Component",
    });
  }

  cards.push({
    id: "end",
    kind: "end",
    label: "Card · Save & Visit",
    filename: `${slugForFiles}-end`,
    layout: buildEndLayout(recipe, sc, { index: 0, total: 0, isCookbook, slug: slug || recipe.id }),
  });

  // ---------- 10-cap enforcement ----------
  while (cards.length > 10) {
    const dropIdx = pickDroppableIndex(cards);
    if (dropIdx === -1) break;
    cards.splice(dropIdx, 1);
  }

  // ---------- Two-pass: fill index/total and attach React renderers ----------
  const total = cards.length;
  cards.forEach((c, i) => {
    if (c.layout) c.layout = { ...c.layout, index: i + 1, total };
    c.index = i + 1;
    c.total = total;
    c.render = renderFor(c);
  });

  validateCards(cards, recipe);
  return cards;
}

function pickDroppableIndex(cards) {
  const kinds = cards.map((c) => c.kind);
  // Never drop hero (0) or end (last) or the first ingredients / first method.
  // Priority: component → serving → last process → last method → last ingredients.
  const component = kinds.indexOf("component");
  if (component !== -1) return component;
  const lastServing = kinds.lastIndexOf("serving");
  if (lastServing !== -1) return lastServing;
  const lastProcess = kinds.lastIndexOf("process");
  if (lastProcess !== -1) return lastProcess;
  const firstMethod = kinds.indexOf("recipe-method");
  const lastMethod = kinds.lastIndexOf("recipe-method");
  if (lastMethod !== firstMethod) return lastMethod;
  const firstIng = kinds.indexOf("recipe-ingredients");
  const lastIng = kinds.lastIndexOf("recipe-ingredients");
  if (lastIng !== firstIng) return lastIng;
  return -1;
}

// ---------- INGREDIENT + METHOD SECTION BUILDERS ----------

function deriveIngredientSections(recipe) {
  const split = recipe.splitCook;
  const sections = [];

  if (split && (split.sharedIngredients || split.adult?.extraIngredients || split.kid?.extraIngredients)) {
    if (split.sharedIngredients?.length) {
      sections.push({ accent: "amber", heading: "Shared Base", items: parseIngredientLines(split.sharedIngredients) });
    }
    if (split.adult?.extraIngredients?.length) {
      sections.push({ accent: "coral", heading: "Adult Finish", items: parseIngredientLines(split.adult.extraIngredients) });
    }
    if (split.kid?.extraIngredients?.length) {
      sections.push({ accent: "green", heading: "Smaller Plate", items: parseIngredientLines(split.kid.extraIngredients) });
    }
    if (sections.length) return sections;
  }

  return [{ accent: "amber", heading: "Ingredients", items: parseIngredientLines(recipe.ingredients || []) }];
}

function parseIngredientLines(rawList) {
  const out = [];
  for (const raw of rawList) {
    const text = typeof raw === "object" ? raw.text : raw;
    if (!text || text.startsWith("---")) continue;
    const parsed = splitQuantity(text);
    // Recipe-card model uses {quantity, text, note?}; keep parity with curated
    // structure by mapping `ingredient` to `text` when auto-deriving.
    out.push({ quantity: parsed.quantity, text: parsed.ingredient });
  }
  return out;
}

function splitQuantity(text) {
  const m = text.match(/^(~?\d+(?:[./]\d+)?(?:\s*[-–]\s*\d+(?:[./]\d+)?)?\s*(?:oz|lb|lbs|g|kg|ml|cup|cups|tsp|tbsp|dash|pinch|tsps|tbsps|pieces?|piece|slices?|slice|servings?|portion|portions|cans?|jars?|packet|packets|link|links)\.?)\s+(.*)$/i);
  if (m) return { quantity: m[1], ingredient: m[2] };
  const m2 = text.match(/^(As needed|to taste|as required)\s+(.*)$/i);
  if (m2) return { quantity: m2[1], ingredient: m2[2] };
  return { quantity: "", ingredient: text };
}

// Normalize curated ingredient items — some legacy carousels used
// `ingredient` for the text field. Recipe-card renderer looks up `text`.
export function normalizeIngredientSections(sections) {
  return sections.map((s) => ({
    ...s,
    items: (s.items || []).map((it) => ({
      quantity: it.quantity || "",
      text: it.text || it.ingredient || "",
      note: it.note,
    })),
  }));
}

function deriveMethodSections(recipe) {
  const split = recipe.splitCook;
  const firstImage = (s) => (s && s.images && s.images[0]) || (s && s.image) || null;

  if (split && (split.sharedSteps?.length || split.adult?.steps?.length)) {
    const items = [];
    let stepN = 1;
    (split.sharedSteps || []).forEach((s, idx) => {
      const isLastShared = idx === (split.sharedSteps.length - 1);
      items.push({
        number: stepN++,
        text: cleanStepText(typeof s === "object" ? s.text : s),
        image: firstImage(s),
        // The last shared step is where the kid portion gets reserved →
        // attach the SPLIT HERE callout.
        callout: isLastShared ? "SPLIT HERE" : undefined,
      });
    });
    (split.adult?.steps || []).forEach((s) => {
      items.push({
        number: stepN++,
        text: cleanStepText(typeof s === "object" ? s.text : s),
        image: firstImage(s),
      });
    });
    return [{ accent: "amber", heading: "Method", items }];
  }

  const items = (recipe.steps || recipe.method || []).map((s, i) => ({
    number: i + 1,
    text: cleanStepText(typeof s === "object" ? (s.text || s.instruction) : s) || "",
    image: firstImage(s),
  }));
  return [{ accent: "amber", heading: "Method", items }];
}

// Curated method items may use `step` (legacy) or `number` (new). Normalize
// to `number` and preserve callout / image fields.
function normalizeMethodSections(sections) {
  return sections.map((s) => ({
    ...s,
    items: (s.items || []).map((it) => ({
      number: it.number ?? it.step ?? null,
      text: it.text || "",
      image: it.image,
      callout: it.callout,
    })),
  }));
}

function cleanStepText(text) {
  return String(text || "")
    .replace(/^([A-Z][A-Z\s]+):\s*/, "$1: ")
    .trim();
}

function deriveServingBlocks(recipe) {
  const items = [];
  const mp = recipe.mealPrep || {};
  if (mp.storage) items.push({ text: mp.storage });
  if (mp.reheat) items.push({ text: `Reheat: ${mp.reheat}` });
  if (mp.lasts) items.push({ text: `Keeps: ${mp.lasts}` });
  return items.length ? [{ accent: "neutral", heading: "Serving & Storage", items }] : null;
}

function buildRecipeMeta(recipe) {
  return {
    servings: recipe.servings || null,
    time: recipe.time || null,
    calories: recipe.meta?.macros?.calories || recipe.calories || recipe.caloriesPerServing || null,
    protein: (recipe.meta?.macros?.protein || recipe.protein || recipe.proteinPerServing)
      ? `${recipe.meta?.macros?.protein || recipe.protein || recipe.proteinPerServing}g`
      : null,
  };
}

// ---------- PROCESS CARDS ----------

function collectProcessImages(recipe, sc, { heroPhoto, servingPhoto }) {
  const used = new Set([heroPhoto, servingPhoto, sc.ingredientsPhoto, sc.methodPhoto].filter(Boolean));

  // Curated wins.
  if (Array.isArray(sc.processCards) && sc.processCards.length) {
    return sc.processCards
      .filter((p) => p && p.src && !used.has(p.src))
      .filter((p, i, arr) => arr.findIndex((q) => q.src === p.src) === i) // dedupe
      .map((p) => ({ src: p.src, caption: p.caption || "" }));
  }

  // Auto-derive: recipe.socialImages, filtered.
  const raw = Array.isArray(recipe.socialImages) ? recipe.socialImages : [];
  const out = [];
  const seen = new Set(used);
  for (const src of raw) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push({ src, caption: "" });
  }
  return out;
}

// ---------- REACT RENDERERS ----------

function renderFor(card) {
  if (card.kind === "hero") return <HeroStructuredInner layout={card.layout} />;
  if (card.kind === "end") return <EndStructuredInner layout={card.layout} />;
  if (card.kind === "recipe-ingredients" || card.kind === "recipe-method") {
    return <RecipeCardInner layout={card.layout} />;
  }
  if (card.kind === "serving") {
    return <StructuredCardInner layout={card.layout} />;
  }
  // process + component get their renderers patched in by SocialPage.jsx.
  return null;
}

// ---------- VALIDATION ----------

export function validateCards(cards, recipe) {
  const errors = [];
  if (cards.length > 10) errors.push(`Card count ${cards.length} exceeds 10.`);
  if (!cards.some((c) => c.kind === "recipe-ingredients")) errors.push(`No ingredients card produced for ${recipe.title || recipe.slug}.`);
  if (!cards.some((c) => c.kind === "recipe-method")) errors.push(`No method card produced for ${recipe.title || recipe.slug}.`);
  if (cards.filter((c) => c.kind === "recipe-ingredients").length > MAX_INGREDIENT_CARDS) {
    errors.push(`More than ${MAX_INGREDIENT_CARDS} ingredient cards — trim curated card copy.`);
  }
  if (cards.filter((c) => c.kind === "recipe-method").length > MAX_METHOD_CARDS) {
    errors.push(`More than ${MAX_METHOD_CARDS} method cards — trim curated card copy.`);
  }
  if (cards[0]?.kind !== "hero") errors.push(`First card must be hero (got ${cards[0]?.kind}).`);
  if (cards[cards.length - 1]?.kind !== "end") errors.push(`Last card must be end (got ${cards[cards.length - 1]?.kind}).`);

  if (errors.length) {
    console.warn(`[social-carousel] validation issues for "${recipe.title}":\n- ${errors.join("\n- ")}`);
  }
  return errors;
}
