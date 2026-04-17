import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "The Split Plate";
const BASE_DESC = "One meal. Two plates. High-protein family dinners using the Split Cook Method.";
const DOMAIN = "https://thesplitplate.com";

export default function useMeta({ title, description, image, type } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — One Meal. Two Plates.`;
    const desc = description || BASE_DESC;
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
