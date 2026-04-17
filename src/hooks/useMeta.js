import { useEffect } from "react";

const BASE_TITLE = "The Split Plate";
const BASE_DESC = "One meal. Two plates. High-protein family dinners using the Split Cook Method.";

export default function useMeta({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${BASE_TITLE}` : `${BASE_TITLE} — One Meal. Two Plates.`;
    const desc = description || BASE_DESC;

    document.title = fullTitle;

    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:type", "website");
    if (image) setMeta("og:image", image);

    return () => { document.title = `${BASE_TITLE} — One Meal. Two Plates.`; };
  }, [title, description, image]);
}
