// Structured-carousel generator.
//
// Contract: buildStructuredCards(recipe, opts) returns an array of card
// objects compatible with SocialPage.jsx's cards[] pipeline. Each card is:
//   {
//     id: string,
//     kind: "hero" | "recipe-ingredients" | "recipe-method"
//         | "serving" | "component" | "end",
//     label: string,
//     filename: string,
//     layout?: object,   // consumed by drawRecipeCard / drawStructuredCard
//                        //   / drawStructuredHero / drawStructuredEnd
//     render: React.ReactNode,   // DOM preview at 540x540
//   }
//
// Card sequence for a split-plate dinner (target 7):
//   1. Hero (photo + title + macros)
//   2-3. Recipe-ingredients cards (dark, 58/42 with curated action photo)
//   4-5. Recipe-method cards (same shape, alternating imageSide)
//   6. Serving (adult + smaller-plate labels)
//   7. End (save + visit)
//
// Rules:
//   - Never exceed 10 cards total.
//   - Max 2 ingredient cards, max 2 method cards. If content doesn't fit,
//     curator must trim the copy.
//   - Photos alternate right / left / right / left across cards 2-5.
//   - Curated photos win: socialCarousel.ingredientCardPhotos and
//     socialCarousel.methodCardPhotos are indexed arrays, one photo per
//     card. Fallback pulls from recipe.socialImages, skipping the hero,
//     serving, and any photo already used.
//   - There is NO standalone process-card kind. The action photo lives on
//     the method card that describes the action.

import React from "react";
import { buildServingLayout, resolveGroup } from "./structuredCard";
import StructuredCardInner from "./StructuredCardInner";
import { buildHeroLayout, HeroStructuredInner } from "./hero.jsx";
import { buildEndLayout, EndStructuredInner } from "./end.jsx";
import { paginateIngredientCards, paginateMethodCards } from "./recipeCard";
import RecipeCardInner from "./RecipeCardInner.jsx";

