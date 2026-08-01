// Kitchen Essentials — curated favorites on /favorites.
//
// Positioning: "Products that earned a permanent place in our kitchen."
// Every product on this page has been purchased and used by us. Nothing is
// sponsored. Amazon Associates tag `tusharksharma-20` is active as of
// 2026-07-31 — the 4 Amazon-hosted products (Buluker containers + 3 category
// searches) are `affiliateStatus: "affiliate"`. All 18 brand-DTC products
// remain `non-affiliate` until we get accepted into brand programs
// (Impact/ShareASale/CJ/Rakuten). Flip per product as they land.
//
// Field contract:
// - `brand`             — brand name, shown as the top-line tag
// - `name`              — product name
// - `why`               — first-person, ties the product to the split-plate
//                         kitchen (no vague nutrition claims — cite actual
//                         label facts or say "in our house")
// - `bestFor`           — what to use it for (concrete)
// - `whatToKnow`        — honest limitation; every product MUST have one
// - `badges`            — small chips shown on the card
//                         ("PURCHASED OURS", "USED 2 YEARS", "KIDS + ADULTS")
// - `usedFor`           — string used inside the badge stack (see badges above)
// - `image`             — /images/... path or null (null = text tile fallback)
// - `url`               — outbound destination. Prefer the exact product page;
//                         if it's a category/homepage, set `ctaLabel` honestly
//                         ("Browse at Costco", "Search on Amazon", etc.)
// - `ctaLabel`          — overrides "Shop at {brand}" button text
// - `affiliateStatus`   — "non-affiliate" | "affiliate"
// - `lastLinkCheck`     — YYYY-MM-DD, when the URL was last verified live
// - `sourceRecipeIds`   — `recipe:N` (recipes.js id) or `cookbook:slug`
//                         (cookbook.js id). Powers "Used in ..." attribution.
// - `productType`       — "product" | "editorial" — editorial cards have no
//                         CTA (generic recommendations like "frozen veg")

const TODAY = "2026-07-31";

export const collections = [
  {
    id: "snack-box-essentials",
    slug: "snack-box-essentials",
    title: "Snack Box Essentials",
    tagline: "The gear + staples behind our Snack Box Series — the same containers we've packed for two years, plus the swaps that keep kid snacks high-protein.",
    productIds: [
      "buluker-snack-containers",
      "wilde-chicken-chips",
      "grillos-pickles",
      "chomps-beef-sticks",
      "choczero-hot-honey",
      "babybel-cheese",
      "sargento-cheese-sticks",
    ],
    ogImage: "/images/deli-dill-snack-box/hero-polished.webp",
  },
  {
    id: "creami-essentials",
    slug: "creami-essentials",
    title: "Creami Essentials",
    tagline: "The saved 4-line base + the machine. Everything that runs across the CrumblCreamiCut series.",
    productIds: [
      "ninja-creami",
      "fairlife-2-percent-milk",
      "unflavored-whey-isolate",
      "whole-earth-monk-fruit",
      "guar-gum",
      "hormbles-chormbles-protein-chocolate",
    ],
    ogImage: "/images/white-drop-cookies-n-creme-creami/hero-polished.webp",
  },
  {
    id: "proffee-gear",
    slug: "proffee-gear",
    title: "Proffee Gear",
    tagline: "The 100-calorie iced protein coffee build — dairy base, instant coffee, sweetener, done.",
    productIds: [
      "fairlife-fat-free-milk",
      "any-instant-coffee",
      "unflavored-whey-isolate",
      "sugar-free-syrup",
    ],
    ogImage: "/images/100-calorie-iced-protein-coffee/hero-polished.webp",
  },
  {
    id: "freezer-weeknight",
    slug: "freezer-weeknight",
    title: "Freezer & Weeknight Shortcuts",
    tagline: "The pantry + freezer staples that keep a 30-minute dinner actually 30 minutes.",
    productIds: [
      "kirkland-ghee",
      "earths-best-mini-meatballs",
      "bare-bones-bone-broth",
      "danos-seasoning",
      "trader-joes-shawarma-chicken",
      "frozen-vegetables-editorial",
    ],
    ogImage: "/images/split-protein-creamy-spinach-pasta/hero-split-adult-kid-plates-polished.webp",
  },
];

