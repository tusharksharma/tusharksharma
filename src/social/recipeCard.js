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
  // Band layout — photo full-width across the top, content below.
  bandHeight: 380,
  bandContentWidth: 1080,   // full width minus contentMargin either side
  bandContentTopPad: 30,    // extra breathing room under the photo band
  bandSeamGradientHeight: 90,
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

// Normalize an image field. Author may pass a plain path string, or a
// crop-controlled object:
//   { src, position: "55% 65%", zoom: 1.15, layout: "band" }
// - position: focal point in the source image (defaults center)
// - zoom: multiplier on the base cover scale (>1 crops tighter)
// - layout: "side" (58/42 column) or "band" (photo across the top,
//   content full-width below) — used for wide/landscape photos where
//   a side crop would erase most of the frame.
export function resolveImage(image) {
  if (!image) return null;
  if (typeof image === "string") {
    return { src: image, position: "50% 50%", zoom: 1, layout: "side" };
  }
  return {
    src: image.src,
    position: image.position || "50% 50%",
    zoom: typeof image.zoom === "number" ? image.zoom : 1,
    layout: image.layout === "band" ? "band" : "side",
  };
}

export function parseFocalPoint(str) {
  const parts = String(str || "50% 50%").split(/\s+/);
  const parse = (v) => {
    const m = /^(-?[\d.]+)%$/.exec(String(v).trim());
    return m ? Math.max(0, Math.min(1, parseFloat(m[1]) / 100)) : 0.5;
  };
  return [parse(parts[0]), parse(parts[1] || parts[0])];
}

// ---------- CANVAS ----------

export async function drawRecipeCard(ctx, layout) {
  ctx.fillStyle = T.background;
  ctx.fillRect(0, 0, P.width, P.height);

  const resolvedImage = resolveImage(layout.image);
  if (resolvedImage?.layout === "band") {
    return drawRecipeCardBand(ctx, layout, resolvedImage);
  }

  const photoX = layout.imageSide === "left" ? 0 : P.contentWidth;
  const contentX = layout.imageSide === "left" ? P.photoWidth : 0;

  const img = resolvedImage?.src ? await loadImage(resolvedImage.src).catch(() => null) : null;
  if (img) {
    drawImageCover(ctx, img, photoX, 0, P.photoWidth, P.height, resolvedImage);
  } else {
    ctx.fillStyle = T.surface;
    ctx.fillRect(photoX, 0, P.photoWidth, P.height);
  }

  drawSeamGradient(ctx, layout.imageSide);
  drawContent(ctx, layout, contentX, "side");
}

