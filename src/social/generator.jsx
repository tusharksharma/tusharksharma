// New structured-carousel generator.
//
// Contract: buildStructuredCards(recipe, opts) returns an array of card objects
// compatible with SocialPage.jsx's existing cards[] pipeline. Each card is:
//   {
//     id: string,                    // stable identity for React keys + reordering
//     kind: "hero" | "ingredients" | "method" | "serving" | "component" | "process" | "end",
//     label: string,                 // shown above the export button ("Card · Ingredients (Shared Base)")
//     filename: string,              // download filename (`${slug}-3-ingredients-shared`)
//     layout?: object,               // structured layouts consume this via drawStructuredCard / drawStructuredHero / etc.
//     render: React.ReactNode,       // DOM preview at 540×540
//     // legacy fields (recipe / item / src / caption) preserved when needed
//   }
//
// Card budget rules (locked from the design brief):
//   - Maximum 10 cards total.
//   - Maximum 2 ingredient cards.
//   - Maximum 3 method cards.
//   - Maximum 1 component (critical linked-recipe) card.
//   - Maximum 1 purely-decorative process card.
//   - Never trim ingredient or method content to satisfy the 10-cap;
//     drop optional serving / component / process cards first.
//   - No standalone macros card by default (macros live on the hero).

import React from "react";
import {
  ACCENTS,
  buildIngredientsLayout,
  buildMethodLayout,
  buildServingLayout,
  resolveGroup,
} from "./structuredCard";
import StructuredCardInner from "./StructuredCardInner";
import { buildHeroLayout, HeroStructuredInner } from "./hero.jsx";
import { buildEndLayout, EndStructuredInner } from "./end.jsx";

// Soft cap for ITEMS on a single ingredient card. Groups stay whole when
// they fit; if a single group exceeds this, its items are split into
// two blocks with "(1/2)" / "(2/2)" suffixes.
const INGREDIENT_ITEMS_PER_CARD = 9;
// Method steps per card — brief says max 3.
const METHOD_STEPS_PER_CARD = 3;

