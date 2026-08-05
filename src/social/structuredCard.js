// Structured social card — shared model for canvas + DOM renderers.
//
// A `Layout` is a fully-normalized description of ONE 1080×1080 social card.
// Both `drawStructuredCard(ctx, layout)` (canvas → PNG export) and
// `<StructuredCardInner layout={layout} />` (DOM → on-screen preview)
// consume the SAME Layout object so the preview and the export never drift.
//
// Card kinds: "ingredients" | "method" | "serving" — thin config wrappers
// around this shared renderer that differ only in photo-strip height and
// default block accent semantics.
//
//
// ---------- socialCarousel field shape (author-facing) ----------
//
// Add to a recipe (recipes.js) or cookbook item (cookbook.js) as an
// OPTIONAL top-level field. Every group is per-group fallback:
//
//   undefined  → derive from existing recipe fields
//   [...]      → non-empty array used verbatim
//   []         → REJECTED by validation (never silently drop content)
//   null       → optional groups only; suppresses the group intentionally
//
// {
//   hook: string,                          // one-line pitch on the hero card
//   ingredientGroups: LayoutBlock[],       // REQUIRED (else auto-derived)
//   methodGroups: LayoutBlock[],           // REQUIRED (else auto-derived)
//   servingGroups: LayoutBlock[] | null,   // optional
//   splitNotes: { adult: string[], smallerPlate: string[] } | null,
//   criticalComponent: string | null,
//   engagementQuestion: string | null,     // rendered on the final "Save and visit" card
// }
//
// LayoutBlock:
//   { accent: "amber"|"coral"|"green"|"neutral", heading: string, items: LayoutItem[] }
//
// LayoutItem (shape depends on card kind):
//   ingredients: { quantity: string, ingredient: string, note?: string }
//   method:      { step: number, text: string }
//   serving:     { text: string }

export const EXPORT_SIZE = 1080;
export const SAFE_MARGIN = 72;

// Photo-strip heights per card kind. Revised post-first-run: original 240/300
// strips read as decorative thumbnails; bumping to 420/500/600 makes the card
// feel photo-first while shrinking the text budget to the essentials.
export const PHOTO_STRIP_HEIGHTS = {
  ingredients: 420,
  method: 500,
  serving: 600,
};

// Accent palette. Matches the existing split-card colors in SocialPage.jsx
// so old and new cards read as one visual family.
//   amber   → SHARED content
//   coral   → ADULT FINISH
//   green   → SMALLER PLATE
//   neutral → generic (no split, or informational)
export const ACCENTS = {
  amber:   { text: "#fbbf24", fill: "rgba(245, 158, 11, 0.10)", border: "rgba(180, 83, 9, 0.45)" },
  coral:   { text: "#f87171", fill: "rgba(69, 10, 10, 0.28)",   border: "rgba(127, 29, 29, 0.55)" },
  green:   { text: "#4ade80", fill: "rgba(5, 46, 22, 0.28)",    border: "rgba(20, 83, 45, 0.55)" },
  neutral: { text: "#d4d4d4", fill: "rgba(23, 23, 23, 0.6)",    border: "rgba(38, 38, 38, 0.9)" },
};

// ---------- CANVAS PRIMITIVES ----------
// Exported so /social/hero.js and /social/generator.js can share the same
// text/image helpers; keeps one code path for word-wrap + image loading.

