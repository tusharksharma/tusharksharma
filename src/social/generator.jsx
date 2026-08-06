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
import { resolveGroup } from "./structuredCard";
import { buildHeroLayout, HeroStructuredInner } from "./hero.jsx";
import { buildEndLayout, EndStructuredInner } from "./end.jsx";
import { paginateIngredientCards, paginateMethodCards, paginateServingCards, resolveImage, overflowsFooter } from "./recipeCard";
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

  // Body-budget for pagination is derived from the image layout on the
  // card (band cards have less room because the top 380px is photo). We
  // resolve to the ingredient/method photo layout in this pool.
  const ingredientPhotoLayoutMode = pickLayoutMode(sc.ingredientCardPhotos?.[0]);
  const methodPhotoLayoutMode = pickLayoutMode(sc.methodCardPhotos?.[0]);
  const ingredientCardSectionSets = paginateIngredientCards(ingredientSections, {
    maxCards: MAX_INGREDIENT_CARDS,
    perCard: INGREDIENTS_PER_CARD,
    recipeName: recipe.title,
    mode: ingredientPhotoLayoutMode,
  });
  const methodCardSectionSets = paginateMethodCards(methodSections, {
    maxCards: MAX_METHOD_CARDS,
    perCard: STEPS_PER_METHOD_CARD,
    recipeName: recipe.title,
    mode: methodPhotoLayoutMode,
  });

  // Photo pool: curated arrays win, else fall back to recipe.socialImages.
  // De-dup is by src path only — the same photo used with two different
  // crops would still collide, but that's a curator smell, not a bug.
  const usedKeys = new Set([heroPhoto, servingPhoto].map(imageKey).filter(Boolean));
  const fallbackPool = collectFallbackPhotos(recipe, usedKeys);
  const ingredientPhotos = pickCardPhotos(
    sc.ingredientCardPhotos,
    ingredientCardSectionSets.length,
    usedKeys,
    fallbackPool,
  );
  const methodPhotos = pickCardPhotos(
    sc.methodCardPhotos,
    methodCardSectionSets.length,
    usedKeys,
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
    const servingLayoutMode = pickLayoutMode(servingPhoto);
    const servingCardSets = paginateServingCards(servingBlocks, {
      recipeName: recipe.title,
      mode: servingLayoutMode,
    });
    servingCardSets.forEach((sections, i) => {
      const imageSide = alternate++ % 2 === 0 ? "right" : "left";
      cards.push({
        id: servingCardSets.length === 1 ? "serving" : `serving-${i + 1}`,
        kind: "recipe-serving",
        label: servingCardSets.length === 1
          ? "Card · Serving"
          : `Card · Serving (${i + 1}/${servingCardSets.length})`,
        filename: `${slugForFiles}-serving${servingCardSets.length > 1 ? `-${i + 1}` : ""}`,
        layout: {
          kind: "recipe-serving",
          index: 0, total: 0,
          recipeName: recipe.title || "",
          label: "SERVE",
          image: i === 0 ? servingPhoto : null,
          imageSide,
          sections,
          footer: "thesplitplate.com",
        },
      });
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
  const lastServing = kinds.lastIndexOf("recipe-serving");
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
    out.push({ quantity: parsed.quantity, text: cleanIngredientName(parsed.ingredient) });
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

// Drop editorial asides from an auto-derived ingredient name — parenthetical
// clarifications, em-dash brand explainers, trailing state descriptors — so
// the compact carousel row shows just the ingredient. Full brand + prep
// notes live on the recipe page.
function cleanIngredientName(text) {
  return String(text || "")
    .replace(/\s*\([^)]*\)/g, "")            // (14 oz adult + 7 oz kid)
    .replace(/\s+[—–-]\s+.+$/, "")           // — brand aside
    .replace(/,\s*(as needed|to taste|optional|large pieces|diced|shredded|thinly sliced|halved|split \+ toasted|per plate)\.?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
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
  const items = [];
  let n = 1;
  const push = (raw) => {
    const { heading, body } = splitActionHeading(raw || "");
    items.push({ number: n++, heading, body: cleanMethodBody(body) });
  };

  if (split && (split.sharedSteps?.length || split.adult?.steps?.length)) {
    (split.sharedSteps || []).forEach((s) => push(typeof s === "object" ? s.text : s));
    (split.adult?.steps || []).forEach((s) => push(typeof s === "object" ? s.text : s));
  } else if (Array.isArray(recipe.steps) && recipe.steps.length) {
    recipe.steps.forEach((s) => push(typeof s === "object" ? (s.text || s.instruction) : s));
  } else if (Array.isArray(recipe.method) && recipe.method.length) {
    recipe.method.forEach((s) => push(typeof s === "object" ? (s.text || s.instruction) : s));
  } else if (Array.isArray(recipe.executionRules) && recipe.executionRules.length) {
    // Fallback for recipes whose "how to cook" lives in executionRules.
    recipe.executionRules.forEach((s) => push(String(s)));
  }
  return [{ accent: "amber", heading: "Method", items }];
}

// Drop editorial asides from an auto-derived step body — parentheticals,
// em-dash "context" clauses, non-essential trailing sentences that just
// reinforce the action. The FULL step text stays on the recipe page.
function cleanMethodBody(text) {
  return String(text || "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+—[^.!?]*(?=[.!?])/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Legacy "AIR FRY: All 21 oz..." → { heading: "Air Fry", body: "All 21 oz..." }.
// Recipes without an ALL-CAPS prefix keep the full step as body under a
// generic "Step" heading; author is expected to curate short methodGroups
// for a compact carousel — no truncation happens here.
function splitActionHeading(text) {
  const t = String(text || "").trim();
  const m = t.match(/^([A-Z][A-Z\s]{1,20}):\s*(.*)$/);
  const heading = m ? titleCase(m[1].trim()) : "Step";
  const body = m ? m[2].trim() : t;
  return { heading, body };
}

function titleCase(s) {
  return s.split(/\s+/).map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
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
  const split = recipe.splitCook;
  // Split-plate recipes: pull Adult label + Kid label out of splitCook.
  if (split && (split.adult?.label || split.kid?.label)) {
    const blocks = [];
    if (split.adult?.label) {
      blocks.push({
        accent: "coral",
        heading: "Adult Plate",
        items: [{ text: shortServingLine(split.adult.label) }],
      });
    }
    if (split.kid?.label) {
      blocks.push({
        accent: "green",
        heading: "Smaller Plate",
        items: [{ text: shortServingLine(split.kid.label) }],
      });
    }
    return blocks;
  }
  // Non-split recipes: fall back to mealPrep summary if present.
  const items = [];
  const mp = recipe.mealPrep || {};
  if (mp.storage) items.push({ text: mp.storage });
  if (mp.reheat) items.push({ text: `Reheat: ${mp.reheat}` });
  if (mp.lasts) items.push({ text: `Keeps: ${mp.lasts}` });
  return items.length ? [{ accent: "neutral", heading: "Serving", items }] : null;
}

// Strip the "Adult — " / "Kid — " prefix and any bracketed macro tail
// from a splitCook plate label so the serving card gets a clean, plate-
// facing description.
function shortServingLine(label) {
  return String(label || "")
    .replace(/^(Adult|Kid)\s*[—–-]\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

// ---------- PHOTO SELECTION ----------

function pickLayoutMode(image) {
  return resolveImage(image)?.layout || "side";
}

// Canonicalize image field to its src path — used for de-dup only. The
// full crop object still flows through to the renderer.
function imageKey(image) {
  if (!image) return null;
  return typeof image === "string" ? image : image.src || null;
}

function collectFallbackPhotos(recipe, alreadyUsedKeys) {
  const raw = Array.isArray(recipe.socialImages) ? recipe.socialImages : [];
  const seen = new Set(alreadyUsedKeys);
  const out = [];
  for (const src of raw) {
    const key = imageKey(src);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(src);
  }
  return out;
}

function pickCardPhotos(curated, count, usedKeys, fallbackPool) {
  const out = [];
  const isValid = (image) => {
    const key = imageKey(image);
    return !!key && !usedKeys.has(key);
  };

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
      usedKeys.add(imageKey(pick));
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
  if (
    card.kind === "recipe-ingredients" ||
    card.kind === "recipe-method" ||
    card.kind === "recipe-serving"
  ) {
    return <RecipeCardInner layout={card.layout} />;
  }
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

  // Every recipe-body card must fit above the footer safety pad.
  // Curators using explicit `card:` splits can silently overflow past
  // pagination; this check catches it before export ships bad PNGs.
  for (const card of cards) {
    const body = card.kind === "recipe-ingredients"
      || card.kind === "recipe-method"
      || card.kind === "recipe-serving";
    if (!body || !card.layout) continue;
    if (overflowsFooter(card.layout)) {
      errors.push(`${card.id} content enters the footer safety zone — split more cards, trim copy, or use band layout.`);
    }
  }

  if (errors.length) {
    console.warn(`[social-carousel] validation issues for "${recipe.title}":\n- ${errors.join("\n- ")}`);
  }
  return errors;
}
