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
    <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
      {children}
    </span>
  );
}

function ProductCard({ product, collection }) {
  const sources = (product.sourceRecipeIds || []).map(resolveSource).filter(Boolean);
  const extraCount = Math.max(0, sources.length - 2);
  const shown = sources.slice(0, 2);
  const isEditorial = product.productType === "editorial";
  const primaryCta = product.ctaLabel || (product.url ? `Shop at ${product.brand}` : null);
  const affiliateLabel = product.affiliateStatus === "affiliate" ? "affiliate link" : "non-affiliate";

  const handleClick = () => {
    trackOutboundClick({
      productId: product.id,
      collection: collection.slug,
      url: product.url,
      affiliateStatus: product.affiliateStatus,
      sourceRecipeId: product.sourceRecipeIds?.[0] || null,
      ctaPosition: "product_card_primary",
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col">
      {product.image ? (
        <div className="w-full h-48 bg-neutral-950 flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={`${product.brand} ${product.name}`} className="w-full h-full object-contain p-3" loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-neutral-900 to-neutral-950 border-b border-neutral-800 flex flex-col items-center justify-center px-3">
          <span className="text-neutral-500 text-[10px] uppercase tracking-widest">{isEditorial ? "Editorial pick" : product.brand}</span>
          <span className="text-neutral-300 text-base font-bold text-center mt-2 leading-tight">{product.name}</span>
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-amber-500/80 text-[11px] uppercase tracking-wider font-black">{product.brand}</p>
          <h3 className="text-white text-base font-bold mt-1 leading-tight">{product.name}</h3>
        </div>

        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </div>
        )}

        <p className="text-neutral-300 text-sm leading-relaxed">{product.why}</p>

        {product.bestFor && (
          <div className="text-sm leading-relaxed">
            <span className="text-neutral-500 font-bold">Best for: </span>
            <span className="text-neutral-300">{product.bestFor}</span>
          </div>
        )}

        {product.whatToKnow && (
          <div className="text-sm leading-relaxed border-l-2 border-neutral-700 pl-3">
            <span className="text-neutral-500 font-bold">What to know: </span>
            <span className="text-neutral-400">{product.whatToKnow}</span>
          </div>
        )}

        {shown.length > 0 && (
          <div className="text-xs text-neutral-500 leading-relaxed">
            <span className="text-neutral-600">Used in </span>
            {shown.map((s, i) => (
              <span key={s.href}>
                <Link to={s.href} className="text-neutral-300 hover:text-amber-400 underline decoration-neutral-700 hover:decoration-amber-500/60 transition-colors">
                  {s.title}
                </Link>
                {i < shown.length - 1 && <span>, </span>}
              </span>
            ))}
            {extraCount > 0 && <span className="text-neutral-600"> + {extraCount} more</span>}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-neutral-600 border-t border-neutral-800 pt-3 mt-auto">
          <span>Last checked {product.lastLinkCheck}</span>
          <span className={product.affiliateStatus === "affiliate" ? "text-amber-500/70" : "text-neutral-500"}>{affiliateLabel}</span>
        </div>

        {!isEditorial && product.url && primaryCta && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="text-center bg-amber-500 hover:bg-amber-400 text-black text-sm font-black px-3 py-2.5 rounded-lg transition-colors"
          >
            {primaryCta} &rarr;
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white">Favorites</h1>
          <p className="text-neutral-300 text-base mt-2 leading-relaxed">
            Products that earned a permanent place in our kitchen.
          </p>
          <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
            Every product here was purchased by us and used in real recipes on the site — not sponsored placements, not backfilled from a stock catalog.
          </p>
        </div>

        <div className="mb-6 bg-neutral-900/60 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-300 leading-relaxed">
          <span className="text-white font-bold">Disclosure:</span> Every product here was purchased by us and used in our kitchen. Nothing is sponsored, and the current product links are non-affiliate. Products only make this page if we would buy them again.
        </div>

        {collections.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setCollection(c.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCollection.id === c.id ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">{activeCollection.tagline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProducts.map((p) => (
            <ProductCard key={p.id} product={p} collection={activeCollection} />
          ))}
        </div>

        <div className="mt-12 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-6 px-4">
          <p className="text-neutral-400 text-sm">See these in action:</p>
          <Link to="/" className="text-amber-400 text-base font-bold hover:underline mt-1 inline-block">
            Go to This Week&apos;s Dinners &rarr;
          </Link>
          <p className="text-neutral-500 text-xs mt-1">Every dinner shows the brand + product we use, right in the ingredient list.</p>
        </div>
      </div>
    </div>
  );
}
