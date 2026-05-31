import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import { sauces, bases, breakfasts, desserts, quickLunches } from "../data/cookbook";
import useMeta from "../hooks/useMeta";

const ALL_COOKBOOK = [...sauces, ...bases, ...breakfasts, ...desserts, ...quickLunches];

const HASHTAG_BASE = [
  "#TheSplitPlate", "#CookOnceSplitSmart", "#SplitCook",
  "#HighProteinFamilyDinner", "#FamilyMealPrep", "#KidApprovedDinner",
  "#WeeknightDinner", "#FamilyDinnerIdeas", "#HighProtein",
];

const PROTEIN_HASHTAGS = {
  pork: ["#PorkChops", "#PorkDinner"],
  chicken: ["#ChickenDinner", "#ChickenRecipes"],
  beef: ["#BeefDinner", "#SteakDinner"],
  steak: ["#SteakNight", "#SteakDinner"],
};

function hashtagsFor(recipe) {
  const proteinTag = recipe.meta?.proteinTags?.[0];
  const proteinTags = PROTEIN_HASHTAGS[proteinTag] || [];
  const titleTags = recipe.title.split(/\s*[+,]\s*|\s+/)
    .filter((w) => w.length > 4 && !/^(the|and|with|drizzle|chops?)$/i.test(w))
    .slice(0, 3)
    .map((w) => `#${w.replace(/[^a-z0-9]/gi, "")}`)
    .filter((t) => t.length > 2);
  const carbTag = recipe.carbLevel === "low" || recipe.carbLevel === "none" ? ["#LowCarbDinner"] : [];
  return [...HASHTAG_BASE, ...proteinTags, ...carbTag, ...titleTags];
}

// Per-brand handles for Instagram (`ig`) and TikTok (`tiktok`). TikTok handles
// are verified via web search — many brands have DIFFERENT @ on TikTok vs IG.
// If a brand has no verified TikTok handle, omit `tiktok` and it's silently
// dropped from the TikTok caption (avoids posting a fake @).
const KNOWN_HANDLES = {
  "Dan-O's": { ig: "@danosseasoning", tiktok: "@danosseasoning" },
  "Kirkland Signature": { ig: "@kirklandsignature_costco" },
  "Kirkland": { ig: "@kirklandsignature_costco" },
  "Laughing Cow": { ig: "@thelaughingcow", tiktok: "@thelaughingcowus" },
  "Lea & Perrins": { ig: "@leaandperrins", tiktok: "@lea_and_perrins" },
  "Smash Kitchen": { ig: "@smashkitchenco", tiktok: "@getsmashkitchen" },
  "Kikkoman": { ig: "@kikkoman_usa", tiktok: "@kikkomankitchen" },
  "General Mills": { ig: "@generalmills", tiktok: "@generalmills" },
  "Lee Kum Kee": { ig: "@leekumkeeusa", tiktok: "@leekumkeeusa" },
  "Verka": { ig: "@verkadairy" },
  "Red Boat": { ig: "@redboatfishsauce", tiktok: "@redboatfishsauce" },
  "Tanimura & Antle": { ig: "@tanimuraantle" },
  "Chosen Foods": { ig: "@chosenfoods", tiktok: "@chosenfoods" },
  "Herdez": { ig: "@herdez", tiktok: "@herdezbrand" },
  "Daisy": { ig: "@daisybrand", tiktok: "@daisysourcreamofficial" },
  "Fage": { ig: "@fageusa" },
  "Philadelphia": { ig: "@philadelphia", tiktok: "@philadelphia" },
  "Whole Earth": { ig: "@wholeearthsweetener", tiktok: "@wholeearthsweetener" },
  "Ghirardelli": { ig: "@ghirardelli", tiktok: "@officalghirardelli" },
  "Nescafé": { ig: "@nescafe_usa", tiktok: "@nescafe.usa" },
  "HighKey": { ig: "@highkeysnacks", tiktok: "@highkeysnacks" },
  "PEScience": { ig: "@pescience", tiktok: "@pescience" },
  "Little Potato Co.": { ig: "@littlepotatoco", tiktok: "@littlepotatoco" },
  "NY Style Sausage Co.": { ig: "@nystylesausage" },
  "Dynasty": { ig: "@dynasty.foods" },
  "Bare Bones": { ig: "@barebonesbroth" },
  "Anthony's": { ig: "@anthonys.organic" },
  "Lily's": { ig: "@lilyssweets" },
  "Thrive Market": { ig: "@thrivemarket", tiktok: "@thrivemarket" },
  "Fairlife": { ig: "@fairlife", tiktok: "@fairlifeofficial" },
  "Nakano": { ig: "@nakanorice" },
  "Taste Flavor Co.": { ig: "@tasteflavorco" },
  "Opportuniteas": { ig: "@opportuniteas" },
  "Bob's Red Mill": { ig: "@bobsredmill", tiktok: "@bobsredmill" },
  "Marketside (Walmart)": { ig: "@marketside" },
  "Pete's Pasta": { ig: "@petespasta" },
  "Rao's": { ig: "@raoshomemade", tiktok: "@raoshomemade" },
  "Barilla": { ig: "@barillaus", tiktok: "@barilla" },
  "Falls Brand": { ig: "@fallsbrand" },
  "365 Whole Foods": { ig: "@wholefoods" },
};

