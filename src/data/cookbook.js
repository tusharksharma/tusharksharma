export const sauces = [
  {
    id: "money-mustard",
    title: "Money Mustard",
    tagline: "High-Protein Chick-fil-A Style Sauce (with a Kick)",
    flavorProfile: "Creamy, tangy, smoky, slight heat",
    calories: 250,
    caloriesPerServing: 32,
    protein: 23,
    servings: 8,
    time: "5 min + 10 min rest",
    bestFor: ["Chicken wraps", "Sliders", "Nuggets", "Rice bowls"],
    useThisWhen: "You want Chick-fil-A flavor at home without the calorie bomb. Works on any protein — wraps, bowls, dips, sliders.",
    flavorTarget: "First taste: sweet + tangy. Mid: smoky BBQ. Finish: light heat.",
    splitNote: {
      adult: "Full recipe as written — full kick",
      kid: "Reduce hot honey sriracha by half. Optional: add 5g extra BBQ for sweetness.",
    },
    ingredients: [
      "150g Fage Total 0% Greek Yogurt",
      "70g French's Organic Yellow Mustard",
      "30g Daisy Light Sour Cream",
      "30g BBQ sauce (smoky preferred)",
      "15g Fairlife Fat Free milk (~1 tbsp, for smoothing)",
      "5g Bragg Apple Cider Vinegar (~1 tsp)",
      "7g hot honey",
      "5g hot honey sriracha",
      "1 tsp onion powder",
    ],
    steps: [
      "COMBINE: Add everything to a bowl.",
      "WHISK SMOOTH: Whisk aggressively until fully combined. Texture should be creamy + pourable, not thick paste. If too thick, add 1-2 tsp more milk.",
      "REST: Let sit 10-15 minutes. Don't skip — this mellows the mustard, blends sweet + acid, and creates the Chick-fil-A balance.",
    ],
    troubleshooting: [
      { problem: "Mustard dominates / too tangy", fix: "Add 5g more BBQ sauce to balance" },
      { problem: "Too sharp / acidic", fix: "Add 10g more yogurt to mellow it" },
      { problem: "Too thick / paste-like", fix: "Add milk 1 tsp at a time until pourable" },
      { problem: "Tastes 'separate' / not blended", fix: "You didn't rest it. Wait 10-15 min." },
      { problem: "Not enough heat", fix: "Add more hot honey sriracha, 2-3g at a time" },
    ],
    brands: [
      { name: "Fage", item: "Total 0% Greek Yogurt", why: "Thick, high protein, neutral tang — the sauce base", image: "/images/brands/fairlife-milk.png", url: "https://usa.fage/products/yogurt/fage-total-0" },
      { name: "French's", item: "Organic Yellow Mustard", why: "Clean, consistent tang without weird additives", url: "https://www.frenchs.com/products/mustard/organic-classic-yellow-mustard" },
      { name: "Fairlife", item: "Fat-free milk", why: "Smooths the sauce without adding calories", image: "/images/brands/fairlife-milk.png", url: "https://fairlife.com/ultra-filtered-milk/fat-free-skim-milk/" },
      { name: "Bragg", item: "Apple Cider Vinegar", why: "Clean acid that brightens without harshness", url: "https://www.bragg.com/products/organic-apple-cider-vinegar" },
    ],
    mealPrep: {
      storage: "Airtight container in fridge.",
      lasts: "5-7 days. Gets better overnight as flavors meld.",
      reheat: "No reheat needed — use cold straight from fridge.",
    },
  },
];

export const quickLunches = [];
