/* eslint-disable react-refresh/only-export-components */
// Structured hero card — the first card in every carousel.
//
// Follows the same "one Layout, two renderers" contract as structuredCard.js.
// Canvas: drawStructuredHero(ctx, layout). DOM: <HeroStructuredInner layout={layout} />.
//
// HeroLayout shape:
//   {
//     kind: "hero",
//     index: 1,
//     total: N,
//     recipeName: string,          // used by the running header on OTHER cards; hero doesn't need it (title covers it)
//     photoSrc: string,
//     photoStripHeight: number,    // default 640 (bigger than any structured card — hero photo is the hook)
//     badge?: string,              // "Episode 3" / "Powerup" / "Split Plate Dinner"
//     title: string,
//     tagline?: string,
//     stats: [{value: string, label: string}, ...],   // max 3 pills
//     accent?: "amber" | "coral" | "green" | "neutral",  // badge + accent line color
//   }

import { ACCENTS, EXPORT_SIZE, SAFE_MARGIN, drawCover, drawWrapped, font, loadImage } from "./structuredCard";

export const HERO_PHOTO_STRIP_HEIGHT = 640;

export async function drawStructuredHero(ctx, layout) {
  const stripH = layout.photoStripHeight || HERO_PHOTO_STRIP_HEIGHT;
  const accent = ACCENTS[layout.accent] || ACCENTS.amber;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  if (layout.photoSrc) {
    let img = null;
    try { img = await loadImage(layout.photoSrc); } catch { img = null; }
    if (img) drawCover(ctx, img, 0, 0, EXPORT_SIZE, stripH);
    // gradient at photo/text boundary
    const g = ctx.createLinearGradient(0, stripH - 90, 0, stripH);
    g.addColorStop(0, "rgba(10, 10, 10, 0)");
    g.addColorStop(1, "rgba(10, 10, 10, 1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, stripH - 90, EXPORT_SIZE, 90);
  }

  // Card counter top-right. No recipe-name header — the title carries it.
  ctx.font = font(900, 22);
  ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
  ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText(`${layout.index} / ${layout.total}`, EXPORT_SIZE - SAFE_MARGIN, 40);

  let y = stripH + 40;

  if (layout.badge) {
    ctx.font = font(900, 22);
    ctx.fillStyle = accent.text;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(String(layout.badge).toUpperCase(), SAFE_MARGIN, y);
    y += 36;
  }

  // Title
  y = drawWrapped(ctx, layout.title || "", SAFE_MARGIN, y, EXPORT_SIZE - SAFE_MARGIN * 2, {
    size: 56, weight: 900, color: "#ffffff", lineHeight: 66, maxLines: 3,
  });
  y += 16;

  if (layout.tagline) {
    y = drawWrapped(ctx, layout.tagline, SAFE_MARGIN, y, EXPORT_SIZE - SAFE_MARGIN * 2, {
      size: 28, weight: 500, color: "#d4d4d4", lineHeight: 38, maxLines: 2,
    });
    y += 20;
  }

  // Stats row — up to 3 pills across the bottom
  const stats = (layout.stats || []).slice(0, 3);
  if (stats.length) {
    const gap = 20;
    const contentW = EXPORT_SIZE - SAFE_MARGIN * 2;
    const pillW = Math.floor((contentW - gap * (stats.length - 1)) / stats.length);
    const pillH = 96;
    const pillY = EXPORT_SIZE - SAFE_MARGIN - pillH;
    stats.forEach((s, i) => {
      const x = SAFE_MARGIN + i * (pillW + gap);
      ctx.fillStyle = "#171717";
      ctx.strokeStyle = "rgba(64, 64, 64, 0.9)";
      ctx.lineWidth = 2;
      roundedRect(ctx, x, pillY, pillW, pillH, 20);
      ctx.fill();
      ctx.stroke();
      ctx.font = font(900, 32);
      ctx.fillStyle = accent.text;
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(String(s.value || ""), x + pillW / 2, pillY + 14);
      ctx.font = font(600, 18);
      ctx.fillStyle = "#a3a3a3";
      ctx.fillText(String(s.label || "").toUpperCase(), x + pillW / 2, pillY + 58);
    });
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

// ---------- DOM PREVIEW ----------

const SCREEN = 540;
const S = SCREEN / EXPORT_SIZE;

export function HeroStructuredInner({ layout }) {
  const stripH = (layout.photoStripHeight || HERO_PHOTO_STRIP_HEIGHT) * S;
  const marginPx = SAFE_MARGIN * S;
  const accent = (ACCENTS[layout.accent] || ACCENTS.amber).text;

  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden text-white">
      {layout.photoSrc && (
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: stripH }}>
          <img src={layout.photoSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 45 * S,
              background: "linear-gradient(to bottom, rgba(10,10,10,0), rgba(10,10,10,1))",
            }}
          />
        </div>
      )}

      <div
        className="absolute top-0 right-0 font-black"
        style={{ padding: `${20 * S}px ${marginPx}px 0 0`, fontSize: `${22 * S}px`, color: "rgba(245,158,11,0.95)" }}
      >
        {layout.index} / {layout.total}
      </div>

      <div
        className="absolute inset-x-0"
        style={{ top: stripH + 20 * S, padding: `0 ${marginPx}px` }}
      >
        {layout.badge && (
          <div
            className="uppercase tracking-wider font-black"
            style={{ fontSize: `${22 * S}px`, color: accent, marginBottom: 8 * S }}
          >
            {layout.badge}
          </div>
        )}
        <div
          className="font-black leading-tight"
          style={{ fontSize: `${56 * S}px`, color: "#ffffff", marginBottom: 8 * S }}
        >
          {layout.title}
        </div>
        {layout.tagline && (
          <div style={{ fontSize: `${28 * S}px`, color: "#d4d4d4", fontWeight: 500, lineHeight: 1.35 }}>
            {layout.tagline}
          </div>
        )}
      </div>

      {(layout.stats || []).length > 0 && (
        <div
          className="absolute inset-x-0 flex gap-2.5"
          style={{ bottom: marginPx, padding: `0 ${marginPx}px` }}
        >
          {layout.stats.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-700 rounded-2xl"
              style={{ height: 96 * S, padding: `${14 * S}px 0` }}
            >
              <div
                className="font-black"
                style={{ fontSize: `${32 * S}px`, color: accent, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div
                className="uppercase tracking-wider font-semibold"
                style={{ fontSize: `${18 * S}px`, color: "#a3a3a3", marginTop: 6 * S }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- HERO LAYOUT BUILDER ----------
//
// Curated: recipe.socialCarousel.hook (single tagline string) + optional badge / accent.
// Auto-derived: falls back to recipe fields — title, tagline from role / makeThisWhen /
// hook, stats from meta.macros + servings.

export function buildHeroLayout(recipe, curated = {}, { index, total, isCookbook, isSnackBox, isPowerup }) {
  const photoSrc =
    curated.heroPhoto ||
    recipe.image ||
    recipe.heroImage ||
    null;

  const badge = curated.heroBadge !== undefined
    ? curated.heroBadge
    : deriveBadge(recipe, { isCookbook, isSnackBox, isPowerup });

  const tagline = curated.hook !== undefined
    ? curated.hook
    : deriveTagline(recipe, { isSnackBox, isPowerup });

  const stats = curated.heroStats !== undefined
    ? curated.heroStats
    : deriveStats(recipe, { isSnackBox });

  const accent = curated.heroAccent || (recipe.splitCook ? "amber" : "amber");

  return {
    kind: "hero",
    index, total,
    recipeName: recipe.title || "",
    photoSrc,
    photoStripHeight: HERO_PHOTO_STRIP_HEIGHT,
    badge,
    title: recipe.title || "",
    tagline,
    stats,
    accent,
  };
}

function deriveBadge(recipe, { isCookbook, isSnackBox, isPowerup }) {
  if (recipe.seriesEntry) return recipe.seriesEntry;
  if (recipe.seriesInfo?.entry) return recipe.seriesInfo.entry;
  if (isSnackBox) return "Snack Box";
  if (isPowerup) return "Powerup";
  if (recipe.splitCook) return "Split Plate Dinner";
  if (isCookbook) return "Cookbook";
  return null;
}

function deriveTagline(recipe) {
  if (recipe.tagline) return recipe.tagline;
  if (recipe.role) return recipe.role;
  if (recipe.useThisWhen) return recipe.useThisWhen.split(/[.!]/)[0].slice(0, 140);
  if (recipe.hook) return recipe.hook.split(/[.!]/)[0].slice(0, 140);
  if (recipe.description) return recipe.description.split(/[.!]/)[0].slice(0, 140);
  return "";
}

function deriveStats(recipe, { isSnackBox }) {
  const m = recipe.meta?.macros || {};
  const stats = [];
  // Powerups + snack boxes surface calories/protein per serving.
  // Split-plate dinners surface adult calories/protein (adult container),
  // matching the brief's "adult macros" spec on the hero.
  const cal = m.calories || recipe.calories || recipe.caloriesPerServing;
  const pro = m.protein || recipe.protein || recipe.proteinPerServing;
  if (cal) stats.push({ value: `${cal}`, label: "calories" });
  if (pro) stats.push({ value: `${pro}g`, label: "protein" });
  const servings = recipe.servings || recipe.servingSize;
  if (servings) {
    stats.push({ value: `${servings}`, label: isSnackBox ? "box" : "servings" });
  } else if (recipe.time) {
    stats.push({ value: `${recipe.time}`, label: "time" });
  }
  return stats.slice(0, 3);
}