async function drawRecipeCardBand(ctx, layout, resolvedImage) {
  const img = resolvedImage?.src ? await loadImage(resolvedImage.src).catch(() => null) : null;
  if (img) {
    drawImageCover(ctx, img, 0, 0, P.width, P.bandHeight, resolvedImage);
  } else {
    ctx.fillStyle = T.surface;
    ctx.fillRect(0, 0, P.width, P.bandHeight);
  }
  // Downward-fading seam under the band so content underneath reads as one card.
  const gy = P.bandHeight - P.bandSeamGradientHeight;
  const g = ctx.createLinearGradient(0, gy, 0, P.bandHeight);
  g.addColorStop(0, "rgba(17, 17, 15, 0)");
  g.addColorStop(1, T.background);
  ctx.fillStyle = g;
  ctx.fillRect(0, gy, P.width, P.bandSeamGradientHeight);

  drawContent(ctx, layout, 0, "band");
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

function drawContent(ctx, layout, x, mode = "side") {
  const isBand = mode === "band";
  const innerX = (isBand ? 0 : x) + P.contentMargin;
  const innerW = (isBand ? P.width : P.contentWidth) - 2 * P.contentMargin;
  let y = isBand
    ? P.bandHeight + P.bandContentTopPad
    : P.contentMargin + 22;

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

  drawFooter(ctx, layout, isBand ? 0 : x, isBand);
}

function drawSectionHeading(ctx, section, x, y) {
  const accent = accentColorFor(section.accent);
  ctx.fillStyle = accent;
  ctx.font = fontSans(800, P.sectionHeadingSize);
  const label = section.continued
    ? `${(section.heading || "").toUpperCase()}  (CONT.)`
    : (section.heading || "").toUpperCase();
  drawLetterSpaced(ctx, label, x, y, P.sectionHeadingLetterSpacing);
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

function drawFooter(ctx, layout, x, isBand = false) {
  const innerX = x + P.contentMargin;
  const innerW = (isBand ? P.width : P.contentWidth) - 2 * P.contentMargin;
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
//
// Card layouts are height-budgeted rather than item-count-capped. Each
// item's rendered height is estimated up-front (SSR-safe — no canvas
// measureText, since prerender runs in Node) and packed greedily into
// cards until the body budget runs out. This is the "paginate" branch
// of the no-truncation rule: content spills into a new card, never gets
// silently clipped.

// Rough per-line character capacities at the recipe-card metrics.
// Sans at 24px averages ~13px per glyph → ~30 chars / line in the ~344px
// ingredient text column, ~40 chars / line in the ~486px method body
// column. Conservative to err on more-cards over overflow.
const CHARS_INGREDIENT_TEXT = 30;
const CHARS_INGREDIENT_NOTE = 36;
const CHARS_METHOD_BODY = 42;
const CHARS_SERVING_BODY = 34;
const CHARS_TITLE = 20;

// Body-region height is derived from the actual title wrap and footer
// position, not a fixed constant — a long two-line title on card 1 has
// a smaller body budget than a one-line title. Keeps pagination honest
// so long titles never squeeze the footer.
const FOOTER_SAFETY_PAD = 24; // clearance between body baseline and footer
const SECTION_HEADING_BLOCK = P.sectionHeadingSize + 8 + P.sectionBarHeight + P.sectionHeadingGap;
const SECTION_BOTTOM_GAP = P.sectionBottomGap;

// y at which the body region STARTS (label + title + divider consumed).
export function bodyStartY(recipeName, mode = "side") {
  const titleLines = measureTitleLines(recipeName || "");
  const preTitleY = mode === "band"
    ? P.bandHeight + P.bandContentTopPad
    : P.contentMargin + 22;
  return preTitleY
    + P.labelSize + P.labelGap
    + titleLines * P.titleLineHeight
    + P.titleGap
    + P.dividerHeight + P.dividerGap;
}

// y at which the footer STARTS (top edge of the footer text row).
export function footerStartY() {
  return P.height - P.footerBottomInset - P.footerSize;
}

// Available body height between title-divider and the footer safety pad.
export function computeBodyBudget(recipeName, mode = "side") {
  return footerStartY() - FOOTER_SAFETY_PAD - bodyStartY(recipeName, mode);
}

function estimateLines(text, charsPerLine) {
  const t = String(text || "").trim();
  if (!t) return 0;
  const words = t.split(/\s+/);
  let lines = 1;
  let curLen = 0;
  for (const word of words) {
    const wLen = word.length;
    if (wLen > charsPerLine) {
      // Long unbroken token — count how many full lines it swallows plus
      // the remainder. Actual wrap will break mid-word.
      if (curLen) { lines++; curLen = 0; }
      lines += Math.floor(wLen / charsPerLine);
      curLen = wLen % charsPerLine;
    } else if (curLen + wLen + (curLen ? 1 : 0) > charsPerLine) {
      lines++;
      curLen = wLen;
    } else {
      curLen += (curLen ? 1 : 0) + wLen;
    }
  }
  return lines;
}

export function measureTitleLines(text) {
  return Math.max(1, estimateLines(text, CHARS_TITLE));
}

function ingredientRowHeight(item) {
  const textLines = Math.max(1, estimateLines(item.text || item.ingredient || "", CHARS_INGREDIENT_TEXT));
  const noteLines = item.note ? estimateLines(item.note, CHARS_INGREDIENT_NOTE) : 0;
  let h = textLines * P.ingredientLineHeight;
  if (noteLines) h += 4 + noteLines * P.ingredientNoteLineHeight;
  return h;
}

function methodRowHeight(item) {
  const bodyLines = Math.max(1, estimateLines(item.body || item.text || "", CHARS_METHOD_BODY));
  const contentColH = P.stepHeadingSize + 24 + bodyLines * P.stepBodyLineHeight;
  return Math.max(P.stepNumberSize, contentColH);
}

function servingRowHeight(item) {
  const lines = Math.max(1, estimateLines(item.text || "", CHARS_SERVING_BODY));
  return lines * P.servingBodyLineHeight;
}

// Ingredient sections → cards, packed by height. Author can explicitly
// assign each section a `card` index; otherwise items are placed onto
// the current card until the dynamic body budget is exhausted, then flow
// onto the next. Sections that span cards get their heading redrawn on
// the continuation, with "(cont.)" appended.
export function paginateIngredientCards(sections, { maxCards = 2, recipeName = "", mode = "side" } = {}) {
  const list = sections || [];
  if (!list.length) return [];

  const budget = computeBodyBudget(recipeName, mode);
  const explicit = list.every((s) => Number.isInteger(s.card));
  let cards;
  if (explicit) {
    cards = bucketByCard(list);
  } else {
    cards = packSectionsByHeight(list, ingredientRowHeight, P.ingredientRowGap, budget);
  }

  if (cards.length > maxCards) {
    console.warn(`[recipe-card] "${recipeName}" paginated to ${cards.length} ingredient cards (soft cap ${maxCards}). Consider curating shorter copy.`);
  }
  return cards;
}

// Method sections → cards, packed by height. Author can force a split
// via `card:` on each section (mirrors ingredients). Otherwise method
// items are flattened across sections and packed against the dynamic
// body budget.
export function paginateMethodCards(sections, { maxCards = 2, recipeName = "", mode = "side" } = {}) {
  const list = sections || [];
  if (!list.length) return [];

  const budget = computeBodyBudget(recipeName, mode);
  const explicit = list.every((s) => Number.isInteger(s.card));
  let cards;
  if (explicit) {
    cards = bucketByCard(list);
  } else {
    const flat = [];
    for (const sec of list) {
      for (const it of sec.items || []) flat.push({ ...it, accent: it.accent || sec.accent || "amber" });
    }
    cards = [];
    let current = [];
    let currentH = 0;
    for (const item of flat) {
      const h = methodRowHeight(item) + P.methodItemGap;
      if (currentH + h > budget && current.length) {
        cards.push([{ accent: "amber", heading: "", items: current }]);
        current = [];
        currentH = 0;
      }
      current.push(item);
      currentH += h;
    }
    if (current.length) cards.push([{ accent: "amber", heading: "", items: current }]);
  }

  if (cards.length > maxCards) {
    console.warn(`[recipe-card] "${recipeName}" paginated to ${cards.length} method cards (soft cap ${maxCards}). Consider fewer steps or shorter bodies.`);
  }
  return cards;
}

// Serving sections → single card. Serving always fits on one card for
// realistic curator input; overflow paginates onto a second card so we
// never clip.
export function paginateServingCards(sections, { recipeName = "", mode = "side" } = {}) {
  const list = sections || [];
  if (!list.length) return [];
  const budget = computeBodyBudget(recipeName, mode);
  const cards = packSectionsByHeight(list, servingRowHeight, 10, budget);
  if (cards.length > 1) {
    console.warn(`[recipe-card] "${recipeName}" serving text exceeded one card — trim to 1-2 lines per section.`);
  }
  return cards;
}

// Given sections carrying an explicit numeric `card`, group them into
// ordered per-card arrays. Sections without heading fall through, sort
// is stable numeric.
function bucketByCard(sections) {
  const buckets = new Map();
  for (const sec of sections) {
    const arr = buckets.get(sec.card) || [];
    arr.push(sec);
    buckets.set(sec.card, arr);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, secs]) => secs);
}

// Estimate the y-cursor the body would reach for a rendered card. Used
// by validateCards to catch layouts where explicit card assignments
// overflow into the footer safety zone.
export function estimateBodyEndY(layout) {
  const y0 = bodyStartY(layout.recipeName || "", resolveImage(layout.image)?.layout || "side");
  const kind = layout.kind;
  const rowHeightFn = kind === "recipe-method"
    ? methodRowHeight
    : kind === "recipe-serving"
      ? servingRowHeight
      : ingredientRowHeight;
  const rowGap = kind === "recipe-method"
    ? P.methodItemGap
    : kind === "recipe-serving"
      ? 10
      : P.ingredientRowGap;

  let y = y0;
  const sections = layout.sections || [];
  sections.forEach((section, si) => {
    if (section.heading && kind !== "recipe-method") y += SECTION_HEADING_BLOCK;
    for (const item of section.items || []) y += rowHeightFn(item) + rowGap;
    if (si < sections.length - 1) y += SECTION_BOTTOM_GAP;
  });
  return y;
}

export function overflowsFooter(layout) {
  return estimateBodyEndY(layout) > footerStartY() - FOOTER_SAFETY_PAD;
}

function packSectionsByHeight(sections, rowHeightFn, rowGap, budget) {
  const cards = [];
  let current = [];
  let currentH = 0;
  let currentSectionOnCard = null;

  const pushCurrent = () => {
    if (current.length) cards.push(current);
    current = [];
    currentH = 0;
    currentSectionOnCard = null;
  };

  for (const section of sections) {
    const items = section.items || [];
    for (const item of items) {
      const itemH = rowHeightFn(item) + rowGap;
      const isNewSectionOnCard = currentSectionOnCard !== section;
      const headingCost = isNewSectionOnCard && section.heading ? SECTION_HEADING_BLOCK : 0;
      const sectionGap = isNewSectionOnCard && currentSectionOnCard ? SECTION_BOTTOM_GAP : 0;
      const totalCost = itemH + headingCost + sectionGap;

      if (currentH + totalCost > budget && current.length) {
        pushCurrent();
      }

      let carrier = current.length ? current[current.length - 1] : null;
      if (!carrier || carrier._orig !== section) {
        carrier = {
          accent: section.accent,
          heading: section.heading,
          continued: currentSectionOnCard === null && cards.length > 0 && cards[cards.length - 1]?.some((s) => s._orig === section),
          items: [],
          _orig: section,
        };
        current.push(carrier);
        if (section.heading) currentH += SECTION_HEADING_BLOCK;
        if (currentSectionOnCard && current.length > 1) currentH += SECTION_BOTTOM_GAP;
        currentSectionOnCard = section;
      }
      carrier.items.push(item);
      currentH += itemH;
    }
  }
  if (current.length) cards.push(current);

  // Strip the internal `_orig` marker before returning.
  return cards.map((secs) => secs.map((s) => {
    const { _orig, ...rest } = s;
    return rest;
  }));
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

// Cover-fit an image into a target rect, honoring an author-supplied
// focal point + zoom. Emits a warning when the crop preserves less than
// 55% of the source area — usually a sign the photo needs a "band"
// layout (wide sources) or a tighter curated crop.
function drawImageCover(ctx, img, x, y, w, h, resolved) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = resolved?.zoom || 1;
  const [fx, fy] = parseFocalPoint(resolved?.position);
  const baseScale = Math.max(w / iw, h / ih);
  const scale = baseScale * zoom;
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.max(0, Math.min(iw - sw, (iw - sw) * fx));
  const sy = Math.max(0, Math.min(ih - sh, (ih - sh) * fy));
  const coverage = (sw * sh) / (iw * ih);
  if (coverage < 0.55) {
    const pct = Math.round(coverage * 100);
    console.warn(`[recipe-card] image "${resolved?.src || ""}" preserves ${pct}% of source in a ${w}x${h} slot — use layout: "band" or a tighter crop`);
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
