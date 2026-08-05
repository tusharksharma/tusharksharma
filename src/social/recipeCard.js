// Printed-recipe-card renderer.
//
// Unlike structuredCard.js (photo strip + body text), this renders a warm
// off-white "printed recipe card" with charcoal ink, amber accents, and no
// photograph. Two card kinds share this renderer:
//
//   recipe-ingredients — two-column ingredient list with quantity/text/note
//   recipe-method       — numbered instructions, optional SPLIT HERE callout
//
// Layout is measured with a shared measurement canvas so pagination is
// content-aware (no fixed item counts). Ingredients/methods paginate into
// as many cards as needed to fit without ellipsizing; generator caps at 2.

export const RECIPE_CARD_THEME = {
  paper: "#F7F3EA",
  ink: "#171717",
  muted: "#6B6258",
  rule: "#D8CDBD",
  amber: "#D98E04",
  amberSoft: "rgba(217, 142, 4, 0.14)",
  coral: "#C45151",
  coralSoft: "rgba(196, 81, 81, 0.10)",
  green: "#3B7A57",
  greenSoft: "rgba(59, 122, 87, 0.10)",
};

export const RECIPE_CARD_METRICS = {
  width: 1080,
  height: 1080,
  margin: 64,
  columnGap: 48,
  titleSize: 52,
  sectionSize: 22,
  bodySize: 27,
  bodyLineHeight: 35,
  noteSize: 21,
  noteLineHeight: 28,
  footerSize: 19,
  // vertical rhythm
  headerGap: 20,           // gap between brand row and eyebrow
  titleGap: 24,            // gap between eyebrow and title
  metaGap: 12,             // gap between title and meta chip row
  ruleGap: 16,             // gap between meta and amber rule
  bodyGap: 28,             // gap between amber rule and body columns
  sectionGap: 20,          // vertical gap between sections in one column
  itemGap: 10,             // vertical gap between items in a section
  quantityColumnWidth: 110, // width reserved for quantity in ingredient rows
  quantityGutter: 16,      // gap between quantity column and text column
  numberColumnWidth: 46,   // width reserved for step number in method rows
  numberGutter: 14,
  footerBottomInset: 44,   // distance from bottom of card to footer text
};

const T = RECIPE_CARD_THEME;
const P = RECIPE_CARD_METRICS;

const FONT_STACK_SANS = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const FONT_STACK_SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

export function fontSans(weight, size) {
  return `${weight} ${size}px ${FONT_STACK_SANS}`;
}

export function fontSerif(weight, size) {
  return `${weight} ${size}px ${FONT_STACK_SERIF}`;
}

// ---------- MEASUREMENT ----------
//
// A hidden canvas so pagination can measure real wrapped-line counts before
// deciding how many cards to emit. Falls back to a rough character-based
// estimate when no DOM is available (e.g. SSR pre-render).

let _measureCtx = null;
function measureCtx() {
  if (_measureCtx) return _measureCtx;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 16; c.height = 16;
  _measureCtx = c.getContext("2d");
  return _measureCtx;
}

function wrapLineCount(text, fontStr, maxWidth) {
  const ctx = measureCtx();
  const s = String(text || "");
  if (!s.trim()) return 0;
  if (!ctx) {
    // Rough fallback: 12px per char average.
    const approxChars = Math.floor(maxWidth / 12);
    return Math.max(1, Math.ceil(s.length / approxChars));
  }
  ctx.font = fontStr;
  const words = s.split(/\s+/).filter(Boolean);
  let lines = 1;
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines++;
      line = w;
    }
  }
  return lines;
}

export function measureIngredientItem(item, columnWidth) {
  const textCol = columnWidth - P.quantityColumnWidth - P.quantityGutter;
  const primaryLines = wrapLineCount(item.text || "", fontSans(600, P.bodySize), textCol);
  const primary = Math.max(1, primaryLines) * P.bodyLineHeight;
  const note = item.note
    ? Math.max(1, wrapLineCount(item.note, fontSans(500, P.noteSize), textCol)) * P.noteLineHeight + 6
    : 0;
  return primary + note + P.itemGap;
}

export function measureMethodItem(item, columnWidth) {
  const textCol = columnWidth - P.numberColumnWidth - P.numberGutter;
  const bodyLines = wrapLineCount(item.text || "", fontSans(500, P.bodySize), textCol);
  const body = Math.max(1, bodyLines) * P.bodyLineHeight;
  const callout = item.callout ? P.noteLineHeight + 12 : 0;
  return body + callout + P.itemGap;
}

export function measureSection(section, columnWidth, kind) {
  const headingH = P.sectionSize + 12 + 2 + 10; // heading + gap + rule + gap
  const items = section.items || [];
  const measure = kind === "recipe-method" ? measureMethodItem : measureIngredientItem;
  const itemsH = items.reduce((s, it) => s + measure(it, columnWidth), 0);
  return headingH + itemsH + P.sectionGap;
}

// ---------- PAGINATION ----------
//
// Distribute an ordered list of sections into cards. Each card holds two
// columns; each column holds a subset of sections (whole sections preferred).
// If a single section exceeds one column, its items split at item boundaries;
// callers pass whole-section preference via `preferWhole`.

