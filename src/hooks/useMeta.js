import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "The Split Plate";
const BASE_DESC = "One meal. Two plates. High-protein family dinners using the Split Cook Method.";
const DOMAIN = "https://thesplitplate.com";

// Google truncates meta descriptions at ~155-160 chars on SERP; OG previews
// truncate ~200. Cap at 155 with smart boundary (sentence > word > hard cut).
// Callers that already provide pre-truncated copy via a `seoDescription` field
// can pass that as `description` — no extra trim happens if input is short.
function truncateDescription(s, max = 155) {
  if (!s || s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastPeriod = slice.lastIndexOf(". ");
  if (lastPeriod > max * 0.55) return slice.slice(0, lastPeriod + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

// Idempotent — strips trailing brand suffix if a caller accidentally appends
// "— The Split Plate" (the hook adds it once below). Fixes the double-brand
// bug seen on /leftovers ("Use Up Leftover Ingredients — The Split Plate — The Split Plate").
function stripBrandSuffix(t) {
  if (!t) return t;
  return t.replace(new RegExp(`\\s*[—-]\\s*${BASE_TITLE}\\s*$`), "").trim();
}

export default function useMeta({ title, description, image, type } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanTitle = stripBrandSuffix(title);
    const fullTitle = cleanTitle ? `${cleanTitle} — ${BASE_TITLE}` : `${BASE_TITLE} — One Meal. Two Plates.`;
    const desc = truncateDescription(description || BASE_DESC);
    const url = `${DOMAIN}${pathname}`;
    const ogType = type || (pathname.startsWith("/recipes") || pathname.startsWith("/cookbook/") ? "article" : "website");

    document.title = fullTitle;

    const setMeta = (property, content) => {
      const attr = property.startsWith("og:") || property.startsWith("twitter:") ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:type", ogType);
    setMeta("og:url", url);
    setMeta("og:site_name", BASE_TITLE);
    setMeta("twitter:card", "summary_large_image");
    if (image) setMeta("og:image", image.startsWith("http") ? image : `${DOMAIN}${image}`);
    setLink("canonical", url);

    return () => { document.title = `${BASE_TITLE} — One Meal. Two Plates.`; };
  }, [title, description, image, type, pathname]);
}
