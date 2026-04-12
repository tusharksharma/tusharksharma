import { useParams, Navigate } from "react-router-dom";
import { getBySlug } from "../data/recipes";
import RecipeDetail from "../components/RecipeDetail";

export default function RecipePage() {
  const { slug } = useParams();
  const recipe = getBySlug(slug);

  if (!recipe) {
    return <Navigate to="/" replace />;
  }

  return <RecipeDetail recipe={recipe} />;
}
