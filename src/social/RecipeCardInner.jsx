// DOM preview for a dark visual-first recipe card. Mirrors
// drawRecipeCard(ctx, layout) in ./recipeCard.js — same theme, same
// metrics, same 58/42 grid, same alternating imageSide — so canvas export
// and on-screen preview cannot drift.
//
// Screen renders at 540x540; canvas exports at 1080x1080. All metrics
// scale by S = 0.5 for DOM.

import {
  RECIPE_CARD_METRICS,
  RECIPE_CARD_THEME,
  accentColorFor,
  flattenIngredientItems,
  flattenMethodItems,
} from "./recipeCard";

const T = RECIPE_CARD_THEME;
const P = RECIPE_CARD_METRICS;
const SCREEN = 540;
const S = SCREEN / P.width;

const FONT_SANS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif';

export default function RecipeCardInner({ layout }) {
  const imageOnLeft = layout.imageSide === "left";
  const cols = imageOnLeft
    ? `${P.photoWidth * S}px ${P.contentWidth * S}px`
    : `${P.contentWidth * S}px ${P.photoWidth * S}px`;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: T.background,
        color: T.text,
        display: "grid",
        gridTemplateColumns: cols,
      }}
    >
      {imageOnLeft && <RecipeImage layout={layout} imageOnLeft />}
      <RecipeContent layout={layout} imageOnLeft={imageOnLeft} />
      {!imageOnLeft && <RecipeImage layout={layout} />}
    </div>
  );
}

function RecipeImage({ layout, imageOnLeft }) {
  const seamW = P.seamGradientWidth * S;
  const gradient = imageOnLeft
    ? `linear-gradient(to left, ${T.background}, rgba(17,17,15,0))`
    : `linear-gradient(to right, ${T.background}, rgba(17,17,15,0))`;

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {layout.image ? (
        <img
          src={layout.image}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: T.surface }} />
      )}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: `${seamW}px`,
          background: gradient,
          [imageOnLeft ? "right" : "left"]: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function RecipeContent({ layout }) {
  const pad = P.contentMargin * S;
  return (
    <div
      style={{
        position: "relative",
        padding: `${(P.contentMargin + 22) * S}px ${pad}px ${P.footerBottomInset * S}px`,
      }}
    >
      <Header layout={layout} />
      <Divider />
      <div style={{ marginTop: `${P.dividerGap * S}px` }}>
        {layout.kind === "recipe-method" ? (
          <MethodList layout={layout} />
        ) : (
          <IngredientList layout={layout} />
        )}
      </div>
      <Footer layout={layout} />
    </div>
  );
}

function Header({ layout }) {
  return (
    <>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: `${P.labelSize * S}px`,
          letterSpacing: `${P.labelLetterSpacing * S}px`,
          textTransform: "uppercase",
          color: T.amber,
        }}
      >
        {layout.label || ""}
      </div>
      <div
        style={{
          marginTop: `${P.labelGap * S}px`,
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: `${P.titleSize * S}px`,
          lineHeight: `${P.titleLineHeight * S}px`,
          color: T.text,
        }}
      >
        {layout.recipeName}
      </div>
    </>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{
        marginTop: `${P.titleGap * S}px`,
        width: `${P.dividerWidth * S}px`,
        height: `${P.dividerHeight * S}px`,
        background: T.amber,
      }}
    />
  );
}

function IngredientList({ layout }) {
  const items = flattenIngredientItems(layout);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: `${P.ingredientRowGap * S}px` }}>
      {items.map((it, i) => (
        <IngredientRow key={i} item={it} />
      ))}
    </div>
  );
}

function IngredientRow({ item }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${P.quantityColumnWidth * S}px 1fr`,
        columnGap: `${P.quantityGutter * S}px`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 800,
          fontSize: `${P.ingredientQuantitySize * S}px`,
          lineHeight: `${P.ingredientLineHeight * S}px`,
          color: accentColorFor(item.accent),
        }}
      >
        {item.quantity}
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: `${P.ingredientTextSize * S}px`,
            lineHeight: `${P.ingredientLineHeight * S}px`,
            color: T.text,
          }}
        >
          {item.text}
        </div>
        {item.note && (
          <div
            style={{
              marginTop: `${4 * S}px`,
              fontFamily: FONT_SANS,
              fontWeight: 500,
              fontSize: `${P.ingredientNoteSize * S}px`,
              lineHeight: `${P.ingredientNoteLineHeight * S}px`,
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

function MethodList({ layout }) {
  const items = flattenMethodItems(layout);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: `${P.methodItemGap * S}px` }}>
      {items.map((it, i) => (
        <MethodRow key={i} item={it} />
      ))}
    </div>
  );
}

function MethodRow({ item }) {
  const nn = String(item.number ?? "").padStart(2, "0");
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${P.stepNumberColumnWidth * S}px 1fr`,
        columnGap: `${P.stepColumnGap * S}px`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 900,
          fontSize: `${P.stepNumberSize * S}px`,
          lineHeight: 1,
          color: accentColorFor(item.accent),
        }}
      >
        {nn}
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontWeight: 800,
            fontSize: `${P.stepHeadingSize * S}px`,
            letterSpacing: `${P.stepHeadingLetterSpacing * S}px`,
            textTransform: "uppercase",
            color: T.text,
            marginTop: `${8 * S}px`,
          }}
        >
          {item.heading}
        </div>
        <div
          style={{
            marginTop: `${16 * S}px`,
            fontFamily: FONT_SANS,
            fontWeight: 500,
            fontSize: `${P.stepBodySize * S}px`,
            lineHeight: `${P.stepBodyLineHeight * S}px`,
            color: T.muted,
          }}
        >
          {item.body}
        </div>
      </div>
    </div>
  );
}

function Footer({ layout }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${P.contentMargin * S}px`,
        right: `${P.contentMargin * S}px`,
        bottom: `${P.footerBottomInset * S}px`,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: FONT_SANS,
        fontWeight: 500,
        fontSize: `${P.footerSize * S}px`,
        color: T.muted,
      }}
    >
      <span>{layout.footer || "thesplitplate.com"}</span>
      <span>{layout.index}/{layout.total}</span>
    </div>
  );
}
