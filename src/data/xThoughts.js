/**
 * Friday X-thoughts carousels (1080×1350 slides with food-photo backgrounds).
 * Past ShortSync carousels used this cover+thoughts format; hosted on /social/{slug}
 * so Save All + QA match the recipe carousel workflow. No recipe macros/split.
 */
export const xThoughtCarousels = [
  {
    slug: "seven-dinner-rules-that-survive-a-real-week",
    // Old Nov 6 slug kept so existing links still resolve before/without the Vercel redirect.
    aliases: ["seven-thoughts-that-make-family-dinner-easier"],
    title: "Seven dinner rules that survive a real week",
    subtitle: "From stove splits to ugly bowls—what actually got dinner done.",
    // Friday publish date for this carousel (not the first daily thought date).
    initialMainPostDate: "2026-11-06",
    weekLabel: "Oct 26 – Nov 1, 2026",
    // Cover is card 1 / 8; cards 2–8 are the seven daily thoughts.
    cards: [
      { src: "/images/x-thoughts-2026-11-06/x-01.jpg", date: "Cover", label: "1 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-02.jpg", date: "Oct 26, 2026", label: "2 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-03.jpg", date: "Oct 27, 2026", label: "3 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-04.jpg", date: "Oct 28, 2026", label: "4 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-05.jpg", date: "Oct 29, 2026", label: "5 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-06.jpg", date: "Oct 30, 2026", label: "6 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-07.jpg", date: "Oct 31, 2026", label: "7 / 8" },
      { src: "/images/x-thoughts-2026-11-06/x-08.jpg", date: "Nov 1, 2026", label: "8 / 8" },
    ],
    caption: {
      default:
        "Seven dinner rules that survive a real week—stove splits, lunch slots, ugly bowls and all. Save this for the next 5:30 scramble. Full notes: link in bio.\n\n#WeeknightDinner #FamilyMeals #RealLifeFood",
      tiktok:
        "Seven dinner rules that survive a real week—stove splits, lunch slots, ugly bowls and all. Save this for the next 5:30 scramble. Full notes: link in bio.\n\n#WeeknightDinner #FamilyMeals #RealLifeFood",
    },
  },
];

export function findXThoughtCarousel(slug) {
  return (
    xThoughtCarousels.find(
      (c) => c.slug === slug || (c.aliases || []).includes(slug),
    ) || null
  );
}