function brandHandles(recipe, platform = "ig") {
  return (recipe.brands || [])
    .map((b) => KNOWN_HANDLES[b.name]?.[platform])
    .filter(Boolean);
}

// TikTok performs best with 3-5 well-targeted hashtags. We pick exactly 5:
//   1. #TheSplitPlate (brand)
//   2. #CookOnceSplitSmart (brand tagline — the search-discoverable phrase)
//   3. Recipe-specific protein tag (#PorkChops, #ChickenDinner, etc.)
//   4. Audience tag based on macros (high-protein, low-carb, or meal-prep)
//   5. Format tag (#WeeknightDinner or #FamilyDinner — broad reach)
function tiktokHashtagsFor(recipe) {
  const tags = ["#TheSplitPlate", "#CookOnceSplitSmart"];
  const proteinTag = recipe.meta?.proteinTags?.[0];
  const proteinHashtag = (PROTEIN_HASHTAGS[proteinTag] || [])[0];
  if (proteinHashtag) tags.push(proteinHashtag);
  if (recipe.carbLevel === "low" || recipe.carbLevel === "none") tags.push("#LowCarbDinner");
  else if ((recipe.protein || 0) >= 40) tags.push("#HighProteinDinner");
  else tags.push("#MealPrep");
  tags.push("#WeeknightDinner");
  return tags.slice(0, 5);
}

function extractCookbookLinks(recipe) {
  const ids = new Set();
  const scan = (arr) => {
    arr?.forEach((item) => {
      if (typeof item === "object" && item.link?.startsWith("/cookbook/")) {
        const id = item.link.replace("/cookbook/", "").replace(/\/$/, "");
        if (id) ids.add(id);
      }
    });
  };
  scan(recipe.ingredients);
  scan(recipe.splitCook?.sharedIngredients);
  scan(recipe.splitCook?.adult?.extraIngredients);
  scan(recipe.splitCook?.kid?.extraIngredients);
  return [...ids].map((id) => ALL_COOKBOOK.find((c) => c.id === id)).filter(Boolean);
}

const EXPORT_SIZE = 1080;

function assetUrl(src) {
  if (!src) return "";
  return new URL(src, window.location.origin).href;
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Missing image source"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
    img.src = assetUrl(src);
  });
}

function canvasToBlob(canvas) {
  if (canvas.toBlob) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      }, "image/png");
    });
  }
  return fetch(canvas.toDataURL("image/png")).then((res) => res.blob());
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create export canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

function fillBackground(ctx, color = "#0a0a0a") {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawCoverImage(ctx, img, x = 0, y = 0, width = EXPORT_SIZE, height = EXPORT_SIZE) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(width / iw, height / ih);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

function drawVerticalGradient(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, EXPORT_SIZE);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
}