export function paginateIntoRecipeCards(sections, kind, { maxCards = 2 } = {}) {
  const contentH = P.height - P.margin - P.footerBottomInset - bodyStartY() - P.bodyGap;
  const columnWidth = (P.width - 2 * P.margin - P.columnGap) / 2;

  const cards = [];
  let pending = sections.map((s) => ({ ...s, items: [...(s.items || [])] }));

  while (pending.length && cards.length < maxCards) {
    const col1 = [];
    const col2 = [];
    let col1H = 0;
    let col2H = 0;

    // Fill column 1 with whole sections when they fit.
    while (pending.length) {
      const s = pending[0];
      const h = measureSection(s, columnWidth, kind);
      if (col1H + h <= contentH) {
        col1.push(s);
        col1H += h;
        pending.shift();
      } else if (col1.length === 0) {
        // The very first section doesn't fit in one column: split it.
        const [head, tail] = splitSectionByHeight(s, columnWidth, contentH - col1H, kind);
        if (head) { col1.push(head); col1H += measureSection(head, columnWidth, kind); }
        if (tail) pending[0] = tail;
        break;
      } else {
        break;
      }
    }

    // Fill column 2.
    while (pending.length) {
      const s = pending[0];
      const h = measureSection(s, columnWidth, kind);
      if (col2H + h <= contentH) {
        col2.push(s);
        col2H += h;
        pending.shift();
      } else if (col2.length === 0) {
        const [head, tail] = splitSectionByHeight(s, columnWidth, contentH - col2H, kind);
        if (head) { col2.push(head); col2H += measureSection(head, columnWidth, kind); }
        if (tail) pending[0] = tail;
        break;
      } else {
        break;
      }
    }

    cards.push({ columns: [{ sections: col1 }, { sections: col2 }] });
  }

  // Overflow: if content remains and maxCards reached, dump remainder into
  // the last card's column 2 (validator will surface the overflow).
  if (pending.length && cards.length) {
    const last = cards[cards.length - 1];
    for (const s of pending) last.columns[1].sections.push(s);
  }

  return cards;
}

function splitSectionByHeight(section, columnWidth, availableHeight, kind) {
  const measure = kind === "recipe-method" ? measureMethodItem : measureIngredientItem;
  const items = section.items || [];
  const headingH = P.sectionSize + 12 + 2 + 10;
  let usedH = headingH;
  const head = [];
  for (const item of items) {
    const ih = measure(item, columnWidth);
    if (usedH + ih > availableHeight) break;
    head.push(item);
    usedH += ih;
  }
  if (head.length === 0) {
    // Not even one item fits — return the section whole so the caller can move it.
    return [null, section];
  }
  const tail = items.slice(head.length);
  return [
    { ...section, items: head },
    tail.length ? { ...section, items: tail, heading: section.heading, continued: true } : null,
  ];
}

function bodyStartY() {
  // brand row + eyebrow + title + meta + rule offsets → where body columns begin
  return P.margin + P.footerSize + P.headerGap + P.sectionSize + P.titleGap + P.titleSize + P.metaGap + P.footerSize + P.ruleGap + 2;
}

// ---------- CANVAS DRAWING ----------

export function drawRecipeCard(ctx, layout) {
  // Paper background
  ctx.fillStyle = T.paper;
  ctx.fillRect(0, 0, P.width, P.height);

  // Charcoal outer border + inner amber hairline.
  ctx.strokeStyle = T.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, P.width - 48, P.height - 48);
  ctx.strokeStyle = T.amber;
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, P.width - 60, P.height - 60);

  // Top: brand + counter row
  let y = P.margin;
  ctx.font = fontSans(800, P.footerSize);
  ctx.fillStyle = T.amber;
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText("THE SPLIT PLATE", P.margin, y);
  ctx.font = fontSans(700, P.footerSize);
  ctx.fillStyle = T.muted;
  ctx.textAlign = "right";
  ctx.fillText(`${layout.index} / ${layout.total}`, P.width - P.margin, y);
  ctx.textAlign = "left";

  // Eyebrow ("INGREDIENTS" / "METHOD")
  y += P.footerSize + P.headerGap;
  ctx.font = fontSans(800, P.sectionSize);
  ctx.fillStyle = T.muted;
  drawLetterSpaced(ctx, (layout.eyebrow || "").toUpperCase(), P.margin, y, 3);

  // Title (serif, ink)
  y += P.sectionSize + P.titleGap;
  ctx.font = fontSerif(900, P.titleSize);
  ctx.fillStyle = T.ink;
  ctx.fillText(layout.recipeName || "", P.margin, y);

  // Meta chip row
  y += P.titleSize + P.metaGap;
  const meta = layout.meta || {};
  const metaBits = [];
  if (meta.servings) metaBits.push(`${meta.servings} servings`);
  if (meta.time) metaBits.push(meta.time);
  if (meta.calories) metaBits.push(`${meta.calories} cal`);
  if (meta.protein) metaBits.push(`${meta.protein} protein`);
  ctx.font = fontSans(500, P.footerSize);
  ctx.fillStyle = T.muted;
  ctx.fillText(metaBits.join("  ·  "), P.margin, y);

  // Amber divider
  y += P.footerSize + P.ruleGap;
  ctx.strokeStyle = T.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P.margin, y);
  ctx.lineTo(P.width - P.margin, y);
  ctx.stroke();

  // Body columns
  const bodyY = y + P.bodyGap;
  const columnWidth = (P.width - 2 * P.margin - P.columnGap) / 2;
  const col1X = P.margin;
  const col2X = P.margin + columnWidth + P.columnGap;

  const cols = layout.columns || [];
  if (cols[0]) drawColumn(ctx, cols[0], col1X, bodyY, columnWidth, layout.kind);
  if (cols[1]) drawColumn(ctx, cols[1], col2X, bodyY, columnWidth, layout.kind);

  // Footer: URL on left, counter re-echoed on right (already at top).
  ctx.font = fontSans(500, P.footerSize);
  ctx.fillStyle = T.muted;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(layout.footer || "thesplitplate.com", P.margin, P.height - P.footerBottomInset);
}

