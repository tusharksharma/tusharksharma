// Dark visual-first recipe card. Kinds: recipe-ingredients, recipe-method.
//
// A recipe card is a 58% content column + 42% full-bleed photo. Which side
// the photo sits on is controlled by layout.imageSide ("left" | "right"),
// and the generator alternates it across the carousel. A narrow gradient
// bridges the seam so the two halves read as one card, not two panels.
//
// Canvas export (drawRecipeCard) and DOM preview (RecipeCardInner) consume
// the same layout object and share the same theme + metrics so the two
// renderers can't drift.

import { loadImage } from "./structuredCard";

export const RECIPE_CARD_THEME = {
  background: "#11110F",
  surface: "#191917",
  text: "#F7F7F4",
  muted: "#A3A39C",
  amber: "#F5A300",
  coral: "#FF6B6B",
  green: "#4BD080",
};

export const RECIPE_CARD_METRICS = {
  width: 1080,
  height: 1080,
  photoWidth: 454,
  contentWidth: 626,
  contentMargin: 58,
  seamGradientWidth: 110,
  // header
  labelSize: 22,
  labelLetterSpacing: 4,
  labelGap: 18,
  titleSize: 48,
  titleLineHeight: 54,
  titleGap: 26,
  dividerWidth: 72,
  dividerHeight: 3,
  dividerGap: 34,
  // section heading (rendered before each section's items on ingredient
  // and serving cards)
  sectionHeadingSize: 18,
  sectionHeadingLetterSpacing: 3,
  sectionBarWidth: 32,
  sectionBarHeight: 2,
  sectionHeadingGap: 12,
  sectionBottomGap: 22,
  // ingredient rows
  quantityColumnWidth: 148,
  quantityGutter: 18,
  ingredientQuantitySize: 24,
  ingredientTextSize: 24,
  ingredientLineHeight: 32,
  ingredientNoteSize: 19,
  ingredientNoteLineHeight: 26,
  ingredientRowGap: 20,
  // method rows
  stepNumberSize: 68,
  stepHeadingSize: 26,
  stepHeadingLetterSpacing: 3,
  stepBodySize: 24,
  stepBodyLineHeight: 32,
  stepColumnGap: 24,
  stepNumberColumnWidth: 96,
  methodItemGap: 44,
  // serving rows
  servingBodySize: 25,
  servingBodyLineHeight: 34,
  // footer
  footerSize: 18,
  footerBottomInset: 48,
};

const T = RECIPE_CARD_THEME;
const P = RECIPE_CARD_METRICS;

// Concrete canvas font stack — no ui-* keywords, which Safari's canvas
// silently swaps for its default serif.
const FONT_SANS_CANVAS =
  '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export function fontSans(weight, size) {
  return `${weight} ${size}px ${FONT_SANS_CANVAS}`;
}

export function accentColorFor(name) {
  switch (name) {
    case "coral": return T.coral;
    case "green": return T.green;
    case "neutral": return T.muted;
    case "amber":
    default:       return T.amber;
  }
}

// ---------- CANVAS ----------

export async function drawRecipeCard(ctx, layout) {
  ctx.fillStyle = T.background;
  ctx.fillRect(0, 0, P.width, P.height);

  const photoX = layout.imageSide === "left" ? 0 : P.contentWidth;
  const contentX = layout.imageSide === "left" ? P.photoWidth : 0;

  const img = layout.image ? await loadImage(layout.image).catch(() => null) : null;
  if (img) {
    drawImageCover(ctx, img, photoX, 0, P.photoWidth, P.height);
  } else {
    ctx.fillStyle = T.surface;
    ctx.fillRect(photoX, 0, P.photoWidth, P.height);
  }

  drawSeamGradient(ctx, layout.imageSide);
  drawContent(ctx, layout, contentX);
}