export function font(weight, size) {
  return `${weight} ${size}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src.startsWith("/") ? src : `/${src}`;
  });
}

export function drawCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Word-wrap helper. Returns the y-cursor AFTER the last drawn line.
// Never overflows `maxLines`; if it would, the last visible line is
// ellipsed. Callers relying on overflow detection should pre-measure
// instead (see validateLayoutFitsCard() in ./generator.js).
export function drawWrapped(ctx, text, x, y, maxWidth, { size, weight, color, lineHeight, maxLines }) {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) {
    let last = visible[visible.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    visible[visible.length - 1] = `${last.trim()}...`;
  }
  visible.forEach((t, i) => ctx.fillText(t, x, y + i * lineHeight));
  return y + visible.length * lineHeight;
}

// ---------- SHARED TEXT-BLOCK RENDERER ----------
// Draws heading + items for one block. Card kinds pass in an item-formatter
// so this function stays kind-agnostic. Returns the y-cursor AFTER the block.
export function drawTextBlock(ctx, block, { x, y, width, itemFormatter }) {
  const accent = ACCENTS[block.accent] || ACCENTS.neutral;

  ctx.font = font(900, 22);
  ctx.fillStyle = accent.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(String(block.heading || "").toUpperCase(), x, y);
  y += 34;

  (block.items || []).forEach((item) => {
    const { primary, secondary } = itemFormatter(item);
    y = drawWrapped(ctx, primary, x, y, width, {
      size: 30, weight: 700, color: "#f5f5f5", lineHeight: 40, maxLines: 3,
    });
    if (secondary) {
      y = drawWrapped(ctx, secondary, x, y + 2, width, {
        size: 24, weight: 500, color: "#a3a3a3", lineHeight: 32, maxLines: 2,
      });
    }
    y += 12;
  });

  return y + 8;
}

// ---------- MAIN CARD RENDERER ----------
// Renders a full 1080×1080 structured card from a Layout. Consumes the same
// Layout object as <StructuredCardInner> so preview and export can't drift.
export async function drawStructuredCard(ctx, layout) {
  const stripH = layout.photoStripHeight || PHOTO_STRIP_HEIGHTS[layout.kind] || 240;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  if (layout.photoSrc) {
    let img = null;
    try { img = await loadImage(layout.photoSrc); } catch { img = null; }
    if (img) drawCover(ctx, img, 0, 0, EXPORT_SIZE, stripH);
    // Subtle dark gradient at the photo/text boundary for legibility.
    const g = ctx.createLinearGradient(0, stripH - 60, 0, stripH);
    g.addColorStop(0, "rgba(10, 10, 10, 0)");
    g.addColorStop(1, "rgba(10, 10, 10, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, stripH - 60, EXPORT_SIZE, 60);
  }

  // Running recipe-name header (top-left) + card counter (top-right).
  ctx.font = font(700, 22);
  ctx.fillStyle = "rgba(245, 245, 245, 0.92)";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(String(layout.recipeName || "").toUpperCase(), SAFE_MARGIN, 40);

  ctx.font = font(900, 22);
  ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
  ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText(`${layout.index} / ${layout.total}`, EXPORT_SIZE - SAFE_MARGIN, 40);

  // Body starts under the photo strip.
  const textAreaX = SAFE_MARGIN;
  const textAreaWidth = EXPORT_SIZE - SAFE_MARGIN * 2;
  let cursorY = stripH + 48;

  const formatter = itemFormatterFor(layout.kind);
  for (const block of (layout.blocks || [])) {
    cursorY = drawTextBlock(ctx, block, {
      x: textAreaX, y: cursorY, width: textAreaWidth, itemFormatter: formatter,
    });
  }

  if (layout.footerText) {
    ctx.font = font(600, 22);
    ctx.fillStyle = "#a3a3a3";
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(layout.footerText, EXPORT_SIZE / 2, EXPORT_SIZE - 36);
  }
}

export function itemFormatterFor(kind) {
  if (kind === "ingredients") {
    return (item) => ({
      primary: item.quantity ? `${item.quantity}  ${item.ingredient}` : item.ingredient,
      secondary: item.note || undefined,
    });
  }
  if (kind === "method") {
    return (item) => ({
      primary: `${item.step}. ${item.text}`,
      secondary: undefined,
    });
  }
  return (item) => ({
    primary: item.text || String(item),
    secondary: undefined,
  });
}

// ---------- LAYOUT BUILDERS + FALLBACK RESOLVER ----------

// Resolve a curated group vs auto-derived fallback.
// - undefined → autoDerive()   (existing-field fallback)
// - non-empty array → used verbatim
// - empty array → THROWS (validation error surfaced in Phase 2)
// - null → suppresses the group (only allowed when opts.required is false)
export function resolveGroup(curated, autoDerive, { required = false } = {}) {
  if (curated === undefined) return autoDerive();
  if (curated === null) {
    if (required) throw new Error("Required socialCarousel group cannot be null; use undefined for auto-derive.");
    return null;
  }
  if (Array.isArray(curated) && curated.length === 0) {
    throw new Error("socialCarousel group is empty; use `undefined` for auto-derive or `null` to suppress.");
  }
  return curated;
}

export function buildIngredientsLayout(recipe, curated, { index, total, photoSrc }) {
  const blocks = resolveGroup(curated?.ingredientGroups, () => deriveIngredientGroups(recipe), { required: true });
  return {
    kind: "ingredients",
    index, total,
    recipeName: recipe.title || "",
    photoSrc: photoSrc || null,
    photoStripHeight: PHOTO_STRIP_HEIGHTS.ingredients,
    blocks,
    footerText: null,
  };
}

export function buildMethodLayout(recipe, curated, { index, total, photoSrc }) {
  const blocks = resolveGroup(curated?.methodGroups, () => deriveMethodGroups(recipe), { required: true });
  return {
    kind: "method",
    index, total,
    recipeName: recipe.title || "",
    photoSrc: photoSrc || null,
    photoStripHeight: PHOTO_STRIP_HEIGHTS.method,
    blocks,
    footerText: null,
  };
}

export function buildServingLayout(recipe, curated, { index, total, photoSrc }) {
  const blocks = resolveGroup(curated?.servingGroups, () => deriveServingGroups(recipe), { required: false });
  return {
    kind: "serving",
    index, total,
    recipeName: recipe.title || "",
    photoSrc: photoSrc || null,
    photoStripHeight: PHOTO_STRIP_HEIGHTS.serving,
    blocks: blocks || [],
    footerText: curated?.engagementQuestion || null,
  };
}

// ---------- AUTO-DERIVATION ----------
// Phase-1 stub. Sufficient for the curated Phase-2 test recipes to render
// without hitting this path. Phase 2's generator will flesh out the
// SHARED / ADULT FINISH / SMALLER PLATE split-plate ingredient handling
// and the SPLIT-HERE callout inside the method flow.

function deriveIngredientGroups(recipe) {
  const items = (recipe.ingredients || [])
    .filter((raw) => {
      const t = typeof raw === "object" ? raw.text : raw;
      return t && !t.startsWith("---");
    })
    .map((raw) => {
      const t = typeof raw === "object" ? raw.text : raw;
      const m = t.match(/^(\S+(?:\s*[-–]\s*\S+)?)\s+(.*)$/);
      return m ? { quantity: m[1], ingredient: m[2] } : { quantity: "", ingredient: t };
    });
  return [{ accent: "amber", heading: "Ingredients", items }];
}

function deriveMethodGroups(recipe) {
  const steps = (recipe.steps || []).map((s, i) => ({
    step: i + 1,
    text: (typeof s === "object" ? s.text : s) || "",
  }));
  return [{ accent: "amber", heading: "Method", items: steps }];
}

function deriveServingGroups(recipe) {
  const items = [];
  if (recipe.servings) items.push({ text: `Serves ${recipe.servings}` });
  if (recipe.mealPrep?.storage) items.push({ text: recipe.mealPrep.storage });
  return items.length ? [{ accent: "neutral", heading: "Serving", items }] : [];
}
