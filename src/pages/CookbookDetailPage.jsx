import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { sauces, desserts, breakfasts, quickLunches, bases, powerups, snackBoxes } from "../data/cookbook";
import RecipeDetail from "../components/RecipeDetail";
import useMeta from "../hooks/useMeta";
import track from "../hooks/useTrack";

// Which array an entry came from drives its category badge, so look it up by
// group rather than flattening first.
const GROUPS = { bases, sauces, breakfasts, quickLunches, desserts, powerups, snackBoxes };

function findItem(id) {
  for (const [group, items] of Object.entries(GROUPS)) {
    const item = items.find((i) => i.id === id);
    if (item) return { item, group };
  }
  return { item: null, group: null };
}

export default function CookbookDetailPage() {
  const { id } = useParams();
  const { item, group } = findItem(id);
  useMeta(item ? { title: item.title, description: item.useThisWhen, image: item.heroImage } : {});
  useEffect(() => { if (item) track("recipe_view", { recipe: item.title, slug: id }); }, [item, id]);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-ink">
        <div className="text-center">
          <h1 className="text-xl font-bold">Recipe not found</h1>
          <Link to="/cookbook" className="mt-2 inline-block text-sm text-brand">&larr; Back to Recipes</Link>
        </div>
      </div>
    );
  }

  return <RecipeDetail item={item} group={group} />;
}