function drawColumn(ctx, column, x, y0, width, kind) {
  let y = y0;
  for (const section of column.sections || []) {
    y = drawSection(ctx, section, x, y, width, kind);
    y += P.sectionGap;
  }
}

function drawSection(ctx, section, x, y, width, kind) {
  const accentColor = accentColorFor(section.accent);

  // Section heading
  ctx.font = fontSans(800, P.sectionSize);
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  const heading = section.continued ? `${section.heading} (cont.)` : section.heading;
  drawLetterSpaced(ctx, (heading || "").toUpperCase(), x, y, 2);
  y += P.sectionSize + 6;

  // Accent hairline under heading
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.min(width, 120), y);
  ctx.stroke();
  y += 12;

  // Items
  for (const item of section.items || []) {
    if (kind === "recipe-method") {
      y = drawMethodItem(ctx, item, x, y, width);
    } else {
      y = drawIngredientItem(ctx, item, x, y, width);
    }
    y += P.itemGap;
  }

  return y;
}

function drawIngredientItem(ctx, item, x, y, width) {
  const qX = x;
  const tX = x + P.quantityColumnWidth + P.quantityGutter;
  const textW = width - P.quantityColumnWidth - P.quantityGutter;

  // Quantity (bold)
  ctx.font = fontSans(800, P.bodySize);
  ctx.fillStyle = T.ink;
  ctx.fillText(item.quantity || "", qX, y);

  // Text (regular weight)
  ctx.font = fontSans(600, P.bodySize);
  const endY = drawWrapped(ctx, item.text || item.ingredient || "", tX, y, textW, {
    weight: 600, size: P.bodySize, color: T.ink, lineHeight: P.bodyLineHeight, maxLines: 3,
  });

  let bottomY = endY;
  if (item.note) {
    const noteY = bottomY + 4;
    const noteEnd = drawWrapped(ctx, item.note, tX, noteY, textW, {
      weight: 500, size: P.noteSize, color: T.muted, lineHeight: P.noteLineHeight, maxLines: 2,
    });
    bottomY = noteEnd;
  }
  return bottomY;
}

function drawMethodItem(ctx, item, x, y, width) {
  const nX = x;
  const tX = x + P.numberColumnWidth + P.numberGutter;
  const textW = width - P.numberColumnWidth - P.numberGutter;

  // SPLIT HERE callout (renders ABOVE the numbered step)
  if (item.callout) {
    const bg = calloutBgFor(item.callout);
    const fg = calloutColorFor(item.callout);
    const calloutH = P.noteLineHeight + 4;
    roundedRect(ctx, x, y, width, calloutH, 8);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.font = fontSans(800, P.noteSize);
    ctx.fillStyle = fg;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    drawLetterSpaced(ctx, item.callout.toUpperCase(), x + 12, y + calloutH / 2, 2);
    ctx.textBaseline = "top";
    y += calloutH + 8;
  }

  // Number
  ctx.font = fontSerif(900, P.bodySize);
  ctx.fillStyle = T.amber;
  ctx.fillText(`${item.number ?? item.step ?? ""}.`, nX, y);

  // Body text
  const endY = drawWrapped(ctx, item.text || "", tX, y, textW, {
    weight: 500, size: P.bodySize, color: T.ink, lineHeight: P.bodyLineHeight, maxLines: 6,
  });

  return endY;
}

function drawWrapped(ctx, text, x, y, maxWidth, { weight, size, color, lineHeight, maxLines }) {
  ctx.font = fontSans(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  visible.forEach((t, i) => ctx.fillText(t, x, y + i * lineHeight));
  return y + visible.length * lineHeight;
}

function drawLetterSpaced(ctx, text, x, y, spacing) {
  const chars = String(text || "").split("");
  let cx = x;
  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function accentColorFor(accent) {
  if (accent === "coral") return T.coral;
  if (accent === "green") return T.green;
  if (accent === "amber") return T.amber;
  return T.muted;
}

function calloutBgFor() {
  return T.coralSoft;
}
function calloutColorFor() {
  return T.coral;
}
