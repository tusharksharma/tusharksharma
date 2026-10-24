import { buildRecipeSchema } from "../utils/recipeSchema.js";
import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { getBySlug } from "../data/recipes";
import RecipeDetail from "../components/RecipeDetail";
import useMeta from "../hooks/useMeta";
import track from "../hooks/useTrack";

export default function RecipePage() {
  const { slug } = useParams();
  const recipe = getBySlug(slug);
  useMeta(recipe ? { title: recipe.seoTitle || recipe.title, description: recipe.seoDescription || recipe.description, image: recipe.image, schema: buildRecipeSchema(recipe, "Dinner") } : {});
  useEffect(() => { if (recipe) track("recipe_view", { recipe: recipe.title, slug }); }, [recipe, slug]);

  if (!recipe) {
    return <Navigate to="/" replace />;
  }

  return <RecipeDetail recipe={recipe} />;
}
