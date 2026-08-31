/**
 * Responsive card thumbnails.
 *
 * Card grids were loading the full-size hero for every tile — 2048px, 545-615KB
 * webp files rendered into a 192px-tall box. Across the card-image set that was
 * 85 MB of source for roughly 7 MB of useful pixels.
 *
 * `scripts/gen-thumbs.mjs` emits a 640px `-sm.webp` next to each card image and
 * records the mapping in src/data/thumbs.json. This helper reads that manifest
 * so we only ever emit a srcSet for a thumb that actually exists on disk — a
 * derived-by-string-munging path would 404 for any image the generator skipped.
 *
 * Re-run `node scripts/gen-thumbs.mjs` after adding a recipe or cookbook entry.
 */
import thumbs from "../data/thumbs.json";

/**
 * Props for an <img> in a card grid. Spread onto the element.
 *
 * `sizes` should describe the rendered width at each breakpoint. The default
 * matches the 3-up-on-desktop / 1-up-on-mobile grids the cards live in; pass
 * an override for a denser grid.
 */
export default function cardImage(src, { sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" } = {}) {
  if (!src) return {};
  const thumb = thumbs[src];
  if (!thumb) return { src };
  return {
    src,
    srcSet: `${thumb} 640w, ${src} 2048w`,
    sizes,
  };
}