export function buildStructuredCards(recipe, opts) {
  const {
    slugForFiles,      // used in filenames + end-card URL
    slug,              // dinner slug, for /recipes/{slug} URL
    isCookbook,
    isSnackBox,
    isPowerup,
    photoMap,          // { hero, ingredients, method, serving } — optional overrides from curated data
    components = [],   // linked cookbook components (dinner recipes only)
    processImages = [],// polished process images from recipe.socialImages
  } = opts;

  const sc = recipe.socialCarousel || {};

  // Photo assignments — curated field overrides, else best-guess from images.
  const heroPhoto = sc.heroPhoto || recipe.image || recipe.heroImage || null;
  const ingredientsPhoto =
    (photoMap && photoMap.ingredients) ||
    sc.ingredientsPhoto ||
    firstProcessImage(recipe) ||
    heroPhoto;
  const methodPhoto =
    (photoMap && photoMap.method) ||
    sc.methodPhoto ||
    firstProcessImage(recipe) ||
    heroPhoto;
  const servingPhoto =
    (photoMap && photoMap.serving) ||
    sc.servingPhoto ||
    heroPhoto;

  // Build blocks first (before knowing card count) so we can decide splits.
  const ingredientBlocks = resolveGroup(sc.ingredientGroups, () => deriveIngredientBlocks(recipe), { required: true });
  const methodBlocks = resolveGroup(sc.methodGroups, () => deriveMethodBlocks(recipe), { required: true });
  const servingBlocks = resolveGroup(sc.servingGroups, () => deriveServingBlocks(recipe), { required: false });

  // Split ingredients / methods into card-sized chunks.
  const ingredientCards = splitBlocksIntoIngredientCards(ingredientBlocks, {
    slugForFiles, photoSrc: ingredientsPhoto, recipe,
  });
  const methodCards = splitBlocksIntoMethodCards(methodBlocks, {
    slugForFiles, photoSrc: methodPhoto, recipe,
  });

  // Card assembly (placeholder index/total; two-pass fills after).
  const cards = [];

  // 1. Hero
  cards.push({
    id: "hero",
    kind: "hero",
    label: "Card · Hero",
    filename: `${slugForFiles}-1-hero`,
    layout: buildHeroLayout(recipe, sc, { index: 0, total: 0, isCookbook, isSnackBox, isPowerup }),
    _photoSrc: heroPhoto,
  });

  // 2. Ingredient card(s) — always at least 1 (validation guarantees).
  ingredientCards.forEach((c) => cards.push(c));

  // 3. Method card(s) — always at least 1.
  methodCards.forEach((c) => cards.push(c));

  // 4. Serving card — only when there's real content (auto-derive returns null if not).
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

  // 5. Component card — up to 1. Priority: curated criticalComponent by slug,
  //    else the first extracted component. Skipped when SocialPage passes an
  //    empty components list (cookbook items don't cross-link).
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

  // 6. Process card — up to 1. Uses first polished image not already assigned
  //    to hero / ingredients / method / serving.
  const usedPhotos = new Set([heroPhoto, ingredientsPhoto, methodPhoto, servingPhoto].filter(Boolean));
  const processCandidate = (processImages || []).find((p) => p && p.src && !usedPhotos.has(p.src));
  if (processCandidate) {
    cards.push({
      id: "process",
      kind: "process",
      label: "Card · Process",
      filename: `${slugForFiles}-process`,
      src: processCandidate.src,
      caption: processCandidate.caption,
    });
  }

  // 7. End — always last.
  cards.push({
    id: "end",
    kind: "end",
    label: "Card · Save & Visit",
    filename: `${slugForFiles}-end`,
    layout: buildEndLayout(recipe, sc, { index: 0, total: 0, isCookbook, slug: slug || recipe.id }),
  });

  // Enforce 10-cap by dropping optional cards from lowest-priority end first.
  // Priority (lowest → highest to drop): process → component → serving → 2nd ingredient / 3rd method → NEVER hero / 1st ingredient / 1st method / end.
  while (cards.length > 10) {
    const dropIdx = pickDroppableIndex(cards);
    if (dropIdx === -1) {
      // Shouldn't happen given upstream constraints, but bail out safely.
      break;
    }
    cards.splice(dropIdx, 1);
  }

  // Two-pass: fill index/total, then attach React renderers.
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
  // Never drop hero (0) or end (last) or the FIRST ingredient/method card.
  // Priority: process → component → serving → 2nd ingredient → last method.
  const kinds = cards.map((c) => c.kind);
  const process = kinds.indexOf("process");
  if (process !== -1) return process;
  const component = kinds.indexOf("component");
  if (component !== -1) return component;
  const lastServing = kinds.lastIndexOf("serving");
  if (lastServing !== -1) return lastServing;
  const firstIng = kinds.indexOf("ingredients");
  const lastIng = kinds.lastIndexOf("ingredients");
  if (lastIng !== firstIng) return lastIng;
  const firstMethod = kinds.indexOf("method");
  const lastMethod = kinds.lastIndexOf("method");
  if (lastMethod !== firstMethod) return lastMethod;
  return -1;
}

// ---------- BLOCK BUILDERS ----------

function firstProcessImage(recipe) {
  if (Array.isArray(recipe.socialImages) && recipe.socialImages.length) return recipe.socialImages[0];
  const steps = recipe.steps || recipe.method || [];
  for (const s of steps) {
    if (s && Array.isArray(s.images) && s.images[0]) return s.images[0];
  }
  return null;
}

