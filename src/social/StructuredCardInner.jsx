// DOM preview for a structured social card.
//
// Consumes the exact same Layout object as `drawStructuredCard(ctx, layout)`
// in ./structuredCard.js — that is the WHOLE POINT of this module: on-screen
// preview and PNG export cannot drift, because both are driven by one
// normalized layout description.
//
// Screen size is 540×540 (half the 1080×1080 export). All measurements in
// the layout are canvas-pixels; this component multiplies by S = 0.5 to
// scale into DOM.

import { ACCENTS, EXPORT_SIZE, PHOTO_STRIP_HEIGHTS, SAFE_MARGIN } from "./structuredCard";

const SCREEN = 540;
const S = SCREEN / EXPORT_SIZE;

function primaryFor(kind, item) {
  if (kind === "ingredients") {
    return { quantity: item.quantity || "", ingredient: item.ingredient || "" };
  }
  if (kind === "method") {
    return { quantity: `${item.step}.`, ingredient: item.text || "" };
  }
  return { quantity: "", ingredient: item.text || String(item) };
}

function secondaryFor(kind, item) {
  if (kind === "ingredients") return item.note || null;
  return null;
}

export default function StructuredCardInner({ layout }) {
  const stripH = (layout.photoStripHeight || PHOTO_STRIP_HEIGHTS[layout.kind] || 240) * S;
  const marginPx = SAFE_MARGIN * S;
  const accentFor = (name) => (ACCENTS[name] || ACCENTS.neutral).text;

  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden text-white">
      {layout.photoSrc && (
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: stripH }}>
          <img
            src={layout.photoSrc}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 30 * S,
              background: "linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,1) 100%)",
            }}
          />
        </div>
      )}

      {/* Running header + counter float on top of the photo strip */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between"
        style={{ padding: `${20 * S}px ${marginPx}px 0` }}
      >
        <span
          className="uppercase tracking-wider font-semibold truncate"
          style={{ fontSize: `${22 * S}px`, color: "rgba(245,245,245,0.92)", maxWidth: "70%" }}
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

      {/* Body */}
      <div
        className="absolute inset-x-0"
        style={{ top: stripH + 48 * S, padding: `0 ${marginPx}px` }}
      >
        {(layout.blocks || []).map((block, bi) => (
          <div key={bi} style={{ marginBottom: 24 * S }}>
            <div
              className="uppercase tracking-wider font-black"
              style={{
                fontSize: `${22 * S}px`,
                color: accentFor(block.accent),
                marginBottom: 14 * S,
              }}
            >
              {block.heading}
            </div>
            {(block.items || []).map((item, ii) => {
              const p = primaryFor(layout.kind, item);
              const secondary = secondaryFor(layout.kind, item);
              return (
                <div key={ii} style={{ marginBottom: 10 * S }}>
                  <div
                    style={{
                      fontSize: `${30 * S}px`,
                      lineHeight: 1.32,
                      color: "#f5f5f5",
                    }}
                  >
                    {p.quantity ? (
                      <>
                        <span style={{ fontWeight: 800 }}>{p.quantity}</span>
                        <span>&nbsp;&nbsp;</span>
                      </>
                    ) : null}
                    <span style={{ fontWeight: 500 }}>{p.ingredient}</span>
                  </div>
                  {secondary && (
                    <div
                      style={{
                        fontSize: `${24 * S}px`,
                        lineHeight: 1.32,
                        fontWeight: 500,
                        color: "#a3a3a3",
                        marginTop: 2 * S,
                      }}
                    >
                      {secondary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer (optional URL / engagement question) */}
      {layout.footerText && (
        <div
          className="absolute inset-x-0 bottom-0 text-center"
          style={{
            padding: `${20 * S}px ${marginPx}px`,
            color: "#a3a3a3",
            fontSize: `${22 * S}px`,
            fontWeight: 600,
          }}
        >
          {layout.footerText}
        </div>
      )}
    </div>
  );
}
