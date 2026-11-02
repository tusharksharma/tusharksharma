import { useParams } from "react-router-dom";
import { findXThoughtCarousel } from "../data/xThoughts";
import SocialPage from "./SocialPage";
import XThoughtsSocialPage from "./XThoughtsSocialPage";

/**
 * /social/:slug can be either a recipe carousel or a Friday X-thoughts carousel.
 * Keep them as separate components so React hooks stay stable per tree.
 */
export default function SocialSlugGate() {
  const { slug } = useParams();
  const xThoughts = findXThoughtCarousel(slug);
  if (xThoughts) return <XThoughtsSocialPage carousel={xThoughts} />;
  return <SocialPage />;
}