// Auto-derive ingredient blocks with SHARED/ADULT/SMALLER-PLATE grouping.
function deriveIngredientBlocks(recipe) {
  const blocks = [];
  const split = recipe.splitCook;

  if (split && (split.sharedIngredients || split.adult?.extraIngredients || split.kid?.extraIngredients)) {
    if (split.sharedIngredients?.length) {
      blocks.push({ accent: "amber", heading: "Shared Base", items: parseIngredientLines(split.sharedIngredients) });
    }
    if (split.adult?.extraIngredients?.length) {
      blocks.push({ accent: "coral", heading: "Adult Finish", items: parseIngredientLines(split.adult.extraIngredients) });
    }
    if (split.kid?.extraIngredients?.length) {
      blocks.push({
        accent: "green",
        heading: "Smaller Plate",
        subhead: "What I served my girls. Adjust for age and appetite.",
        items: parseIngredientLines(split.kid.extraIngredients),
      });
    }
    if (blocks.length) return blocks;
  }

  const items = parseIngredientLines(recipe.ingredients || []);
  return [{ accent: "amber", heading: "Ingredients", items }];
}

// Parse recipe.ingredients-style strings into {quantity, ingredient, note} items.
// Strings starting with "---" are treated as within-block section separators
// (skipped in the flat parse; group-level headings come from the block heading).
// String or {text, link} forms are both handled.
function parseIngredientLines(rawList) {
  const out = [];
  for (const raw of rawList) {
    const text = typeof raw === "object" ? raw.text : raw;
    if (!text || text.startsWith("---")) continue;
    const parsed = splitQuantity(text);
    out.push(parsed);
  }
  return out;
}

function splitQuantity(text) {
  // Match leading amount+unit combos. Examples:
  //   "21 oz Kirkland Lightly Breaded ..."
  //   "1/2 tbsp Kikkoman ..."
  //   "8 oz bell peppers + red onion"
  //   "~300 g cottage cheese"
  //   "As needed avocado-oil spray"
  const m = text.match(/^(~?\d+(?:[./]\d+)?(?:\s*[-–]\s*\d+(?:[./]\d+)?)?\s*(?:oz|lb|lbs|g|kg|ml|cup|cups|tsp|tbsp|dash|pinch|tsps|tbsps|pieces?|piece|slices?|slice|servings?|portion|portions|cans?|jars?|packet|packets|link|links)\.?)\s+(.*)$/i);
  if (m) return { quantity: m[1], ingredient: m[2] };
  // "As needed X"
  const m2 = text.match(/^(As needed|to taste|as required)\s+(.*)$/i);
  if (m2) return { quantity: m2[1], ingredient: m2[2] };
  return { quantity: "", ingredient: text };
}

// Auto-derive method blocks.
// For split-plate recipes, weave a "SPLIT HERE" callout between shared and adult steps.
function deriveMethodBlocks(recipe) {
  const split = recipe.splitCook;

  if (split && (split.sharedSteps?.length || split.adult?.steps?.length)) {
    const items = [];
    let stepN = 1;

    (split.sharedSteps || []).forEach((s) => {
      items.push({ step: stepN++, text: cleanStepText(typeof s === "object" ? s.text : s) });
    });

    // SPLIT HERE marker as a pseudo-step (no number).
    items.push({ step: null, text: "SPLIT HERE — kid portion set aside; everything after this is the adult finish.", accent: "coral" });

    (split.adult?.steps || []).forEach((s) => {
      items.push({ step: stepN++, text: cleanStepText(typeof s === "object" ? s.text : s) });
    });

    return [{ accent: "amber", heading: "Method", items }];
  }

  // No split — flat step list.
  const items = (recipe.steps || recipe.method || []).map((s, i) => ({
    step: i + 1,
    text: cleanStepText(typeof s === "object" ? (s.text || s.instruction) : s) || "",
  }));
  return [{ accent: "amber", heading: "Method", items }];
}