function drawSeamGradient(ctx, imageSide) {
  const width = P.seamGradientWidth;
  if (imageSide === "left") {
    const gx = P.photoWidth - width;
    const g = ctx.createLinearGradient(gx, 0, gx + width, 0);
    g.addColorStop(0, "rgba(17, 17, 15, 0)");
    g.addColorStop(1, T.background);
    ctx.fillStyle = g;
    ctx.fillRect(gx, 0, width, P.height);
  } else {
    const gx = P.contentWidth;
    const g = ctx.createLinearGradient(gx, 0, gx + width, 0);
    g.addColorStop(0, T.background);
    g.addColorStop(1, "rgba(17, 17, 15, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(gx, 0, width, P.height);
  }
}

function drawContent(ctx, layout, x) {
  const innerX = x + P.contentMargin;
  const innerW = P.contentWidth - 2 * P.contentMargin;
  let y = P.contentMargin + 22;

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  ctx.fillStyle = T.amber;
  ctx.font = fontSans(800, P.labelSize);
  drawLetterSpaced(ctx, (layout.label || "").toUpperCase(), innerX, y, P.labelLetterSpacing);
  y += P.labelSize + P.labelGap;

  ctx.fillStyle = T.text;
  ctx.font = fontSans(800, P.titleSize);
  y = drawWrapped(ctx, layout.recipeName, innerX, y, innerW, P.titleLineHeight);
  y += P.titleGap;

  ctx.fillStyle = T.amber;
  ctx.fillRect(innerX, y, P.dividerWidth, P.dividerHeight);
  y += P.dividerHeight + P.dividerGap;

  if (layout.kind === "recipe-method") {
    drawMethodBody(ctx, layout, innerX, y, innerW);
  } else if (layout.kind === "recipe-serving") {
    drawServingBody(ctx, layout, innerX, y, innerW);
  } else {
    drawIngredientsBody(ctx, layout, innerX, y, innerW);
  }

  drawFooter(ctx, layout, x);
}

function drawSectionHeading(ctx, section, x, y) {
  const accent = accentColorFor(section.accent);
  ctx.fillStyle = accent;
  ctx.font = fontSans(800, P.sectionHeadingSize);
  drawLetterSpaced(ctx, (section.heading || "").toUpperCase(), x, y, P.sectionHeadingLetterSpacing);
  const barY = y + P.sectionHeadingSize + 8;
  ctx.fillRect(x, barY, P.sectionBarWidth, P.sectionBarHeight);
  return barY + P.sectionBarHeight + P.sectionHeadingGap;
}

function drawIngredientsBody(ctx, layout, x, startY, w) {
  let y = startY;
  const sections = layout.sections || [];
  sections.forEach((section, si) => {
    if (section.heading) y = drawSectionHeading(ctx, section, x, y);
    const items = section.items || [];
    items.forEach((item) => {
      const accent = accentColorFor(item.accent || section.accent);
      ctx.fillStyle = accent;
      ctx.font = fontSans(800, P.ingredientQuantitySize);
      ctx.fillText(item.quantity || "", x, y);

      ctx.fillStyle = T.text;
      ctx.font = fontSans(500, P.ingredientTextSize);
      const textX = x + P.quantityColumnWidth + P.quantityGutter;
      const textW = w - P.quantityColumnWidth - P.quantityGutter;
      const textEnd = drawWrapped(ctx, item.text || "", textX, y, textW, P.ingredientLineHeight);
      let rowBottom = Math.max(y + P.ingredientLineHeight, textEnd);

      if (item.note) {
        ctx.fillStyle = T.muted;
        ctx.font = fontSans(500, P.ingredientNoteSize);
        const noteEnd = drawWrapped(ctx, item.note, textX, rowBottom + 2, textW, P.ingredientNoteLineHeight);
        rowBottom = noteEnd;
      }
      y = rowBottom + P.ingredientRowGap;
    });
    if (si < sections.length - 1) y += P.sectionBottomGap - P.ingredientRowGap;
  });
}

function drawMethodBody(ctx, layout, x, startY, w) {
  let y = startY;
  const items = flattenMethodItems(layout);
  for (const item of items) {
    const stepAccent = item.accent || "amber";

    ctx.fillStyle = accentColorFor(stepAccent);
    ctx.font = fontSans(900, P.stepNumberSize);
    const nn = String(item.number ?? item.step ?? "").padStart(2, "0");
    ctx.fillText(nn, x, y);

    const headingX = x + P.stepNumberColumnWidth + P.stepColumnGap;
    ctx.fillStyle = T.text;
    ctx.font = fontSans(800, P.stepHeadingSize);
    drawLetterSpaced(ctx, (item.heading || "").toUpperCase(), headingX, y + 8, P.stepHeadingLetterSpacing);

    const bodyY = y + P.stepHeadingSize + 24;
    const bodyW = w - P.stepNumberColumnWidth - P.stepColumnGap;
    ctx.fillStyle = T.muted;
    ctx.font = fontSans(500, P.stepBodySize);
    const bodyEnd = drawWrapped(ctx, item.body || item.text || "", headingX, bodyY, bodyW, P.stepBodyLineHeight);

    const numberBottom = y + P.stepNumberSize;
    y = Math.max(bodyEnd, numberBottom) + P.methodItemGap;
  }
}

function drawServingBody(ctx, layout, x, startY, w) {
  let y = startY;
  const sections = layout.sections || [];
  sections.forEach((section, si) => {
    if (section.heading) y = drawSectionHeading(ctx, section, x, y);
    ctx.fillStyle = T.text;
    ctx.font = fontSans(500, P.servingBodySize);
    (section.items || []).forEach((item) => {
      y = drawWrapped(ctx, item.text || "", x, y, w, P.servingBodyLineHeight);
      y += 10;
    });
    if (si < sections.length - 1) y += P.sectionBottomGap;
  });
}

function drawFooter(ctx, layout, x) {
  const innerX = x + P.contentMargin;
  const innerW = P.contentWidth - 2 * P.contentMargin;
  const y = P.height - P.footerBottomInset - P.footerSize;
  ctx.textBaseline = "top";
  ctx.fillStyle = T.muted;
  ctx.font = fontSans(500, P.footerSize);

  ctx.textAlign = "left";
  ctx.fillText(layout.footer || "thesplitplate.com", innerX, y);

  ctx.textAlign = "right";
  ctx.fillText(`${layout.index}/${layout.total}`, innerX + innerW, y);

  ctx.textAlign = "left";
}

// ---------- flatten helpers (also used by DOM) ----------

export function flattenIngredientItems(layout) {
  const out = [];
  for (const sec of layout.sections || []) {
    for (const it of sec.items || []) {
      out.push({
        quantity: it.quantity || "",
        text: it.text || it.ingredient || "",
        note: it.note || "",
        accent: it.accent || sec.accent || "amber",
      });
    }
  }
  return out;
}

export function flattenMethodItems(layout) {
  const out = [];
  for (const sec of layout.sections || []) {
    for (const it of sec.items || []) {
      out.push({
        number: it.number ?? it.step,
        heading: it.heading || "",
        body: it.body || it.text || "",
        accent: it.accent || sec.accent || "amber",
      });
    }
  }
  return out;
}

// ---------- pagination ----------

// Ingredient sections → cards. Author can explicitly assign each section
// a `card` index; otherwise we greedy-pack up to `perCard` items per card.
// Never silently drops content: if authored content exceeds `maxCards`,
// extra cards are still produced and a warning is logged for the author
// to curate shorter copy.
export function paginateIngredientCards(sections, { maxCards = 2, perCard = 6, recipeName = "" } = {}) {
  const list = sections || [];
  if (!list.length) return [];

  const explicit = list.every((s) => Number.isInteger(s.card));
  let cards;
  if (explicit) {
    const buckets = new Map();
    for (const sec of list) {
      const arr = buckets.get(sec.card) || [];
      arr.push(sec);
      buckets.set(sec.card, arr);
    }
    cards = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, secs]) => secs);
  } else {
    cards = [];
    let current = [];
    let count = 0;
    for (const sec of list) {
      const n = (sec.items || []).length;
      if (count + n > perCard && current.length) {
        cards.push(current);
        current = [];
        count = 0;
      }
      current.push(sec);
      count += n;
    }
    if (current.length) cards.push(current);
  }

  if (cards.length > maxCards) {
    console.warn(`[recipe-card] "${recipeName}" produced ${cards.length} ingredient cards (soft cap ${maxCards}). Curate shorter copy or explicit \`card:\` indices.`);
  }
  return cards;
}

