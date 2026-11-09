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
  {
    slug: "seven-small-dinner-moves-that-get-made",
    title: "Seven small dinner moves that get made",
    subtitle: "A fresh side, a second finish, crunch worth protecting—what got dinner done Nov 2–8.",
    // Friday publish date for this carousel (not the first daily thought date).
    initialMainPostDate: "2026-11-13",
    weekLabel: "Nov 2 – Nov 8, 2026",
    // First card is the thumbnail (no separate cover); cards 1–7 are the seven daily thoughts.
    cards: [
      { src: "/images/x-thoughts-2026-11-13/x-01.jpg", date: "Nov 2, 2026", label: "1 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-02.jpg", date: "Nov 3, 2026", label: "2 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-03.jpg", date: "Nov 4, 2026", label: "3 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-04.jpg", date: "Nov 5, 2026", label: "4 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-05.jpg", date: "Nov 6, 2026", label: "5 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-06.jpg", date: "Nov 7, 2026", label: "6 / 7" },
      { src: "/images/x-thoughts-2026-11-13/x-07.jpg", date: "Nov 8, 2026", label: "7 / 7" },
    ],
    caption: {
      default:
        "Seven small dinner moves from this week: a fresh side for freezer nights, a second finish instead of a second dinner, and crunch worth protecting. Save this for the next 5:30 scramble. Full recipes: link in bio.\n\n#FamilyDinner #WeeknightDinner #CookingTips",
      tiktok:
        "Seven small dinner moves from this week: a fresh side for freezer nights, a second finish instead of a second dinner, and crunch worth protecting. Save this for the next 5:30 scramble. Full recipes: link in bio.\n\n#FamilyDinner #WeeknightDinner #CookingTips",
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
