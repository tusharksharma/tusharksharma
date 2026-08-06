/* eslint-disable react-refresh/only-export-components */
// End card — the final "Save this recipe" + URL + engagement-question card.
//
// Same "one Layout, two renderers" contract. Layout shape:
//   {
//     kind: "end",
//     index, total,
//     recipeName: string,
//     recipeUrl: string,             // e.g. "thesplitplate.com/recipes/indo-chinese-chili-chicken"
//     engagementQuestion?: string,
//   }

import { EXPORT_SIZE, SAFE_MARGIN, drawWrapped, font } from "./structuredCard";

export function drawStructuredEnd(ctx, layout) {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  // Counter top-right
  ctx.font = font(900, 22);
  ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
  ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText(`${layout.index} / ${layout.total}`, EXPORT_SIZE - SAFE_MARGIN, 40);

  // Brand strip top-left
  ctx.font = font(700, 22);
  ctx.fillStyle = "rgba(245, 245, 245, 0.9)";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(String(layout.recipeName || "").toUpperCase(), SAFE_MARGIN, 40);

  const centerX = EXPORT_SIZE / 2;
  const contentWidth = EXPORT_SIZE - SAFE_MARGIN * 2;

  // "SAVE THIS RECIPE" label
  ctx.font = font(900, 24);
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("SAVE THIS RECIPE", centerX, 260);

  // Recipe name (big)
  drawWrapped(ctx, layout.recipeName || "", SAFE_MARGIN, 320, contentWidth, {
    size: 56, weight: 900, color: "#ffffff", lineHeight: 66, maxLines: 3,
  });

  // Read-the-full-recipe URL — center-aligned, wraps if long
  ctx.textAlign = "center";
  const urlLines = wrapCentered(ctx, layout.recipeUrl || "", contentWidth, { size: 34, weight: 700 });
  let urlY = 540;
  urlLines.forEach((line, i) => {
    ctx.font = font(700, 34);
    ctx.fillStyle = "#f5f5f5";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(line, centerX, urlY + i * 46);
  });

  // Engagement question (optional)
  if (layout.engagementQuestion) {
    const qY = urlY + urlLines.length * 46 + 48;
    ctx.fillStyle = "#a3a3a3";
    ctx.textAlign = "center";
    drawWrappedCentered(ctx, layout.engagementQuestion, centerX, qY, contentWidth, {
      size: 28, weight: 500, color: "#a3a3a3", lineHeight: 40, maxLines: 3,
    });
  }

  // Bottom brand
  ctx.font = font(900, 22);
  ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText("THE SPLIT PLATE", centerX, EXPORT_SIZE - 96);
  ctx.font = font(500, 22);
  ctx.fillStyle = "#a3a3a3";
  ctx.fillText("Cook once. Split smart.", centerX, EXPORT_SIZE - 60);
}

function wrapCentered(ctx, text, maxWidth, { size, weight }) {
  ctx.font = font(weight, size);
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !line) line = next;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedCentered(ctx, text, cx, y, maxWidth, { size, weight, color, lineHeight, maxLines }) {
  ctx.font = font(weight, size);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const lines = wrapCentered(ctx, text, maxWidth, { size, weight }).slice(0, maxLines);
  lines.forEach((line, i) => ctx.fillText(line, cx, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

// ---------- DOM PREVIEW ----------

const SCREEN = 540;
const S = SCREEN / EXPORT_SIZE;

export function EndStructuredInner({ layout }) {
  const marginPx = SAFE_MARGIN * S;
  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden text-white flex flex-col">
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between"
        style={{ padding: `${20 * S}px ${marginPx}px 0` }}
      >
        <span
          className="uppercase tracking-wider font-semibold truncate"
          style={{ fontSize: `${22 * S}px`, color: "rgba(245,245,245,0.9)", maxWidth: "70%" }}
        >
          {layout.recipeName}
        </span>
        <span
          className="font-black shrink-0"
          style={{ fontSize: `${22 * S}px`, color: "rgba(245,158,11,0.95)" }}
        >
          {layout.index} / {layout.total}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: `0 ${marginPx}px` }}>
        <div
          className="uppercase tracking-wider font-black"
          style={{ fontSize: `${24 * S}px`, color: "#fbbf24", marginBottom: 20 * S }}
        >
          Save this recipe
        </div>
        <div
          className="font-black leading-tight"
          style={{ fontSize: `${56 * S}px`, color: "#ffffff", marginBottom: 28 * S }}
        >
          {layout.recipeName}
        </div>
        <div
          className="font-bold break-all"
          style={{ fontSize: `${34 * S}px`, color: "#f5f5f5", marginBottom: 24 * S }}
        >
          {layout.recipeUrl}
        </div>
        {layout.engagementQuestion && (
          <div
            style={{ fontSize: `${28 * S}px`, color: "#a3a3a3", fontWeight: 500, lineHeight: 1.4, maxWidth: `${820 * S}px` }}
          >
            {layout.engagementQuestion}
          </div>
        )}
      </div>

      <div className="text-center" style={{ paddingBottom: 48 * S }}>
        <div
          className="font-black"
          style={{ fontSize: `${22 * S}px`, color: "rgba(245,158,11,0.85)" }}
        >
          THE SPLIT PLATE
        </div>
        <div
          style={{ fontSize: `${22 * S}px`, color: "#a3a3a3", fontWeight: 500, marginTop: 6 * S }}
        >
          Cook once. Split smart.
        </div>
      </div>
    </div>
  );
}

export function buildEndLayout(recipe, curated, { index, total, isCookbook, slug }) {
  const resolvedSlug = recipe.id || slug || recipe.slug;
  const path = isCookbook ? `cookbook/${resolvedSlug}` : `recipes/${resolvedSlug}`;
  return {
    kind: "end",
    index, total,
    recipeName: recipe.title || "",
    recipeUrl: `thesplitplate.com/${path}`,
    engagementQuestion: curated?.engagementQuestion || null,
  };
}