const MAX_INGREDIENT_CARDS = 2;
const MAX_METHOD_CARDS = 2;
const INGREDIENTS_PER_CARD = 6;
const STEPS_PER_METHOD_CARD = 3;

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

  const ingredientCardSectionSets = paginateIngredientCards(ingredientSections, {
    maxCards: MAX_INGREDIENT_CARDS,
    perCard: INGREDIENTS_PER_CARD,
  });
  const methodCardSectionSets = paginateMethodCards(methodSections, {
    maxCards: MAX_METHOD_CARDS,
    perCard: STEPS_PER_METHOD_CARD,
  });

  // Photo pool: curated arrays win, else fall back to recipe.socialImages.
  const usedPhotos = new Set([heroPhoto, servingPhoto].filter(Boolean));
  const fallbackPool = collectFallbackPhotos(recipe, usedPhotos);
  const ingredientPhotos = pickCardPhotos(
    sc.ingredientCardPhotos,
    ingredientCardSectionSets.length,
    usedPhotos,
    fallbackPool,
  );
  const methodPhotos = pickCardPhotos(
    sc.methodCardPhotos,
    methodCardSectionSets.length,
    usedPhotos,
    fallbackPool,
  );

  const cards = [];
  let alternate = 0; // 0 = right, 1 = left, alternating across cards 2-5

  cards.push({
    id: "hero",
    kind: "hero",
    label: "Card · Hero",
    filename: `${slugForFiles}-1-hero`,
    layout: buildHeroLayout(recipe, sc, { index: 0, total: 0, isCookbook, isSnackBox, isPowerup }),
  });

  ingredientCardSectionSets.forEach((sections, i) => {
    const imageSide = alternate++ % 2 === 0 ? "right" : "left";
    cards.push({
      id: `ingredients-${i + 1}`,
      kind: "recipe-ingredients",
      label: ingredientCardSectionSets.length === 1
        ? "Card · Ingredients"
        : `Card · Ingredients (${i + 1}/${ingredientCardSectionSets.length})`,
      filename: `${slugForFiles}-ingredients-${i + 1}`,
      layout: {
        kind: "recipe-ingredients",
        index: 0, total: 0,
        recipeName: recipe.title || "",
        label: "WHAT YOU NEED",
        image: ingredientPhotos[i] || null,
        imageSide,
        sections,
        footer: "thesplitplate.com",
      },
    });
  });

  methodCardSectionSets.forEach((sections, i) => {
    const imageSide = alternate++ % 2 === 0 ? "right" : "left";
    cards.push({
      id: `method-${i + 1}`,
      kind: "recipe-method",
      label: methodCardSectionSets.length === 1
        ? "Card · Method"
        : `Card · Method (${i + 1}/${methodCardSectionSets.length})`,
      filename: `${slugForFiles}-method-${i + 1}`,
      layout: {
        kind: "recipe-method",
        index: 0, total: 0,
        recipeName: recipe.title || "",
        label: "HOW TO COOK",
        image: methodPhotos[i] || null,
        imageSide,
        sections,
        footer: "thesplitplate.com",
      },
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

  while (cards.length > 10) {
    const dropIdx = pickDroppableIndex(cards);
    if (dropIdx === -1) break;
    cards.splice(dropIdx, 1);
  }

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
  const component = kinds.indexOf("component");
  if (component !== -1) return component;
  const lastServing = kinds.lastIndexOf("serving");
  if (lastServing !== -1) return lastServing;
  const firstMethod = kinds.indexOf("recipe-method");
  const lastMethod = kinds.lastIndexOf("recipe-method");
  if (lastMethod !== firstMethod) return lastMethod;
  const firstIng = kinds.indexOf("recipe-ingredients");
  const lastIng = kinds.lastIndexOf("recipe-ingredients");
  if (lastIng !== firstIng) return lastIng;
  return -1;
}

// ---------- SECTION BUILDERS ----------

function deriveIngredientSections(recipe) {
  const split = recipe.splitCook;
  const sections = [];
  if (split && (split.sharedIngredients || split.adult?.extraIngredients || split.kid?.extraIngredients)) {
    if (split.sharedIngredients?.length) {
      sections.push({ accent: "amber", heading: "Shared", items: parseIngredientLines(split.sharedIngredients) });
    }
    if (split.adult?.extraIngredients?.length) {
      sections.push({ accent: "coral", heading: "Adult", items: parseIngredientLines(split.adult.extraIngredients) });
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

export function normalizeIngredientSections(sections) {
  return sections.map((s) => ({
    ...s,
    items: (s.items || []).map((it) => ({
      quantity: it.quantity || "",
      text: it.text || it.ingredient || "",
      note: it.note,
      accent: it.accent,
    })),
  }));
}

function deriveMethodSections(recipe) {
  const split = recipe.splitCook;
  if (split && (split.sharedSteps?.length || split.adult?.steps?.length)) {
    const items = [];
    let stepN = 1;
    (split.sharedSteps || []).forEach((s) => {
      const raw = typeof s === "object" ? s.text : s;
      const { heading, body } = splitActionHeading(raw);
      items.push({ number: stepN++, heading, body });
    });
    (split.adult?.steps || []).forEach((s) => {
      const raw = typeof s === "object" ? s.text : s;
      const { heading, body } = splitActionHeading(raw);
      items.push({ number: stepN++, heading, body });
    });
    return [{ accent: "amber", heading: "Method", items }];
  }
  const rawSteps = recipe.steps || recipe.method || [];
  const items = rawSteps.map((s, i) => {
    const raw = typeof s === "object" ? (s.text || s.instruction) : s;
    const { heading, body } = splitActionHeading(raw || "");
    return { number: i + 1, heading, body };
  });
  return [{ accent: "amber", heading: "Method", items }];
}

// Legacy "AIR FRY: All 21 oz..." → { heading: "AIR FRY", body: "All 21 oz..." }.
// Recipes without an ALL-CAPS prefix become one big body with a generic
// heading; author is expected to curate methodGroups directly for the
// carousel-quality version.
function splitActionHeading(text) {
  const t = String(text || "").trim();
  const m = t.match(/^([A-Z][A-Z\s]{1,20}):\s*(.*)$/);
  if (m) return { heading: m[1].trim(), body: m[2].trim() };
  return { heading: "Step", body: t };
}

export function normalizeMethodSections(sections) {
  return sections.map((s) => ({
    ...s,
    items: (s.items || []).map((it) => ({
      number: it.number ?? it.step ?? null,
      heading: it.heading || "",
      body: it.body || it.text || "",
      accent: it.accent,
    })),
  }));
}

function deriveServingBlocks(recipe) {
  const items = [];
  const mp = recipe.mealPrep || {};
  if (mp.storage) items.push({ text: mp.storage });
  if (mp.reheat) items.push({ text: `Reheat: ${mp.reheat}` });
  if (mp.lasts) items.push({ text: `Keeps: ${mp.lasts}` });
  return items.length ? [{ accent: "neutral", heading: "Serving & Storage", items }] : null;
}

// ---------- PHOTO SELECTION ----------

function collectFallbackPhotos(recipe, alreadyUsed) {
  const raw = Array.isArray(recipe.socialImages) ? recipe.socialImages : [];
  const seen = new Set(alreadyUsed);
  const out = [];
  for (const src of raw) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

function pickCardPhotos(curated, count, usedPhotos, fallbackPool) {
  const out = [];
  const isValid = (src) => !!src && !usedPhotos.has(src);

  for (let i = 0; i < count; i++) {
    let pick = null;
    if (Array.isArray(curated) && isValid(curated[i])) {
      pick = curated[i];
    } else {
      while (fallbackPool.length && !pick) {
        const candidate = fallbackPool.shift();
        if (isValid(candidate)) pick = candidate;
      }
    }
    if (pick) {
      usedPhotos.add(pick);
      out.push(pick);
    } else {
      out.push(null);
    }
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
  if (card.kind === "serving") return <StructuredCardInner layout={card.layout} />;
  // component gets its renderer patched in by SocialPage.jsx.
  return null;
}

// ---------- VALIDATION ----------

export function validateCards(cards, recipe) {
  const errors = [];
  if (cards.length > 10) errors.push(`Card count ${cards.length} exceeds 10.`);
  if (!cards.some((c) => c.kind === "recipe-ingredients")) errors.push(`No ingredients card for ${recipe.title || recipe.slug}.`);
  if (!cards.some((c) => c.kind === "recipe-method")) errors.push(`No method card for ${recipe.title || recipe.slug}.`);
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
