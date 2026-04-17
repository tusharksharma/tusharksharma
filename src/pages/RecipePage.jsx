import { useParams, Navigate } from "react-router-dom";
import { getBySlug } from "../data/recipes";
import RecipeDetail from "../components/RecipeDetail";
import useMeta from "../hooks/useMeta";

export default function RecipePage() {
  const { slug } = useParams();
  const recipe = getBySlug(slug);
  useMeta(recipe ? { title: recipe.title, description: recipe.description, image: recipe.image } : {});

  if (!recipe) {
    return <Navigate to="/" replace />;
  }

  return <RecipeDetail recipe={recipe} />;
}
