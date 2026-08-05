// DOM preview for a printed recipe card (kinds: recipe-ingredients, recipe-method).
//
// Mirrors drawRecipeCard(ctx, layout) in ./recipeCard.js — same theme, same
// metrics, same column layout — so canvas export and on-screen preview
// cannot drift.
//
// Screen is rendered at 540×540; canvas exports at 1080×1080. All metrics
// from RECIPE_CARD_METRICS are scaled by S = 0.5 for DOM.

import { RECIPE_CARD_METRICS, RECIPE_CARD_THEME, accentColorFor } from "./recipeCard";

const T = RECIPE_CARD_THEME;
const P = RECIPE_CARD_METRICS;
const SCREEN = 540;
const S = SCREEN / P.width;

const FONT_SANS = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const FONT_SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

export default function RecipeCardInner({ layout }) {
  const meta = layout.meta || {};
  const metaBits = [
    meta.servings ? `${meta.servings} servings` : null,
    meta.time || null,
    meta.calories ? `${meta.calories} cal` : null,
    meta.protein ? `${meta.protein} protein` : null,
  ].filter(Boolean);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: T.paper, color: T.ink }}
    >
      {/* Double border */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 24 * S, left: 24 * S, right: 24 * S, bottom: 24 * S,
          border: `${3 * S}px solid ${T.ink}`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 30 * S, left: 30 * S, right: 30 * S, bottom: 30 * S,
          border: `${1 * S}px solid ${T.amber}`,
          pointerEvents: "none",
        }}
      />

      <div style={{ padding: `${P.margin * S}px ${P.margin * S}px ${P.footerBottomInset * S}px` }}>
        {/* Brand + counter */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 800,
              fontSize: `${P.footerSize * S}px`,
              letterSpacing: `${3 * S}px`,
              color: T.amber,
            }}
          >
            THE SPLIT PLATE
          </span>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: `${P.footerSize * S}px`,
              color: T.muted,
            }}
          >
            {layout.index} / {layout.total}
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginTop: P.headerGap * S,
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: `${P.sectionSize * S}px`,
            letterSpacing: `${2 * S}px`,
            color: T.muted,
            textTransform: "uppercase",
          }}
        >
          {layout.eyebrow}
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: P.titleGap * S,
            fontFamily: FONT_SERIF,
            fontWeight: 900,
            fontSize: `${P.titleSize * S}px`,
            lineHeight: 1.05,
            color: T.ink,
          }}
        >
          {layout.recipeName}
        </div>

        {/* Meta chip row */}
        <div
          style={{
            marginTop: P.metaGap * S,
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: `${P.footerSize * S}px`,
            color: T.muted,
          }}
        >
          {metaBits.join("  ·  ")}
        </div>

        {/* Amber divider */}
        <div
          aria-hidden
          style={{
            marginTop: P.ruleGap * S,
            height: `${2 * S}px`,
            background: T.amber,
          }}
        />

        {/* Body columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: `${P.columnGap * S}px`,
            marginTop: P.bodyGap * S,
          }}
        >
          {(layout.columns || []).map((col, i) => (
            <Column key={i} col={col} kind={layout.kind} />
          ))}
        </div>
      </div>

      {/* Footer URL (bottom-left, aligned with card margin) */}
      <div
        style={{
          position: "absolute",
          left: P.margin * S,
          bottom: P.footerBottomInset * S,
          fontFamily: FONT_SANS,
          fontWeight: 500,
          fontSize: `${P.footerSize * S}px`,
          color: T.muted,
        }}
      >
        {layout.footer || "thesplitplate.com"}
      </div>
    </div>
  );
}

function Column({ col, kind }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: `${P.sectionGap * S}px` }}>
      {(col.sections || []).map((section, i) => (
        <Section key={i} section={section} kind={kind} />
      ))}
    </div>
  );
}

function Section({ section, kind }) {
  const accent = accentColorFor(section.accent);
  return (
    <div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: `${P.sectionSize * S}px`,
          letterSpacing: `${2 * S}px`,
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {section.continued ? `${section.heading} (cont.)` : section.heading}
      </div>
      <div
        style={{
          marginTop: `${6 * S}px`,
          height: `${1.5 * S}px`,
          width: `${Math.min(120, 120) * S}px`,
          background: accent,
        }}
      />
      <div style={{ marginTop: `${12 * S}px`, display: "flex", flexDirection: "column", gap: `${P.itemGap * S}px` }}>
        {(section.items || []).map((item, i) =>
          kind === "recipe-method" ? (
            <MethodItem key={i} item={item} />
          ) : (
            <IngredientItem key={i} item={item} />
          )
        )}
      </div>
    </div>
  );
}

function IngredientItem({ item }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${(P.quantityColumnWidth) * S}px 1fr`, columnGap: `${P.quantityGutter * S}px` }}>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: `${P.bodySize * S}px`,
          lineHeight: `${P.bodyLineHeight * S}px`,
          color: T.ink,
        }}
      >
        {item.quantity || ""}
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: `${P.bodySize * S}px`,
            lineHeight: `${P.bodyLineHeight * S}px`,
            color: T.ink,
          }}
        >
          {item.text || item.ingredient}
        </div>
        {item.note && (
          <div
            style={{
              marginTop: `${4 * S}px`,
              fontFamily: FONT_SANS,
              fontWeight: 500,
              fontSize: `${P.noteSize * S}px`,
              lineHeight: `${P.noteLineHeight * S}px`,
              color: T.muted,
            }}
          >
            {item.note}
          </div>
        )}
      </div>
    </div>
  );
}

function MethodItem({ item }) {
  return (
    <div>
      {item.callout && (
        <div
          style={{
            display: "inline-block",
            marginBottom: `${8 * S}px`,
            padding: `${4 * S}px ${12 * S}px`,
            borderRadius: `${8 * S}px`,
            background: T.coralSoft,
            color: T.coral,
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: `${P.noteSize * S}px`,
            letterSpacing: `${2 * S}px`,
            textTransform: "uppercase",
          }}
        >
          {item.callout}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `${P.numberColumnWidth * S}px 1fr`, columnGap: `${P.numberGutter * S}px` }}>
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontWeight: 900,
            fontSize: `${P.bodySize * S}px`,
            lineHeight: `${P.bodyLineHeight * S}px`,
            color: T.amber,
          }}
        >
          {(item.number ?? item.step ?? "")}.
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: `${P.bodySize * S}px`,
            lineHeight: `${P.bodyLineHeight * S}px`,
            color: T.ink,
          }}
        >
          {item.text}
        </div>
      </div>
    </div>
  );
}