function font(weight, size) {
  return `${weight} ${size}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

function drawText(ctx, text, x, y, {
  size = 32,
  weight = 700,
  color = "#ffffff",
  align = "left",
  baseline = "top",
} = {}) {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(String(text || ""), x, y);
}

function drawWrappedText(ctx, text, x, y, maxWidth, {
  size = 42,
  weight = 800,
  color = "#ffffff",
  lineHeight = Math.round(size * 1.16),
  maxLines = 3,
  align = "left",
} = {}) {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = align;
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

  visible.forEach((lineText, index) => {
    ctx.fillText(lineText, x, y + index * lineHeight);
  });
  return y + visible.length * lineHeight;
}

function drawBrandStrip(ctx) {
  drawText(ctx, "THE SPLIT PLATE", 40, 28, {
    size: 20,
    weight: 900,
    color: "rgba(245, 158, 11, 0.85)",
  });
  drawText(ctx, "thesplitplate.com", EXPORT_SIZE - 40, 30, {
    size: 20,
    weight: 500,
    color: "#737373",
    align: "right",
  });
}

function drawAccentLine(ctx, x, y, width = 96, height = 8) {
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x, y, width, height);
}

async function drawOptionalImageCardBase(ctx, src, overlayStops) {
  fillBackground(ctx);
  if (src) {
    const img = await loadCanvasImage(src);
    drawCoverImage(ctx, img);
  }
  drawVerticalGradient(ctx, overlayStops);
  drawBrandStrip(ctx);
}

async function drawHeroCard(ctx, recipe) {
  await drawOptionalImageCardBase(ctx, recipe.image, [
    [0, "rgba(10, 10, 10, 0.10)"],
    [0.45, "rgba(10, 10, 10, 0.35)"],
    [1, "rgba(10, 10, 10, 1)"],
  ]);
  drawAccentLine(ctx, 48, 804);
  const endY = drawWrappedText(ctx, recipe.title, 48, 838, 900, {
    size: 58,
    weight: 900,
    lineHeight: 64,
    maxLines: 3,
  });
  drawText(ctx, "Cook once. Split smart.", 48, endY + 20, {
    size: 30,
    weight: 700,
    color: "#fbbf24",
  });
}

function drawMetricBox(ctx, x, y, value, label, color = "#ffffff") {
  drawRoundedRect(ctx, x, y, 420, 168, 26, "#171717", "#262626");
  drawText(ctx, value, x + 210, y + 34, {
    size: 56,
    weight: 900,
    color,
    align: "center",
  });
  drawText(ctx, label.toUpperCase(), x + 210, y + 112, {
    size: 19,
    weight: 800,
    color: "#737373",
    align: "center",
  });
}

function drawMacroCard(ctx, recipe) {
  fillBackground(ctx);
  drawBrandStrip(ctx);
  drawAccentLine(ctx, 72, 186);
  drawWrappedText(ctx, recipe.title, 72, 218, 900, {
    size: 46,
    weight: 900,
    lineHeight: 54,
    maxLines: 2,
  });
  const m = recipe.meta?.macros || {};
  drawMetricBox(ctx, 72, 390, `${m.protein || recipe.protein}g`, "Protein", "#fbbf24");
  drawMetricBox(ctx, 588, 390, `~${m.calories || recipe.calories}`, "Calories");
  drawMetricBox(ctx, 72, 608, `${m.netCarbs != null ? m.netCarbs : m.carbs}g`, "Net Carbs", "#6ee7b7");
  drawMetricBox(ctx, 588, 608, recipe.time, "Total");
  if (recipe.meta?.costPerServing) {
    drawText(ctx, `${recipe.meta.costPerServing} per serving · ${recipe.servings} servings`, EXPORT_SIZE / 2, 842, {
      size: 24,
      weight: 500,
      color: "#a3a3a3",
      align: "center",
    });
  }
}

async function drawProcessCard(ctx, src, caption) {
  await drawOptionalImageCardBase(ctx, src, [
    [0, "rgba(10, 10, 10, 0.28)"],
    [0.48, "rgba(10, 10, 10, 0.05)"],
    [1, "rgba(10, 10, 10, 1)"],
  ]);
  if (caption) {
    drawAccentLine(ctx, 48, 850, 64, 5);
    drawWrappedText(ctx, caption, 48, 875, 900, {
      size: 31,
      weight: 700,
      lineHeight: 40,
      maxLines: 3,
    });
  }
}

function drawSplitPanel(ctx, x, y, color, label, body, stats) {
  const border = color === "red" ? "rgba(127, 29, 29, 0.55)" : "rgba(20, 83, 45, 0.55)";
  const fill = color === "red" ? "rgba(69, 10, 10, 0.32)" : "rgba(5, 46, 22, 0.32)";
  const accent = color === "red" ? "#f87171" : "#4ade80";
  drawRoundedRect(ctx, x, y, 900, 186, 24, fill, border);
  drawText(ctx, label.toUpperCase(), x + 28, y + 26, {
    size: 20,
    weight: 900,
    color: accent,
  });
  const bodyEnd = drawWrappedText(ctx, body, x + 28, y + 58, 820, {
    size: 29,
    weight: 600,
    color: "#e5e5e5",
    lineHeight: 36,
    maxLines: 2,
  });
  if (stats) {
    drawText(ctx, stats, x + 28, Math.min(bodyEnd + 16, y + 144), {
      size: 22,
      weight: 500,
      color: "#737373",
    });
  }
}

function drawSplitCard(ctx, recipe) {
  fillBackground(ctx);
  drawBrandStrip(ctx);
  drawAccentLine(ctx, 72, 246);
  drawText(ctx, "One cook, two plates", 72, 284, {
    size: 45,
    weight: 900,
  });
  const adult = recipe.splitCook?.adult;
  const kid = recipe.splitCook?.kid;
  if (adult) {
    drawSplitPanel(
      ctx,
      72,
      388,
      "red",
      "Adult",
      adult.label,
      adult.protein != null ? `${adult.protein}g protein · ~${adult.calories} cal` : "",
    );
  }
  if (kid) {
    drawSplitPanel(
      ctx,
      72,
      620,
      "green",
      "Kid",
      kid.label,
      kid.protein != null ? `${kid.protein}g protein · ~${kid.calories} cal` : "",
    );
  }
}

async function drawComponentCard(ctx, item, kind) {
  await drawOptionalImageCardBase(ctx, item.heroImage, [
    [0, "rgba(10, 10, 10, 0.20)"],
    [0.45, "rgba(10, 10, 10, 0.50)"],
    [1, "rgba(10, 10, 10, 1)"],
  ]);
  drawText(ctx, kind.toUpperCase(), 48, 778, {
    size: 20,
    weight: 900,
    color: "#fbbf24",
  });
  drawAccentLine(ctx, 48, 820);
  const endY = drawWrappedText(ctx, item.title, 48, 848, 900, {
    size: 50,
    weight: 900,
    lineHeight: 57,
    maxLines: 2,
  });
  if (item.tagline) {
    drawWrappedText(ctx, item.tagline, 48, endY + 16, 900, {
      size: 25,
      weight: 500,
      color: "#e5e5e5",
      lineHeight: 32,
      maxLines: 2,
    });
  }
}

function drawEndCard(ctx, recipe) {
  const gradient = ctx.createLinearGradient(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  gradient.addColorStop(0, "#0a0a0a");
  gradient.addColorStop(0.52, "#171717");
  gradient.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  drawBrandStrip(ctx);
  drawText(ctx, "THE SPLIT PLATE", EXPORT_SIZE / 2, 360, {
    size: 21,
    weight: 900,
    color: "rgba(245, 158, 11, 0.82)",
    align: "center",
  });
  drawAccentLine(ctx, 460, 422, 160, 8);
  drawWrappedText(ctx, recipe.title, EXPORT_SIZE / 2, 470, 820, {
    size: 48,
    weight: 900,
    lineHeight: 58,
    maxLines: 3,
    align: "center",
  });
  drawText(ctx, "Cook once. Split smart.", EXPORT_SIZE / 2, 680, {
    size: 29,
    weight: 800,
    color: "#fbbf24",
    align: "center",
  });
  drawText(ctx, "FULL RECIPE", EXPORT_SIZE / 2, 890, {
    size: 20,
    weight: 900,
    color: "#737373",
    align: "center",
  });
  drawText(ctx, "thesplitplate.com", EXPORT_SIZE / 2, 926, {
    size: 29,
    weight: 700,
    align: "center",
  });
  drawText(ctx, `/recipes/${recipe.slug}`, EXPORT_SIZE / 2, 966, {
    size: 20,
    weight: 500,
    color: "#737373",
    align: "center",
  });
}

async function renderSocialCardToBlob(card) {
  const { canvas, ctx } = makeCanvas();
  if (card.kind === "hero") await drawHeroCard(ctx, card.recipe);
  else if (card.kind === "macros") drawMacroCard(ctx, card.recipe);
  else if (card.kind === "process") await drawProcessCard(ctx, card.src, card.caption);
  else if (card.kind === "split") drawSplitCard(ctx, card.recipe);
  else if (card.kind === "component") await drawComponentCard(ctx, card.item, card.componentKind);
  else if (card.kind === "end") drawEndCard(ctx, card.recipe);
  else throw new Error(`Unknown social card kind: ${card.kind}`);
  return canvasToBlob(canvas);
}

function BrandStripTop() {
  return (
    <div className="absolute top-0 left-0 right-0 px-5 py-3 flex items-center justify-between z-20 pointer-events-none">
      <span className="text-amber-500/80 text-[10px] font-black tracking-[0.2em] uppercase">The Split Plate</span>
      <span className="text-neutral-500 text-[10px] tracking-wider">thesplitplate.com</span>
    </div>
  );
}

// Each downloadable card is 1080×1080 exported at 2x pixelRatio.
// In the browser we render at 540×540 for screen; the PNG saves at 1080.
function DownloadableCard({ children, card }) {
  const [busy, setBusy] = useState(false);

  async function exportCard() {
    setBusy(true);
    try {
      const blob = await renderSocialCardToBlob(card);
      const file = new File([blob], `${card.filename}.png`, { type: "image/png" });

      // Mobile-first: Web Share API → native share sheet → "Save to Photos" / IG / etc.
      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (e) {
          if (e.name === "AbortError") return; // user cancelled — don't fallback
          // fall through to download
        }
      }

      // Desktop fallback: classic download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${card.filename}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Card export failed:", e);
      alert("Export failed — check console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">{card.label}</span>
        <button
          onClick={exportCard}
          disabled={busy}
          className="text-amber-400 text-xs font-bold hover:underline cursor-pointer disabled:opacity-50"
        >
          {busy ? "Exporting…" : "Save image ↓"}
        </button>
      </div>
      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex flex-col" style={{ width: 540, height: 540 }}>
        {children}
      </div>
    </div>
  );
}

function HeroCardInner({ recipe }) {
  return (
    <>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/10" />
      <BrandStripTop />
      <div className="relative z-10 mt-auto p-6">
        <div className="w-12 h-1 bg-amber-400 mb-3" />
        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-lg">{recipe.title}</h1>
        <p className="text-amber-400 text-sm font-semibold mt-2">Cook once. Split smart.</p>
      </div>
    </>
  );
}

function MacroCardInner({ recipe }) {
  const m = recipe.meta?.macros || {};
  return (
    <div className="absolute inset-0 p-7 flex flex-col justify-center">
      <BrandStripTop />
      <div className="space-y-5">
        <div>
          <div className="w-12 h-1 bg-amber-400 mb-3" />
          <h2 className="text-white text-2xl font-black leading-tight">{recipe.title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-amber-400 text-3xl font-black">{m.protein || recipe.protein}g</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Protein</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-white text-3xl font-black">~{m.calories || recipe.calories}</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Calories</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-emerald-300 text-3xl font-black">{m.netCarbs != null ? m.netCarbs : m.carbs}g</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Net Carbs</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="text-white text-3xl font-black">{recipe.time}</div>
            <div className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total</div>
          </div>
        </div>
        {recipe.meta?.costPerServing && (
          <p className="text-center text-neutral-400 text-xs">{recipe.meta.costPerServing} per serving · {recipe.servings} servings</p>
        )}
      </div>
    </div>
  );
}

function ProcessImageCardInner({ src, caption }) {
  return (
    <>
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/30" />
      <BrandStripTop />
      {caption && (
        <div className="relative z-10 mt-auto p-6">
          <div className="w-8 h-0.5 bg-amber-400 mb-2" />
          <p className="text-white text-base font-semibold drop-shadow-lg">{caption}</p>
        </div>
      )}
    </>
  );
}

function SplitCardInner({ recipe }) {
  const adult = recipe.splitCook?.adult;
  const kid = recipe.splitCook?.kid;
  return (
    <div className="absolute inset-0 p-7 flex flex-col justify-center">
      <BrandStripTop />
      <div>
        <div className="w-12 h-1 bg-amber-400 mb-3" />
        <h2 className="text-white text-xl font-black mb-5">One cook, two plates</h2>
        <div className="space-y-3">
          {adult && (
            <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4">
              <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Adult</span>
              <p className="text-neutral-200 text-sm mt-1 leading-snug">{adult.label}</p>
              {adult.protein != null && (
                <p className="text-neutral-500 text-xs mt-2">{adult.protein}g protein · ~{adult.calories} cal</p>
              )}
            </div>
          )}
          {kid && (
            <div className="bg-green-950/30 border border-green-900/40 rounded-xl p-4">
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Kid</span>
              <p className="text-neutral-200 text-sm mt-1 leading-snug">{kid.label}</p>
              {kid.protein != null && (
                <p className="text-neutral-500 text-xs mt-2">{kid.protein}g protein · ~{kid.calories} cal</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentCardInner({ item, kind }) {
  return (
    <>
      {item.heroImage && (
        <img src={item.heroImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/20" />
      <BrandStripTop />
      <div className="relative z-10 mt-auto p-6">
        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">{kind}</span>
        <div className="w-12 h-1 bg-amber-400 mt-2 mb-2" />
        <h2 className="text-white text-2xl font-black leading-tight drop-shadow-lg">{item.title}</h2>
        {item.tagline && <p className="text-neutral-200 text-xs mt-2 drop-shadow leading-snug line-clamp-3">{item.tagline}</p>}
      </div>
    </>
  );
}

// Single clean end card — recipe URL + brand wordmark + tagline. No @ handles,
// no hashtags. Those live in the COPY-PASTE caption block at the top of the
// page. Carousel slot is too valuable for tag text — use it for more photos.
function EndCardInner({ recipe }) {
  return (
    <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <BrandStripTop />
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <span className="text-amber-500/80 text-[10px] font-black tracking-[0.4em] uppercase">The Split Plate</span>
        <div className="w-16 h-1 bg-amber-400 my-5" />
        <h2 className="text-white text-2xl font-black leading-tight">{recipe.title}</h2>
        <p className="text-amber-400 text-sm font-bold mt-4">Cook once. Split smart.</p>
      </div>
      <div className="text-center">
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Full recipe</p>
        <p className="text-white text-sm font-semibold mt-1">thesplitplate.com</p>
        <p className="text-neutral-500 text-[10px] mt-1 break-all">/recipes/{recipe.slug}</p>
      </div>
    </div>
  );
}

// Flatten ingredient list (handles string + {text, link} + comment headers like "--- ADULT ---")
function flattenIngredients(arr) {
  if (!arr) return [];
  return arr
    .map((item) => typeof item === "string" ? item : item?.text)
    .filter(Boolean)
    .filter((line) => !/^---/.test(line)); // drop section headers
}

function longCaption(recipe, components, platform = "tiktok") {
  const handles = brandHandles(recipe, platform);
  const tags = platform === "tiktok" ? tiktokHashtagsFor(recipe) : hashtagsFor(recipe);
  const lines = [];
  const m = recipe.meta?.macros || {};

  // HOOK — first line, the one that has to land in 1 sec
  lines.push(recipe.role || recipe.title);
  lines.push("");

  // QUICK STATS
  lines.push(`✓ ${m.protein || recipe.protein}g protein`);
  lines.push(`✓ ~${m.calories || recipe.calories} cal per serving`);
  if (m.netCarbs != null) lines.push(`✓ ~${m.netCarbs}g net carbs`);
  lines.push(`✓ ${recipe.time} · ${recipe.servings} servings`);
  lines.push(`✓ One cook, two plates (adult + kid)`);
  lines.push("");

  // SPLIT
  if (recipe.splitCook?.adult?.label || recipe.splitCook?.kid?.label) {
    lines.push("THE SPLIT");
    if (recipe.splitCook.adult?.label) lines.push(`👨‍🍳 Adult: ${recipe.splitCook.adult.label}`);
    if (recipe.splitCook.kid?.label) lines.push(`🧒 Kid: ${recipe.splitCook.kid.label}`);
    lines.push("");
  }

  // INGREDIENTS — pull shared + adult + kid distinctly
  const shared = flattenIngredients(recipe.splitCook?.sharedIngredients);
  const adult = flattenIngredients(recipe.splitCook?.adult?.extraIngredients);
  const kid = flattenIngredients(recipe.splitCook?.kid?.extraIngredients);
  const flat = flattenIngredients(recipe.ingredients);

  if (shared.length) {
    lines.push("INGREDIENTS (shared)");
    shared.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (adult.length) {
    lines.push("ADULT EXTRAS");
    adult.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (kid.length) {
    lines.push("KID EXTRAS");
    kid.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }
  if (!shared.length && flat.length) {
    lines.push("INGREDIENTS");
    flat.forEach((i) => lines.push(`• ${i}`));
    lines.push("");
  }

  // METHOD — first sentence of each step
  if (recipe.steps?.length) {
    lines.push("METHOD");
    recipe.steps.forEach((s, i) => {
      const first = (s.text || "").split(/[:.]/)[0].trim();
      if (first) lines.push(`${i + 1}. ${first}.`);
    });
    lines.push("");
  }

  // COMPONENTS (cross-linked sauces / sides)
  if (components.length) {
    lines.push("BUILT WITH");
    components.forEach((c) => lines.push(`• ${c.title} — thesplitplate.com/cookbook/${c.id}`));
    lines.push("");
  }

  // CTA
  lines.push(`Full recipe → thesplitplate.com/recipes/${recipe.slug}`);
  lines.push("");

  // BRAND TAGS
  if (handles.length) {
    lines.push(handles.join(" "));
    lines.push("");
  }

  // HASHTAGS
  lines.push(tags.join(" "));

  return lines.join("\n");
}

function classifyCookbook(item) {
  if (sauces.includes(item)) return "Sauce";
  if (bases.includes(item)) return "Side / Base";
  if (breakfasts.includes(item)) return "Breakfast";
  if (desserts.includes(item)) return "Dessert";
  if (quickLunches.includes(item)) return "Quick Lunch";
  return "Component";
}

export default function SocialPage() {
  const { slug } = useParams();
  const recipe = liveRecipes.find((r) => r.slug === slug);
  const [saveAllBusy, setSaveAllBusy] = useState(false);
  useMeta({ title: `Social Carousel — ${recipe?.title || "Not Found"}`, description: "Instagram carousel for screenshot + post." });

  if (!recipe) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
        <p>Recipe not found. Try <Link to="/dinners" className="text-amber-400">/dinners</Link>.</p>
      </div>
    );
  }

  // Pull up to 5 unique process images — gives us enough cards to fill a full
  // carousel without recycling text-heavy slots. De-duped by src.
  const seen = new Set();
  const processImages = (recipe.steps || [])
    .flatMap((s) => (s.images || []).map((img) => ({ src: img, caption: s.text.split(/[:.]/)[0].trim().slice(0, 60) })))
    .filter((p) => {
      if (!p.src || p.src === recipe.image || seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    })
    .slice(0, 5);

  const components = extractCookbookLinks(recipe);

  // Build the card sequence dynamically. Goal: photos > text. The carousel is
  // 1 hero + 1 macros + 1 split + N process + M components + 1 end = whatever
  // fits up to Instagram's 10-card max.
  const processCards = processImages.map((p, i) => ({
    id: `process-${i + 1}`,
    kind: "process",
    label: `Card · Process ${i + 1}`,
    filename: `${slug}-process-${i + 1}`,
    src: p.src,
    caption: p.caption,
    render: <ProcessImageCardInner src={p.src} caption={p.caption} />,
  }));
  const componentCards = components.map((c, i) => ({
    id: `component-${c.id}`,
    kind: "component",
    label: `Card · ${classifyCookbook(c)} → ${c.title}`,
    filename: `${slug}-component-${i + 1}-${c.id}`,
    item: c,
    componentKind: classifyCookbook(c),
    render: <ComponentCardInner item={c} kind={classifyCookbook(c)} />,
  }));
  // Interleave: hero → macros → process1 → split → components → process2..N → end
  const allCards = [
    { id: "hero", kind: "hero", label: "Card · Hero", filename: `${slug}-1-hero`, recipe, render: <HeroCardInner recipe={recipe} /> },
    { id: "macros", kind: "macros", label: "Card · Macros", filename: `${slug}-2-macros`, recipe, render: <MacroCardInner recipe={recipe} /> },
    ...(processCards[0] ? [processCards[0]] : []),
    { id: "split", kind: "split", label: "Card · Split", filename: `${slug}-split`, recipe, render: <SplitCardInner recipe={recipe} /> },
    ...componentCards,
    ...processCards.slice(1),
    { id: "end", kind: "end", label: "Card · End / Recipe Link", filename: `${slug}-end`, recipe, render: <EndCardInner recipe={recipe} /> },
  ];
  // Instagram carousel max = 10 cards. If we go over, drop the last process
  // images (preserve hero, macros, split, components, end).
  const cards = allCards.slice(0, 10);

  async function saveAll() {
    if (saveAllBusy) return;
    setSaveAllBusy(true);
    const files = [];
    try {
      for (const card of cards) {
        try {
          const blob = await renderSocialCardToBlob(card);
          files.push(new File([blob], `${card.filename}.png`, { type: "image/png" }));
        } catch (e) {
          console.error(`Failed export of ${card.id}:`, e);
        }
      }
      if (files.length === 0) {
        alert("No cards exported. Check console.");
        return;
      }

      // Mobile-first: try Web Share API with all files — iOS/Android opens share sheet
      // → "Save N Images" goes straight to Photos. Single user gesture.
      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files })) {
        try {
          await navigator.share({ files, title: `${recipe.title} carousel` });
          return;
        } catch (e) {
          if (e.name === "AbortError") return;
          // fall through to per-file download
        }
      }

      // Desktop fallback: trigger downloads sequentially with 400ms gaps
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.download = file.name;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      setSaveAllBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-white text-2xl font-black">Social Carousel</h1>
        <p className="text-neutral-400 text-sm mt-1">{recipe.title}</p>
        <p className="text-neutral-500 text-xs mt-2">{cards.length} cards · 1080×1080 each. <span className="text-amber-400">All photos + one clean end card. @ handles and hashtags live in the copy-paste captions below (TikTok / Instagram versions) — not on the card images.</span></p>
        <p className="text-neutral-600 text-[10px] mt-1">
          <span className="text-neutral-500">On phone:</span> tap "Save all" — your share sheet pops up, choose "Save {cards.length} Images" → all go to Photos.
          <br />
          <span className="text-neutral-500">On desktop:</span> tap "Save all" — {cards.length} PNGs download to your Downloads folder.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={saveAll}
            disabled={saveAllBusy}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {saveAllBusy ? "Exporting..." : `Save all ${cards.length} images`}
          </button>
          <Link to={`/recipes/${recipe.slug}`} className="text-amber-400 text-xs hover:underline">← Back to recipe</Link>
        </div>

        <details className="mt-4 bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-xs" open>
          <summary className="text-pink-400 cursor-pointer font-semibold">TikTok caption · long-form · TikTok @ handles · 5 hashtags</summary>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(longCaption(recipe, components, "tiktok"));
                alert("TikTok caption copied to clipboard.");
              }}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              Copy TikTok caption
            </button>
            <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-3 rounded border border-neutral-800 max-h-96 overflow-y-auto leading-relaxed">{longCaption(recipe, components, "tiktok")}</pre>
          </div>
        </details>

        <details className="mt-3 bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-xs" open>
          <summary className="text-orange-400 cursor-pointer font-semibold">Instagram caption · long-form · IG @ handles · full hashtag set</summary>
          <div className="mt-3 space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(longCaption(recipe, components, "ig"));
                alert("Instagram caption copied to clipboard.");
              }}
              className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400 cursor-pointer"
            >
              Copy Instagram caption
            </button>
            <pre className="text-neutral-200 whitespace-pre-wrap text-[11px] bg-neutral-950 p-3 rounded border border-neutral-800 max-h-96 overflow-y-auto leading-relaxed">{longCaption(recipe, components, "ig")}</pre>
          </div>
        </details>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {cards.map((card) => (
          <div key={card.id} data-card-id={card.id}>
            <DownloadableCard card={card}>
              <div data-export className="absolute inset-0 bg-neutral-950 flex flex-col">
                {card.render}
              </div>
            </DownloadableCard>
          </div>
        ))}
      </div>
    </div>
  );
}