export const products = {
  // ─── Snack Box Essentials ───────────────────────────────────────────

  "buluker-snack-containers": {
    id: "buluker-snack-containers",
    brand: "Buluker",
    name: "Four-Compartment Snack Containers",
    why: "These are the containers used throughout our Snack Box Series. We have used the same set for two years for children's snacks, adult snacks, and pre-portioned fruit. The four equal compartments make variety and portioning easy, and the containers stack neatly in the refrigerator.",
    bestFor: "Fruit, vegetables, crackers, cheese, deli meat and other mostly dry snacks.",
    whatToKnow: "Nothing has leaked during our normal use, but we avoid loose sauces and liquids because the inside of the lid gets messy and children do not always open containers carefully. I would prefer one larger compartment and one smaller compartment instead of four equal sections.",
    badges: ["PURCHASED OURS", "USED 2 YEARS", "KIDS + ADULTS"],
    image: null,
    url: "https://www.amazon.com/dp/B0BZHTKXCB?tag=tusharksharma-20",
    ctaLabel: "Check availability on Amazon",
    affiliateStatus: "affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box", "cookbook:ham-cheese-power-melt"],
    productType: "product",
  },

  "wilde-chicken-chips": {
    id: "wilde-chicken-chips",
    brand: "Wilde Brands",
    name: "Chicken Chips (multiple flavors)",
    why: "In our house Wilde Chicken Chips replace pretzels or crackers in the snack box because they hold up in the compartment without going stale and the kids treat them as chips. Per bag: ~10 g protein and ~150 calories on the label.",
    bestFor: "The crunch layer in a snack box when you'd usually reach for pretzels or crackers.",
    whatToKnow: "Flavor is close to a real chip but not identical — adults notice the chicken chew, kids don't seem to. A single bag runs about $6, which adds up quickly if it becomes a daily habit.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "KIDS + ADULTS"],
    image: "/images/brands/wilde-spicy-queso-chips.png",
    url: "https://wildebrands.com/collections/chicken-chips",
    ctaLabel: "Browse chicken chips at Wilde",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box", "cookbook:ham-cheese-power-melt"],
    productType: "product",
  },

  "grillos-pickles": {
    id: "grillos-pickles",
    brand: "Grillo's Pickles",
    name: "Italian Dill Spears (or Chips)",
    why: "The anchor of our Deli Dill snack box and the base of the pickle-dip series. Sold refrigerated so the crunch stays intact — no yellow food coloring on the ingredient panel.",
    bestFor: "Snack boxes, pickle dips, or whenever a cold refrigerated crunch is doing the flavor work.",
    whatToKnow: "Refrigerator-only — takes up fridge shelf space and can't be pantry-stashed like shelf-stable pickles. Shorter open-jar shelf life than shelf-stable brands.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: "/images/brands/grillos-classic-dill-pickle-chips.jpg",
    url: "https://grillospickles.com/products/italian-dill-spears",
    ctaLabel: "Shop Italian Dill Spears at Grillo's",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box", "cookbook:grillos-pickle-dip-protein-style", "cookbook:grillos-pickle-dip-wilde-combo"],
    productType: "product",
  },

  "chomps-beef-sticks": {
    id: "chomps-beef-sticks",
    brand: "Chomps",
    name: "Original Beef Sticks (or Turkey)",
    why: "Shelf-stable snack-box protein for days when the fridge isn't nearby. Per label: 9 g protein, ~100 calories per stick — the kids grab it without prep.",
    bestFor: "Snack boxes, road trips, and any pocket-portable snack moment where deli meat can't travel.",
    whatToKnow: "Thin stick — one is a snack, not a meal. Priced high per gram of protein compared to a jerky bag or plain deli meat.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "KIDS + ADULTS"],
    image: null,
    url: "https://gochomps.com/collections/beef-sticks",
    ctaLabel: "Browse beef sticks at Chomps",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box"],
    productType: "product",
  },

  "choczero-hot-honey": {
    id: "choczero-hot-honey",
    brand: "ChocZero",
    name: "Keto Hot Honey (sugar-free)",
    why: "Sweetened with monk fruit + soluble corn fiber instead of sugar. We use it 1:1 in the Money Mustard family and to drizzle over eggs when we don't want the sugar bump.",
    bestFor: "The Money Mustard sauce family, drizzling over eggs or chicken, cutting the sweetness of a wing coat.",
    whatToKnow: "Some people pick up a cooling aftertaste from the sweetener stack. Not a 1:1 body match for real honey — it's slightly thinner and less viscous.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/brands/choczero-hot-honey.png",
    url: "https://www.choczero.com/products/keto-hot-honey",
    ctaLabel: "Shop Keto Hot Honey at ChocZero",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:money-mustard-hack", "cookbook:money-mustard"],
    productType: "product",
  },

  "babybel-cheese": {
    id: "babybel-cheese",
    brand: "Babybel",
    name: "Original Semisoft Cheese Wheels",
    why: "The wax wrap makes it feel like a treat when the kids open the snack box. Per wheel: 6 g protein and ~70 calories on the label.",
    bestFor: "Kid-familiar cheese in a snack box — no plate, no knife, no supervision needed.",
    whatToKnow: "Mild semisoft cheese, not shredded — you can't cook with it. The wax wrap adds a small waste stream per wheel.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: null,
    url: "https://www.babybel.com/us/en/products/original",
    ctaLabel: "Shop Original Babybel",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box"],
    productType: "product",
  },

  "sargento-cheese-sticks": {
    id: "sargento-cheese-sticks",
    brand: "Sargento",
    name: "Colby Jack or Cheddar Cheese Sticks",
    why: "Individually wrapped, portion-sized cheese for lunchboxes and snack boxes. Per stick: 7 g protein and ~80 calories on the label.",
    bestFor: "The cheese portion in a kid lunchbox or the Ham & Cheese Power Melt snack box.",
    whatToKnow: "Tuned to a kid palate — mild, flat compared to a sharp cheddar block. Each stick is individually plastic-wrapped, one wrapper per snack.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS PRIMARILY"],
    image: null,
    url: "https://www.sargento.com/our-products/natural-cheese/cheese-snacks/",
    ctaLabel: "Browse cheese snacks at Sargento",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:ham-cheese-power-melt"],
    productType: "product",
  },

  // ─── Creami Essentials ──────────────────────────────────────────────

  "ninja-creami": {
    id: "ninja-creami",
    brand: "Ninja",
    name: "Creami (any current model)",
    why: "The machine the entire CrumblCreamiCut series runs on. Regular Ice Cream + Respin is the combo we use for every recipe in the series.",
    bestFor: "Making a high-protein ice cream you actually want to eat, using the same 4-line base every time.",
    whatToKnow: "Loud during processing. Takes counter space. Only useful if you commit to the freeze-24-hour routine — if you'd Creami once a month it's not worth the shelf real estate.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    url: "https://www.ninjakitchen.com/creami",
    ctaLabel: "Browse Creami models at Ninja",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:snickers-peanut-butter-cookie-creami", "cookbook:berry-limeade-cookie-nerds-creami", "cookbook:white-drop-cookies-n-creme-creami"],
    productType: "product",
  },

  "fairlife-2-percent-milk": {
    id: "fairlife-2-percent-milk",
    brand: "Fairlife",
    name: "2% Ultra-Filtered Milk",
    why: "The dairy base for the entire CCC series. 1 cup + whey isolate + monk fruit = the saved 4-line Creami base. The 2% milkfat is intentional for texture — fat-free breaks down colder.",
    bestFor: "The Creami base and any recipe where you want the mouthfeel of milk plus more protein per cup than a standard 2%.",
    whatToKnow: "Ultra-filtered removes most of the lactose but changes the mouthfeel slightly — some people find it thicker than regular 2%. Costs noticeably more per gallon than store-brand milk.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: "/images/marbled-stuffed-cheesecake-creami/context-fairlife-2-percent.webp",
    url: "https://fairlife.com/products/2percent-reduced-fat-ultra-filtered-milk-52oz/",
    ctaLabel: "Shop 2% Ultra-Filtered at Fairlife",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:berry-limeade-cookie-nerds-creami", "cookbook:white-drop-cookies-n-creme-creami", "cookbook:snickers-peanut-butter-cookie-creami"],
    productType: "product",
  },

  "unflavored-whey-isolate": {
    id: "unflavored-whey-isolate",
    brand: "Unflavored Whey Isolate",
    name: "Any clean-tasting brand (~28 g protein per serving)",
    why: "The protein spine of the CCC base and Proffee. We use unflavored so it doesn't fight the recipe's flavor. Isolate blends smoother than concentrate and has less lactose in our experience.",
    bestFor: "Adding protein to the Creami base and iced proffee without changing the drink or dessert flavor.",
    whatToKnow: "Unflavored isn't tasteless — there's still a light dairy note that comes through in delicate flavors. Isolate costs more per pound than concentrate.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "ADULTS PRIMARILY"],
    image: null,
    url: "https://www.amazon.com/s?k=unflavored+whey+protein+isolate&tag=tusharksharma-20",
    ctaLabel: "Search unflavored whey isolate on Amazon",
    affiliateStatus: "affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:white-drop-cookies-n-creme-creami", "cookbook:100-calorie-iced-protein-coffee"],
    productType: "product",
  },

  "whole-earth-monk-fruit": {
    id: "whole-earth-monk-fruit",
    brand: "Whole Earth",
    name: "Monk Fruit + Erythritol Sweetener",
    why: "2 tbsp per pint in the Creami base. It's the single sweetener across every CCC recipe, so once the bag is open it earns its shelf space fast.",
    bestFor: "Sweetening the Creami base and sugar-free protein baking.",
    whatToKnow: "Erythritol has a slight cooling aftertaste — some people notice it more than others. Doesn't caramelize, so it's not a swap for browning recipes.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/brands/whole-earth-monk-fruit-erythritol.webp",
    url: "https://www.wholeearthsweetener.com/products/monk-fruit-erythritol/",
    ctaLabel: "Shop Monk Fruit + Erythritol at Whole Earth",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:white-drop-cookies-n-creme-creami", "cookbook:berry-limeade-cookie-nerds-creami"],
    productType: "product",
  },

  "guar-gum": {
    id: "guar-gum",
    brand: "Bob's Red Mill (or any brand)",
    name: "Guar Gum",
    why: "The texture unlock in the Creami base. 1/8 tsp per pint — level, not heaped. One bag lasts us close to a year.",
    bestFor: "The Creami base texture only.",
    whatToKnow: "Only useful if you already own a Creami — it does nothing for stovetop or oven cooking. Level 1/8 tsp is a hard limit; heaped goes gummy.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/brands/bobs-redmill-guar-gum.jpg",
    url: "https://www.amazon.com/s?k=bobs+red+mill+guar+gum&tag=tusharksharma-20",
    ctaLabel: "Search guar gum on Amazon",
    affiliateStatus: "affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:white-drop-cookies-n-creme-creami"],
    productType: "product",
  },

  "hormbles-chormbles-protein-chocolate": {
    id: "hormbles-chormbles-protein-chocolate",
    brand: "Hormbles Chormbles",
    name: "Cookies & Cream Protein Chocolate Bar",
    why: "The post-scoop topping in the White Drop Creami. Half a bar chopped on top adds about 5 g protein per pint. Kept out of the machine — texture stays cookie-forward instead of blended out.",
    bestFor: "Chopped on top of Creami scoops for a cookies-and-cream finish that adds protein.",
    whatToKnow: "Pricier than a regular chocolate bar per gram. Some flavors read chalky — the Cookies & Cream is on the smoother end but still not a Hershey's dupe. Milk allergen; verify the current cross-contact statement.",
    badges: ["PURCHASED OURS", "USED 6 MONTHS", "ADULTS PRIMARILY"],
    image: "/images/white-drop-cookies-n-creme-creami/context-cookies-creme-protein-chocolate.webp",
    url: "https://hormbles.com/",
    ctaLabel: "Browse at Hormbles Chormbles",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:white-drop-cookies-n-creme-creami"],
    productType: "product",
  },

  // ─── Proffee Gear ───────────────────────────────────────────────────

  "fairlife-fat-free-milk": {
    id: "fairlife-fat-free-milk",
    brand: "Fairlife",
    name: "Fat-Free Ultra-Filtered Milk",
    why: "The dairy base for the 100-Calorie Iced Protein Coffee. Per cup on the label: 13 g protein and 90 calories. Ultra-filtered means it holds body in cold coffee instead of watering out.",
    bestFor: "Iced proffee and any drink where you want dairy body without added fat.",
    whatToKnow: "Fat-free reads thinner than 2% — noticeable if you go back and forth. Some people don't tolerate ultra-filtered milk perfectly despite the reduced lactose.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "ADULTS PRIMARILY"],
    image: "/images/brands/fairlife-milk.png",
    url: "https://fairlife.com/products/fat-free-ultra-filtered-milk-52oz/",
    ctaLabel: "Shop Fat-Free Ultra-Filtered at Fairlife",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee"],
    productType: "product",
  },

  "any-instant-coffee": {
    id: "any-instant-coffee",
    brand: "Any Instant Coffee",
    name: "Nescafé Gold, Café Bustelo, or your daily brand",
    why: "Instant beats brewed in iced proffee because it doesn't water down when it hits ice. 1 heaped tsp per drink is our ratio.",
    bestFor: "Iced proffee. Not for a slow morning brewed cup.",
    whatToKnow: "Flavor won't match a fresh brewed cup you like — that's the trade for the no-water-down behavior. Some brands are noticeably bitter; test one before buying multiples.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    url: "https://www.amazon.com/s?k=instant+coffee&tag=tusharksharma-20",
    ctaLabel: "Search instant coffee on Amazon",
    affiliateStatus: "affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee"],
    productType: "product",
  },

  "sugar-free-syrup": {
    id: "sugar-free-syrup",
    brand: "Skinny Syrups / ChocZero",
    name: "Sugar-Free Flavored Syrup (vanilla, caramel, hazelnut)",
    why: "1 pump per proffee — the flavor unlock that keeps the drink at 100 calories. Skinny Syrups is our daily driver; ChocZero syrups have a cleaner sweetener stack.",
    bestFor: "Sweetening iced proffee without adding sugar.",
    whatToKnow: "Sucralose base — some people pick up a chemical aftertaste. ChocZero avoids sucralose but costs more per bottle.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    url: "https://www.skinnymixes.com/collections/skinny-syrups",
    ctaLabel: "Browse Skinny Syrups",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee", "cookbook:cookie-butter-iced-proffee"],
    productType: "product",
  },

  // ─── Freezer & Weeknight Shortcuts ──────────────────────────────────

  "kirkland-ghee": {
    id: "kirkland-ghee",
    brand: "Kirkland Signature",
    name: "Organic Ghee",
    why: "3 tbsp across 2 cups of rice for the golden garlic bowls — measured, not eyeballed. Handles the sear heat without breaking down like butter alone.",
    bestFor: "High-heat searing, finishing rice with a nutty note.",
    whatToKnow: "Costco-only in our experience — hard to find consistently outside a Costco run. Once opened, keep it sealed; clarified butter still oxidizes over months.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "ADULTS PRIMARILY"],
    image: "/images/brands/kirkland-ghee.jpg",
    url: "https://www.costco.com/CatalogSearch?dept=All&keyword=kirkland+ghee",
    ctaLabel: "Browse at Costco",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:24"],
    productType: "product",
  },

  "earths-best-mini-meatballs": {
    id: "earths-best-mini-meatballs",
    brand: "Earth's Best",
    name: "Mini Beef Meatballs (kid protein)",
    why: "2 oz per kid on the Split-Protein Creamy Spinach Pasta — the swap that keeps everyone at the same dinner. Fully cooked frozen; heats through in the sauce in 4-5 minutes.",
    bestFor: "Kid protein in a split-protein pasta dinner where the adults get steak or tri-tip on top.",
    whatToKnow: "Texture is softer than fresh meatballs — tuned for kid palates, not adult ones. Not a swap for a scratch meatball dish where texture is the point.",
    badges: ["PURCHASED OURS", "USED 6 MONTHS", "KIDS PRIMARILY"],
    image: "/images/brands/earths-best-meatballs.webp",
    url: "https://www.earthsbest.com/products/mini-beef-meatballs-toddler",
    ctaLabel: "Shop Mini Meatballs at Earth's Best",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:2"],
    productType: "product",
  },

  "bare-bones-bone-broth": {
    id: "bare-bones-bone-broth",
    brand: "Bare Bones",
    name: "Bone Broth (chicken or beef) — cartons or Instant Sticks",
    why: "Higher protein and lower added sodium on the label than most boxed stocks. Powers Bone Broth Rice and the Creamy Spinach sauce. Instant Sticks travel; cartons live in the pantry.",
    bestFor: "Rice cooking liquid, sauce base, or sipping when you want warm dinner-adjacent broth.",
    whatToKnow: "Real bone broth is thicker than boxed stock — throws off recipes that expect a thin base. 1 L cartons don't refrigerate long once opened; freeze what you don't use within about 5 days.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: "/images/brands/bare-bones-chicken-broth.png",
    url: "https://barebonesbroth.com/collections/all",
    ctaLabel: "Browse at Bare Bones",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:2", "cookbook:bone-broth-rice"],
    productType: "product",
  },

  "danos-seasoning": {
    id: "danos-seasoning",
    brand: "Dan-O's",
    name: "Original + Spicy Seasoning",
    why: "Original goes on kid plates, Spicy goes on adult plates — same protein, one cook, seasoned differently at plating. Salt-forward blend; the balance works in our house.",
    bestFor: "Same-protein family dinners where the kid version and adult version diverge only at seasoning.",
    whatToKnow: "Salt-forward — light on paprika and heat compared to a BBQ rub. If you want deeper flavor, Original + Spicy stacked works better than Original alone.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "KIDS + ADULTS"],
    image: "/images/brands/danos-outlaw.png",
    url: "https://danosseasoning.com/collections/all-products",
    ctaLabel: "Browse Dan-O's",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:31", "recipe:37"],
    productType: "product",
  },

  "trader-joes-shawarma-chicken": {
    id: "trader-joes-shawarma-chicken",
    brand: "Trader Joe's",
    name: "Shawarma-Style Chicken Thighs (1.5 lb pack)",
    why: "Pre-seasoned, boneless, skinless — a 15-minute pan sear from the fridge makes the Halal Cart Chicken Rice Bowls a weeknight dinner instead of a marinade project.",
    bestFor: "The Halal Cart Chicken Rice Bowls on a weeknight when marinating for 4 hours isn't happening.",
    whatToKnow: "Trader Joe's only — no online delivery, no direct substitute at other grocery stores. Rotates in and out of stock; don't build a menu around it if you can't verify availability. Pre-seasoning means you can't adjust the salt or heat level.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    url: "https://www.traderjoes.com/home/products/pdp/shawarma-style-chicken-thighs-071842",
    ctaLabel: "View at Trader Joe's",
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:44"],
    productType: "product",
  },

  "frozen-vegetables-editorial": {
    id: "frozen-vegetables-editorial",
    brand: "Editorial",
    name: "Frozen Vegetables I Keep Stocked",
    why: "Frozen vegetables often win in our house on busy weeknights because they reduce prep and waste. We stock the same three shapes: broccoli florets, green beans, and a mixed medley. Any grocery-store frozen bag works — we don't have a favorite brand strong enough to single out.",
    bestFor: "The 30-second microwavable side that saves the weeknight when there's no time for fresh prep.",
    whatToKnow: "Frozen vegetables lose some crunch versus fresh — the trade for zero prep and long shelf life. Steam-in-bag options can go mushy if you overcook them; pull them at the earliest listed time.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: null,
    url: null,
    ctaLabel: null,
    affiliateStatus: "non-affiliate",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:21"],
    productType: "editorial",
  },
};
