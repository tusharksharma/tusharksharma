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
  y = drawWrapped(ctx, layout.recipeName, innerX, y, innerW, P.titleLineHeight, 3);
  y += P.titleGap;

  ctx.fillStyle = T.amber;
  ctx.fillRect(innerX, y, P.dividerWidth, P.dividerHeight);
  y += P.dividerHeight + P.dividerGap;

  if (layout.kind === "recipe-method") {
    drawMethodBody(ctx, layout, innerX, y, innerW);
  } else {
    drawIngredientsBody(ctx, layout, innerX, y, innerW);
  }

  drawFooter(ctx, layout, x);
}

function drawIngredientsBody(ctx, layout, x, startY, w) {
  let y = startY;
  const items = flattenIngredientItems(layout);
  for (const item of items) {
    ctx.fillStyle = accentColorFor(item.accent);
    ctx.font = fontSans(800, P.ingredientQuantitySize);
    ctx.fillText(item.quantity || "", x, y);

    ctx.fillStyle = T.text;
    ctx.font = fontSans(500, P.ingredientTextSize);
    const textX = x + P.quantityColumnWidth + P.quantityGutter;
    const textW = w - P.quantityColumnWidth - P.quantityGutter;
    const textEnd = drawWrapped(ctx, item.text || "", textX, y, textW, P.ingredientLineHeight, 2);
    let rowBottom = Math.max(y + P.ingredientLineHeight, textEnd);

    if (item.note) {
      ctx.fillStyle = T.muted;
      ctx.font = fontSans(500, P.ingredientNoteSize);
      const noteEnd = drawWrapped(ctx, item.note, textX, rowBottom + 2, textW, P.ingredientNoteLineHeight, 2);
      rowBottom = noteEnd;
    }

    y = rowBottom + P.ingredientRowGap;
  }
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
    const bodyEnd = drawWrapped(ctx, item.body || item.text || "", headingX, bodyY, bodyW, P.stepBodyLineHeight, 3);

    const numberBottom = y + P.stepNumberSize;
    y = Math.max(bodyEnd, numberBottom) + P.methodItemGap;
  }
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

// Ingredient sections → up to `maxCards` cards. Author can explicitly
// assign each section a `card` index; otherwise we greedy-pack up to
// `perCard` items per card.
export function paginateIngredientCards(sections, { maxCards = 2, perCard = 6 } = {}) {
  const list = sections || [];
  if (!list.length) return [];

  const explicit = list.every((s) => Number.isInteger(s.card));
  if (explicit) {
    const buckets = new Map();
    for (const sec of list) {
      const arr = buckets.get(sec.card) || [];
      arr.push(sec);
      buckets.set(sec.card, arr);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, maxCards)
      .map(([, secs]) => secs);
  }

  const cards = [];
  let current = [];
  let count = 0;
  for (const sec of list) {
    const n = (sec.items || []).length;
    if (count + n > perCard && current.length && cards.length < maxCards - 1) {
      cards.push(current);
      current = [];
      count = 0;
    }
    current.push(sec);
    count += n;
  }
  if (current.length) cards.push(current);
  return cards.slice(0, maxCards);
}

// Method sections → up to `maxCards` cards of `perCard` steps each. Steps
// are flattened across sections and rebucketed.
export function paginateMethodCards(sections, { maxCards = 2, perCard = 3 } = {}) {
  const flat = [];
  for (const sec of sections || []) {
    for (const it of sec.items || []) flat.push({ ...it, accent: it.accent || sec.accent || "amber" });
  }
  const cards = [];
  for (let i = 0; i < flat.length && cards.length < maxCards; i += perCard) {
    const slice = flat.slice(i, i + perCard);
    cards.push([{ accent: "amber", heading: "", items: slice }]);
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

function drawWrapped(ctx, text, x, y, maxW, lineHeight, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  let consumed = 0;
  for (let i = 0; i < words.length; i++) {
    const test = current ? current + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      if (lines.length === maxLines) break;
      current = words[i];
      consumed = i;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (consumed && lines.length === maxLines && lines.join(" ").split(/\s+/).length < words.length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length > 1) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + "…";
  }
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
