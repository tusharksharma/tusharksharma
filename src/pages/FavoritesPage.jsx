import { Link, useSearchParams } from "react-router-dom";
import useMeta from "../hooks/useMeta";
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

function ProductCard({ product }) {
  const sources = (product.sourceRecipeIds || []).map(resolveSource).filter(Boolean);
  const extraCount = Math.max(0, sources.length - 2);
  const shown = sources.slice(0, 2);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col">
      {product.image ? (
        <div className="w-full h-40 bg-neutral-950 flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={`${product.brand} ${product.name}`} className="w-full h-full object-contain p-2" loading="lazy" />
        </div>
      ) : (
        <div className="w-full h-40 bg-neutral-950 border-b border-neutral-800 flex items-center justify-center">
          <span className="text-neutral-700 text-xs uppercase tracking-wider">{product.brand}</span>
        </div>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold">{product.brand}</p>
          <h3 className="text-white text-sm font-bold mt-0.5 leading-tight">{product.name}</h3>
        </div>
        <p className="text-neutral-400 text-xs leading-relaxed flex-1">{product.why}</p>

        {shown.length > 0 && (
          <div className="text-[10px] text-neutral-500 leading-relaxed">
            <span className="text-neutral-600">Used in </span>
            {shown.map((s, i) => (
              <span key={s.href}>
                <Link to={s.href} className="text-neutral-400 hover:text-amber-400 underline decoration-neutral-700 hover:decoration-amber-500/60 transition-colors">
                  {s.title}
                </Link>
                {i < shown.length - 1 && <span>, </span>}
              </span>
            ))}
            {extraCount > 0 && <span className="text-neutral-600"> + {extraCount} more</span>}
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-auto pt-1">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-3 py-2 rounded-lg transition-colors"
            >
              Shop at {product.brand} &rarr;
            </a>
          )}
          {product.amazonUrl && (
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              Buy on Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get("collection");
  const activeCollection = collections.find((c) => c.slug === slugParam) || collections[0];

  const setCollection = (slug) => {
    const next = new URLSearchParams(searchParams);
    next.set("collection", slug);
    setSearchParams(next, { replace: false });
  };

  useMeta({
    title: activeCollection.slug === collections[0].slug ? "Favorites" : `${activeCollection.title} — Favorites`,
    description: `${activeCollection.title} — the kitchen tools, pantry staples, and brands we actually use on The Split Plate. Curated favorites, not sponsored placements.`,
  });

  const activeProducts = activeCollection.productIds.map((id) => products[id]).filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-white">Favorites</h1>
          <p className="text-neutral-400 text-sm mt-1">
            The tools, pantry staples, and brands we actually use — every product here shows up somewhere in a real recipe on the site.
          </p>
          <p className="text-neutral-600 text-[10px] mt-1">
            Nothing on this page is sponsored. Product suggestions are the ones that survived the "would I buy this again" test.
          </p>
        </div>

        <div className="mb-6 bg-neutral-900/60 border border-neutral-800 rounded-lg px-4 py-3 text-[11px] text-neutral-500 leading-relaxed">
          <span className="text-neutral-400 font-bold">Disclosure:</span> Some outbound links may earn a small commission at no extra cost to you (Amazon Associates & similar). Primary links always point to the brand's own site. We don't feature a product just because it pays commission.
        </div>

        {collections.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setCollection(c.slug)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCollection.id === c.id ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <p className="text-neutral-500 text-xs mb-5">{activeCollection.tagline}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-12 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-5 px-4">
          <p className="text-neutral-500 text-xs">See these in action:</p>
          <Link to="/" className="text-amber-400 text-sm font-bold hover:underline mt-1 inline-block">
            Go to This Week&apos;s Dinners &rarr;
          </Link>
          <p className="text-neutral-600 text-[10px] mt-1">Every dinner shows the brand + product we use, right in the ingredient list.</p>
        </div>
      </div>
    </div>
  );
}