// Method sections → cards of up to `perCard` steps each. Same
// paginate-not-truncate rule as ingredients.
export function paginateMethodCards(sections, { maxCards = 2, perCard = 3, recipeName = "" } = {}) {
  const flat = [];
  for (const sec of sections || []) {
    for (const it of sec.items || []) flat.push({ ...it, accent: it.accent || sec.accent || "amber" });
  }
  const cards = [];
  for (let i = 0; i < flat.length; i += perCard) {
    const slice = flat.slice(i, i + perCard);
    cards.push([{ accent: "amber", heading: "", items: slice }]);
  }
  if (cards.length > maxCards) {
    console.warn(`[recipe-card] "${recipeName}" produced ${cards.length} method cards (soft cap ${maxCards}). Curate shorter copy or fewer steps.`);
  }
  return cards;
}

// ---------- canvas primitives ----------

function drawLetterSpaced(ctx, text, x, y, spacing) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
}

// Word-wrap and draw. Returns the y-cursor AFTER the last drawn line. Never
// ellipsizes: recipes with long ingredient or instruction copy should be
// curated shorter or paginated, not silently clipped.
function drawWrapped(ctx, text, x, y, maxW, lineHeight) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  let cursor = y;
  for (const line of lines) {
    ctx.fillText(line, x, cursor);
    cursor += lineHeight;
  }
  return cursor;
}

function drawImageCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
