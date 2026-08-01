// Wires an outbound product-click event into GA4 (gtag config lives in
// index.html). Every click on a /favorites CTA fires an `outbound_click`
// event with the fields spec'd in the handoff:
//   product_id, collection, retailer, affiliate_status, source_recipe,
//   cta_position, url.
//
// gtag isn't guaranteed to exist (adblock, no-consent). Guarded so a
// missing gtag never breaks the click.

export function trackOutboundClick({ productId, collection, url, affiliateStatus, sourceRecipeId, ctaPosition }) {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const retailer = extractRetailer(url);
    window.gtag("event", "outbound_click", {
      product_id: productId,
      collection: collection,
      retailer: retailer,
      affiliate_status: affiliateStatus || "non-affiliate",
      source_recipe: sourceRecipeId || null,
      cta_position: ctaPosition || "product_card",
      url: url,
      transport_type: "beacon",
    });
  } catch {
    // never throw from analytics
  }
}

function extractRetailer(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "unknown";
  }
}
