import { Link, useNavigate, useParams } from "react-router-dom";
import useMeta from "../hooks/useMeta";
import { trackOutboundClick } from "../hooks/useOutboundClick";
import { collections, products } from "../data/kitchen-essentials";
import recipes from "../data/recipes";
import { sauces, breakfasts, quickLunches, desserts, bases, powerups, snackBoxes } from "../data/cookbook";

const cookbookAll = [...sauces, ...breakfasts, ...quickLunches, ...desserts, ...bases, ...powerups, ...snackBoxes];

function resolveSource(sourceId) {
  if (!sourceId) return null;
  if (sourceId.startsWith("recipe:")) {
    const id = Number(sourceId.slice(7));
    const r = recipes.find((x) => x.id === id);
    return r ? { title: r.title, href: `/recipes/${r.slug}` } : null;
  }
  if (sourceId.startsWith("cookbook:")) {
    const slug = sourceId.slice(9);
    const c = cookbookAll.find((x) => x.id === slug);
    return c ? { title: c.title, href: `/cookbook/${c.id}` } : null;
  }
  return null;
}

function Badge({ children }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-wider bg-surface2 text-muted px-2 py-0.5 rounded">
      {children}
    </span>
  );
}

function ProductCard({ product, collection }) {
  const sources = (product.sourceRecipeIds || []).map(resolveSource).filter(Boolean);
  const extraCount = Math.max(0, sources.length - 2);
  const shown = sources.slice(0, 2);
  const isEditorial = product.productType === "editorial";
  const hasAmazon = !isEditorial && !!product.amazonUrl;
  const hasBrand = !isEditorial && !!product.brandUrl;
  const affiliateLabel = hasAmazon ? "affiliate link" : "non-affiliate";

  const handleClick = (retailer, url, position) => () => {
    trackOutboundClick({
      productId: product.id,
      collection: collection.slug,
      url: url,
      affiliateStatus: retailer === "amazon" ? "affiliate" : "non-affiliate",
      sourceRecipeId: product.sourceRecipeIds?.[0] || null,
      ctaPosition: position,
    });
  };

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden hover:border-brand/40 transition-all flex flex-col">
      {product.image ? (
        <div className="w-full h-48 bg-page flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={`${product.brand} ${product.name}`} className="w-full h-full object-contain p-3" loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-surface to-page border-b border-line flex flex-col items-center justify-center px-3">
          <span className="text-muted text-[10px] uppercase tracking-widest">{isEditorial ? "Editorial pick" : product.brand}</span>
          <span className="text-muted text-base font-bold text-center mt-2 leading-tight">{product.name}</span>
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-brand/80 text-[11px] uppercase tracking-wider font-black">{product.brand}</p>
          <h3 className="text-ink text-base font-bold mt-1 leading-tight">{product.name}</h3>
        </div>

        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </div>
        )}

        <p className="text-muted text-sm leading-relaxed">{product.why}</p>

        {product.bestFor && (
          <div className="text-sm leading-relaxed">
            <span className="text-muted font-bold">Best for: </span>
            <span className="text-muted">{product.bestFor}</span>
          </div>
        )}

        {product.whatToKnow && (
          <div className="text-sm leading-relaxed border-l-2 border-line pl-3">
            <span className="text-muted font-bold">What to know: </span>
            <span className="text-muted">{product.whatToKnow}</span>
          </div>
        )}

        {shown.length > 0 && (
          <div className="text-xs text-muted leading-relaxed">
            <span className="text-faint">Used in </span>
            {shown.map((s, i) => (
              <span key={s.href}>
                <Link to={s.href} className="text-muted hover:text-brand underline decoration-line hover:decoration-brand/60 transition-colors">
                  {s.title}
                </Link>
                {i < shown.length - 1 && <span>, </span>}
              </span>
            ))}
            {extraCount > 0 && <span className="text-faint"> + {extraCount} more</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-faint border-t border-line pt-3 mt-auto">
          <span>Last checked {product.lastLinkCheck}</span>
          <span className={hasAmazon ? "text-brand/70" : "text-muted"}>{affiliateLabel}</span>
        </div>

        {hasAmazon && (
          <a
            href={product.amazonUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick("amazon", product.amazonUrl, "product_card_amazon_primary")}
            className="text-center bg-brand hover:bg-brand text-brandink text-sm font-black px-3 py-2.5 rounded-lg transition-colors"
          >
            {product.amazonCtaLabel || "Buy on Amazon"} &rarr;
          </a>
        )}

        {hasBrand && (
          <a
            href={product.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick("brand", product.brandUrl, hasAmazon ? "product_card_brand_secondary" : "product_card_brand_primary")}
            className={
              hasAmazon
                ? "text-center text-muted hover:text-brand text-xs font-bold underline decoration-line hover:decoration-brand/60 transition-colors"
                : "text-center bg-brand hover:bg-brand text-brandink text-sm font-black px-3 py-2.5 rounded-lg transition-colors"
            }
          >
            {product.brandCtaLabel || `Shop at ${product.brand}`} {hasAmazon ? "" : "→"}
          </a>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { collectionSlug } = useParams();
  const navigate = useNavigate();

  const activeCollection = collections.find((c) => c.slug === collectionSlug) || collections[0];
  const setCollection = (slug) => {
    navigate(`/favorites/${slug}`);
  };

  useMeta({
    title: !collectionSlug ? "Favorites" : `${activeCollection.title} — Favorites`,
    description: `${activeCollection.title} — the kitchen tools, pantry staples, and brands we actually purchased, used, and would buy again. Curated favorites on The Split Plate.`,
    image: activeCollection.ogImage,
  });

  const activeProducts = activeCollection.productIds.map((id) => products[id]).filter(Boolean);

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-ink">Favorites</h1>
          <p className="text-muted text-base mt-2 leading-relaxed">
            Products that earned a permanent place in our kitchen.
          </p>
          <p className="text-muted text-sm mt-2 leading-relaxed">
            Every product here was purchased by us and used in real recipes on the site — not sponsored placements, not backfilled from a stock catalog.
          </p>
        </div>

        <div className="mb-6 bg-surface/60 border border-line rounded-lg px-4 py-3 text-sm text-muted leading-relaxed">
          <span className="text-ink font-bold">Disclosure:</span> Every product here was purchased and used in our kitchen. The primary "Buy on Amazon" links are affiliate links (Amazon Associates) — we may earn a small commission at no additional cost to you. Direct-to-brand links are currently non-affiliate. Affiliate availability never determines what appears here.
        </div>

        {collections.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setCollection(c.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCollection.id === c.id ? "bg-brand text-brandink" : "bg-surface2 text-muted hover:bg-line"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <p className="text-muted text-sm mb-6 leading-relaxed">{activeCollection.tagline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProducts.map((p) => (
            <ProductCard key={p.id} product={p} collection={activeCollection} />
          ))}
        </div>

        <div className="mt-12 text-center bg-surface/30 border border-line rounded-xl py-6 px-4">
          <p className="text-muted text-sm">See these in action:</p>
          <Link to="/" className="text-brand text-base font-bold hover:underline mt-1 inline-block">
            Go to This Week&apos;s Dinners &rarr;
          </Link>
          <p className="text-muted text-xs mt-1">Every dinner shows the brand + product we use, right in the ingredient list.</p>
        </div>
      </div>
    </div>
  );
}