function cleanStepText(text) {
  return String(text || "")
    .replace(/^([A-Z][A-Z\s]+):\s*/, "$1: ") // preserve headers like "AIR FRY: "
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

// ---------- CARD SPLITTERS ----------

// Distribute ingredient blocks across ≤2 cards, respecting the 9-item cap.
// Rules:
//   1. Count only items (headings render smaller than an item line).
//   2. Preserve block boundaries when the block fits.
//   3. If a single block exceeds the cap, split its items in two blocks with
//      "(1/2)" / "(2/2)" heading suffixes.
//   4. Fill card 1 greedily up to the cap; overflow → card 2.
//   5. If card 2 also overflows, rebalance: aim for total/2 items per card.
function splitBlocksIntoIngredientCards(blocks, { slugForFiles, photoSrc, recipe }) {
  // Step 1: split any oversized block into two.
  const normalized = [];
  for (const b of blocks) {
    const items = b.items || [];
    if (items.length <= INGREDIENT_ITEMS_PER_CARD) {
      normalized.push(b);
    } else {
      const mid = Math.ceil(items.length / 2);
      normalized.push({ ...b, heading: `${b.heading} (1/2)`, items: items.slice(0, mid) });
      normalized.push({ ...b, heading: `${b.heading} (2/2)`, items: items.slice(mid), subhead: undefined });
    }
  }

  const totalItems = normalized.reduce((sum, b) => sum + (b.items || []).length, 0);

  // Step 2: single card if it all fits.
  if (totalItems <= INGREDIENT_ITEMS_PER_CARD) {
    return [makeIngredientCard(normalized, 0, 1, { slugForFiles, photoSrc, recipe })];
  }

  // Step 3: two-card split. Target ~half items per card; keep whole blocks
  // when possible; if a block bridges the boundary, split it there.
  const target = Math.ceil(totalItems / 2);
  const groupsCard1 = [];
  const groupsCard2 = [];
  let card1Items = 0;
  let boundaryCrossed = false;

  for (const block of normalized) {
    if (boundaryCrossed) {
      groupsCard2.push(block);
      continue;
    }
    const items = block.items || [];
    if (card1Items + items.length <= target) {
      groupsCard1.push(block);
      card1Items += items.length;
    } else {
      const room = target - card1Items;
      if (room >= 2 && items.length - room >= 2) {
        // Split the block: put `room` items on card 1, rest on card 2.
        groupsCard1.push({ ...block, heading: `${block.heading} (1/2)`, items: items.slice(0, room) });
        groupsCard2.push({ ...block, heading: `${block.heading} (2/2)`, items: items.slice(room), subhead: undefined });
      } else {
        // Not worth splitting; push whole block to card 2.
        groupsCard2.push(block);
      }
      boundaryCrossed = true;
    }
  }

  return [
    makeIngredientCard(groupsCard1, 0, 2, { slugForFiles, photoSrc, recipe }),
    makeIngredientCard(groupsCard2, 1, 2, { slugForFiles, photoSrc, recipe }),
  ];
}

function makeIngredientCard(groups, i, totalCards, { slugForFiles, photoSrc, recipe }) {
  const label = totalCards === 1
    ? "Card · Ingredients"
    : `Card · Ingredients (${i + 1}/${totalCards})`;
  return {
    id: `ingredients-${i + 1}`,
    kind: "ingredients",
    label,
    filename: `${slugForFiles}-ingredients-${i + 1}`,
    layout: buildIngredientsLayout(recipe, { ingredientGroups: groups }, { index: 0, total: 0, photoSrc }),
  };
}

// Distribute method into ≤3 cards. Each card holds up to METHOD_STEPS_PER_CARD steps.
function splitBlocksIntoMethodCards(blocks, { slugForFiles, photoSrc, recipe }) {
  // We treat the derivation as one canonical flat block; ignore multi-block
  // curated for now (Phase 2 test recipes are single-block methods).
  const allItems = blocks.flatMap((b) => b.items || []);
  const chunks = [];
  for (let i = 0; i < allItems.length; i += METHOD_STEPS_PER_CARD) {
    chunks.push(allItems.slice(i, i + METHOD_STEPS_PER_CARD));
  }
  if (chunks.length > 3) {
    // Overflow: merge tail into card 3, trimming any excess by tightening
    // the split into 3 near-even chunks instead of chopping.
    const perCard = Math.ceil(allItems.length / 3);
    chunks.length = 0;
    for (let i = 0; i < allItems.length; i += perCard) chunks.push(allItems.slice(i, i + perCard));
  }

  return chunks.map((items, i) => ({
    id: `method-${i + 1}`,
    kind: "method",
    label: chunks.length === 1 ? "Card · Method" : `Card · Method (${i + 1}/${chunks.length})`,
    filename: `${slugForFiles}-method-${i + 1}`,
    layout: buildMethodLayout(recipe, { methodGroups: [{ accent: "amber", heading: chunks.length === 1 ? "Method" : `Method (Part ${i + 1})`, items }] }, {
      index: 0, total: 0, photoSrc,
    }),
  }));
}

// ---------- REACT RENDERERS ----------

function renderFor(card) {
  if (card.kind === "hero") return <HeroStructuredInner layout={card.layout} />;
  if (card.kind === "end") return <EndStructuredInner layout={card.layout} />;
  if (card.kind === "ingredients" || card.kind === "method" || card.kind === "serving") {
    return <StructuredCardInner layout={card.layout} />;
  }
  return null;
}

// ---------- VALIDATION ----------

export function validateCards(cards, recipe) {
  const errors = [];

  if (cards.length > 10) errors.push(`Card count ${cards.length} exceeds 10.`);
  if (!cards.some((c) => c.kind === "ingredients")) errors.push(`No ingredient card produced for ${recipe.title || recipe.slug}.`);
  if (!cards.some((c) => c.kind === "method")) errors.push(`No method card produced for ${recipe.title || recipe.slug}.`);
  if (cards.filter((c) => c.kind === "ingredients").length > 2) errors.push(`More than 2 ingredient cards.`);
  if (cards.filter((c) => c.kind === "method").length > 3) errors.push(`More than 3 method cards.`);
  if (cards.filter((c) => c.kind === "component").length > 1) errors.push(`More than 1 component card.`);
  if (cards.filter((c) => c.kind === "process").length > 1) errors.push(`More than 1 process card.`);
  if (cards[0]?.kind !== "hero") errors.push(`First card must be hero (got ${cards[0]?.kind}).`);
  if (cards[cards.length - 1]?.kind !== "end") errors.push(`Last card must be end (got ${cards[cards.length - 1]?.kind}).`);

  // Recipe title must appear on every card (hero via title, others via recipeName).
  cards.forEach((c, i) => {
    if (c.kind === "hero") {
      if (!c.layout?.title) errors.push(`Card ${i + 1}: hero missing title.`);
    } else if (!c.layout?.recipeName) {
      errors.push(`Card ${i + 1} (${c.kind}): missing recipeName header.`);
    }
  });

  // Ingredient item limits.
  cards.filter((c) => c.kind === "ingredients").forEach((c, i) => {
    const totalItems = (c.layout.blocks || []).reduce((s, b) => s + (b.items?.length || 0), 0);
    if (totalItems > INGREDIENT_ITEMS_PER_CARD) {
      errors.push(`Ingredient card ${i + 1} has ${totalItems} items (soft cap ${INGREDIENT_ITEMS_PER_CARD}).`);
    }
  });

  // Method step count per card.
  cards.filter((c) => c.kind === "method").forEach((c, i) => {
    const stepCount = (c.layout.blocks || []).reduce((s, b) => s + (b.items?.length || 0), 0);
    if (stepCount > METHOD_STEPS_PER_CARD) {
      errors.push(`Method card ${i + 1} has ${stepCount} steps (max ${METHOD_STEPS_PER_CARD}).`);
    }
  });

  if (errors.length) {
    // Surface in the console; log entries render as a red banner in the
    // preview (SocialPage wires this). Never throw hard in production —
    // legacy recipes need to keep working during phased rollout.
    console.warn(`[social-carousel] validation issues for "${recipe.title}":\n- ${errors.join("\n- ")}`);
  }

  return errors;
}
