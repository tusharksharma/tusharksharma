// Kitchen Essentials — curated favorites on /favorites.
//
// Positioning: "Products that earned a permanent place in our kitchen."
// Every product on this page has been purchased and used by us. Nothing is
// sponsored.
//
// CTA STRATEGY (as of 2026-07-31): Amazon-first, brand-DTC as a secondary
// link on the same card.
//
// - `amazonUrl`  — Amazon URL with `?tag=tusharksharma-20` (or null).
//                  Renders as the PRIMARY CTA (amber button).
// - `brandUrl`   — brand DTC URL (or null). Renders as a subtle SECONDARY
//                  link below the Amazon button when both are present, or
//                  as the primary CTA when Amazon isn't offered.
//
// Rationale: Amazon Associates is approved TODAY (~3% commission, ~24-hour
// tracking cookie). Brand-direct programs (ShareASale / Impact / CJ / Rakuten)
// pay 6-12% but each requires per-brand approval that takes days-to-weeks.
// Users still get the brand-direct option in the card, but the default click
// path earns commission from day one.
//
// Products where we deliberately skip `amazonUrl`:
//   - Refrigerated dairy (Grillo's, Babybel, Sargento, Fairlife) — Amazon
//     experience requires Fresh membership. Bad default.
//   - Frozen meatballs (Earth's Best) — same reason.
//   - Retailer-exclusive (Kirkland ghee → Costco; TJ shawarma → Trader Joe's).
//     No Amazon listing exists.
//
// Affiliate status shown on the card footer is derived from `amazonUrl`
// presence — no separate field. When we get accepted into a brand program,
// swap that product's `brandUrl` for its tagged variant (Impact/ShareASale/etc.
// URLs already embed the tag) and the footer will show "affiliate" for both
// paths.
//
// Field contract for the rest:
// - `brand`             — brand name, shown as the top-line tag
// - `name`              — product name
// - `why`               — first-person; cite label facts, not vague claims
// - `bestFor`           — what to use it for (concrete)
// - `whatToKnow`        — honest limitation; every product MUST have one
// - `badges`            — chips shown on the card (["PURCHASED OURS", ...])
// - `image`             — /images/... path or null (null = text tile fallback)
// - `amazonCtaLabel`    — optional override for Amazon button text
// - `brandCtaLabel`     — optional override for brand button text
// - `lastLinkCheck`     — YYYY-MM-DD, when the URL was last verified live
// - `sourceRecipeIds`   — `recipe:N` (recipes.js id) or `cookbook:slug`
//                         (cookbook.js id). Powers "Used in ..." attribution.
// - `productType`       — "product" | "editorial" — editorial cards have no CTA

const TODAY = "2026-07-31";
const AMZN_TAG = "tusharksharma-20";

// URL helpers — keep Amazon tag application in one place so future tag
// changes touch one line.
const amznDp = (asin) => `https://www.amazon.com/dp/${asin}?tag=${AMZN_TAG}`;
const amznSearch = (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${AMZN_TAG}`;

export const collections = [
  {
    id: "snack-box-essentials",
    slug: "snack-box-essentials",
    title: "Snack Box Essentials",
    tagline: "The gear + staples behind our Snack Box Series — the same containers we've packed for two years, plus the swaps that keep kid snacks high-protein.",
    productIds: [
      "buluker-snack-containers",
      "gheelish-tortilla-dip-chips",
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
      "lorann-caramel-emulsion",
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
  {
    id: "breakfast-powerups",
    slug: "breakfast-powerups",
    title: "Breakfast Powerups",
    tagline: "The fast, protein-forward breakfasts we default to when the morning doesn't need a carb-heavy pre-lift plate. Eggs, chicken sausage, Creole seasoning — 15 minutes and done.",
    productIds: [
      "happy-egg-heritage-breed",
      "bilinskis-cajun-andouille",
      "tony-chacheres-creole",
    ],
    ogImage: "/images/runny-sunny-eggs-chicken-sausage/hero-runny-sunny-eggs-chicken-sausage-polished.webp",
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
    amazonUrl: amznDp("B0BZHTKXCB"),
    amazonCtaLabel: "Check availability on Amazon",
    brandUrl: null,
    brandCtaLabel: null,
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:deli-dill-snack-box", "cookbook:ham-cheese-power-melt"],
    productType: "product",
  },

  "gheelish-tortilla-dip-chips": {
    id: "gheelish-tortilla-dip-chips",
    brand: "Gheelish",
    name: "Original Tortilla Dip Chips (gluten-free, ghee-based)",
    why: "The crunch layer in the Fiesta Snack Box. Gluten-free, no seed oils, ghee-based flavor. 0.75 oz per box lands ~80 cal in the chip compartment without turning the snack box into a chip bowl.",
    bestFor: "The crunch compartment in a kid snack box when you want a gluten-free chip that isn't seed-oil heavy.",
    whatToKnow: "Ghee-based means dairy — flagged in allergens. Pricier per bag than mainstream tortilla chips. Grocery availability varies; Amazon is the easier reorder path.",
    badges: ["PURCHASED OURS", "USED 6 MONTHS", "KIDS + ADULTS"],
    image: "/images/brands/gheelish-original-tortilla-dip-chips.png",
    amazonUrl: amznSearch("gheelish tortilla dip chips"),
    amazonCtaLabel: null,
    brandUrl: "https://www.gheelish.com/",
    brandCtaLabel: "Or shop direct at Gheelish",
    lastLinkCheck: "2026-08-01",
    sourceRecipeIds: ["cookbook:fiesta-snack-box"],
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
    amazonUrl: amznSearch("wilde brands chicken chips"),
    amazonCtaLabel: null,
    brandUrl: "https://wildebrands.com/collections/chicken-chips",
    brandCtaLabel: "Or browse direct at Wilde",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://grillospickles.com/products/italian-dill-spears",
    brandCtaLabel: "Shop Italian Dill Spears at Grillo's",
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
    amazonUrl: amznSearch("chomps original beef sticks"),
    amazonCtaLabel: null,
    brandUrl: "https://gochomps.com/collections/beef-sticks",
    brandCtaLabel: "Or browse direct at Chomps",
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
    amazonUrl: amznSearch("choczero keto hot honey"),
    amazonCtaLabel: null,
    brandUrl: "https://www.choczero.com/products/keto-hot-honey",
    brandCtaLabel: "Or shop direct at ChocZero",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.babybel.com/us/en/products/original",
    brandCtaLabel: "Shop Original Babybel",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.sargento.com/our-products/natural-cheese/cheese-snacks/",
    brandCtaLabel: "Browse cheese snacks at Sargento",
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
    amazonUrl: amznSearch("ninja creami"),
    amazonCtaLabel: null,
    brandUrl: "https://www.ninjakitchen.com/creami",
    brandCtaLabel: "Or browse Creami models at Ninja",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://fairlife.com/products/2percent-reduced-fat-ultra-filtered-milk-52oz/",
    brandCtaLabel: "Shop 2% Ultra-Filtered at Fairlife",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:berry-limeade-cookie-nerds-creami", "cookbook:white-drop-cookies-n-creme-creami", "cookbook:snickers-peanut-butter-cookie-creami"],
    productType: "product",
  },

  "unflavored-whey-isolate": {
    id: "unflavored-whey-isolate",
    brand: "OpportuniTeas",
    name: "100% Grass-Fed Whey Protein Isolate, Unflavored",
    why: "The protein spine of the CCC base and Proffee. We use OpportuniTeas unflavored isolate so it doesn't fight the recipe's flavor. Per scoop on the label: ~25 g protein.",
    bestFor: "Adding protein to the Creami base and iced proffee without changing the drink or dessert flavor.",
    whatToKnow: "Unflavored isn't tasteless — there's still a light dairy note that comes through in delicate flavors. Isolate costs more per pound than concentrate.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "ADULTS PRIMARILY"],
    image: null,
    amazonUrl: amznSearch("opportuniteas grass fed whey protein isolate unflavored"),
    amazonCtaLabel: null,
    brandUrl: null,
    brandCtaLabel: null,
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
    amazonUrl: amznSearch("whole earth monk fruit erythritol"),
    amazonCtaLabel: null,
    brandUrl: "https://www.wholeearthsweetener.com/products/monk-fruit-erythritol/",
    brandCtaLabel: "Or shop direct at Whole Earth",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:white-drop-cookies-n-creme-creami", "cookbook:berry-limeade-cookie-nerds-creami"],
    productType: "product",
  },

  "guar-gum": {
    id: "guar-gum",
    brand: "Bob's Red Mill",
    name: "Guar Gum",
    why: "The texture unlock in the Creami base. 1/8 tsp of Bob's Red Mill per pint — level, not heaped. One bag lasts us close to a year.",
    bestFor: "The Creami base texture only.",
    whatToKnow: "Only useful if you already own a Creami — it does nothing for stovetop or oven cooking. Level 1/8 tsp is a hard limit; heaped goes gummy.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/brands/bobs-redmill-guar-gum.jpg",
    amazonUrl: amznSearch("bobs red mill guar gum"),
    amazonCtaLabel: null,
    brandUrl: "https://www.bobsredmill.com/guar-gum.html",
    brandCtaLabel: "Or shop direct at Bob's Red Mill",
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
    amazonUrl: amznSearch("hormbles chormbles cookies and cream"),
    amazonCtaLabel: null,
    brandUrl: "https://hormbles.com/",
    brandCtaLabel: "Or browse direct at Hormbles Chormbles",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://fairlife.com/products/fat-free-ultra-filtered-milk-52oz/",
    brandCtaLabel: "Shop Fat-Free Ultra-Filtered at Fairlife",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee"],
    productType: "product",
  },

  "any-instant-coffee": {
    id: "any-instant-coffee",
    brand: "Nescafé",
    name: "Gold Blend Instant Coffee",
    why: "Instant beats brewed in iced proffee because it doesn't water down when it hits ice. 1 heaped tsp of Nescafé Gold per drink is our ratio.",
    bestFor: "Iced proffee. Not for a slow morning brewed cup.",
    whatToKnow: "Flavor won't match a fresh brewed cup — that's the trade for the no-water-down behavior. Nescafé Gold reads darker than some other instants; if you prefer lighter, test a smaller jar first.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    amazonUrl: amznSearch("nescafe gold instant coffee"),
    amazonCtaLabel: null,
    brandUrl: null,
    brandCtaLabel: null,
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee"],
    productType: "product",
  },

  "sugar-free-syrup": {
    id: "sugar-free-syrup",
    brand: "Skinny Syrups",
    name: "Sugar-Free Flavored Syrup (vanilla, caramel, salted caramel, hazelnut)",
    why: "1 pump of Skinny Syrups per proffee — the flavor unlock that keeps the drink at 100 calories. Vanilla is our daily flavor; salted caramel is the rim + drizzle on the Salted Caramel Pretzel Proffee. Caramel + hazelnut rotate in.",
    bestFor: "Sweetening iced proffee without adding sugar. Salted caramel doubles as a glass-rim coating for the pretzel-rim proffee.",
    whatToKnow: "Sucralose-based — some people pick up an aftertaste, especially at more than 1 pump. Bottle lasts a couple of months of daily proffee for one person.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: null,
    amazonUrl: amznSearch("skinny syrups sugar free vanilla"),
    amazonCtaLabel: null,
    brandUrl: "https://www.skinnymixes.com/collections/skinny-syrups",
    brandCtaLabel: "Or browse direct at Skinny Syrups",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:100-calorie-iced-protein-coffee", "cookbook:cookie-butter-iced-proffee", "cookbook:salted-caramel-pretzel-iced-proffee"],
    productType: "product",
  },

  "lorann-caramel-emulsion": {
    id: "lorann-caramel-emulsion",
    brand: "LorAnn Oils",
    name: "Caramel Bakery Emulsion (4 oz)",
    why: "Concentrated water-based caramel flavoring — 1/2 tsp adds buttery caramel depth to the Salted Caramel Pretzel Proffee at zero calories. Bakery emulsions are the pastry-industry standard for concentrated flavor without sweetness, so you can dial caramel flavor independently of sugar.",
    bestFor: "The Salted Caramel Pretzel Proffee concentrate. Cross-utility for any protein baking recipe that needs caramel flavor without added sugar (protein donuts, glazes, Creami bases).",
    whatToKnow: "Potent — 1/2 tsp is the ceiling in a proffee. More reads chemical, not buttery. Water-based, not oil-based, so it plays in cold drinks. One 4 oz bottle lasts months of proffee use.",
    badges: ["PURCHASED OURS", "USED 6 MONTHS", "ADULTS PRIMARILY"],
    image: null,
    amazonUrl: amznSearch("lorann caramel bakery emulsion"),
    amazonCtaLabel: null,
    brandUrl: "https://www.lorannoils.com/caramel-bakery-emulsion-0740",
    brandCtaLabel: "Or shop direct at LorAnn Oils",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:salted-caramel-pretzel-iced-proffee"],
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.costco.com/CatalogSearch?dept=All&keyword=kirkland+ghee",
    brandCtaLabel: "Browse at Costco",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.earthsbest.com/products/mini-beef-meatballs-toddler",
    brandCtaLabel: "Shop Mini Meatballs at Earth's Best",
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
    amazonUrl: amznSearch("bare bones bone broth"),
    amazonCtaLabel: null,
    brandUrl: "https://barebonesbroth.com/collections/all",
    brandCtaLabel: "Or browse direct at Bare Bones",
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
    amazonUrl: amznSearch("danos seasoning original spicy"),
    amazonCtaLabel: null,
    brandUrl: "https://danosseasoning.com/collections/all-products",
    brandCtaLabel: "Or browse direct at Dan-O's",
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
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.traderjoes.com/home/products/pdp/shawarma-style-chicken-thighs-071842",
    brandCtaLabel: "View at Trader Joe's",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:44"],
    productType: "product",
  },

  "frozen-vegetables-editorial": {
    id: "frozen-vegetables-editorial",
    brand: "365 by Whole Foods Market",
    name: "Organic Frozen Vegetables (broccoli florets, green beans, mixed medley)",
    why: "Frozen vegetables often win in our house on busy weeknights because they reduce prep and waste. We reach for 365 Organic bags first — broccoli florets, green beans, and a mixed medley on rotation.",
    bestFor: "The 30-second microwavable side that saves the weeknight when there's no time for fresh prep.",
    whatToKnow: "Frozen vegetables lose some crunch versus fresh — the trade for zero prep and long shelf life. Steam-in-bag options can go mushy if you overcook them; pull them at the earliest listed time. 365 requires a Whole Foods or Amazon Fresh trip — not stocked at every grocery store.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "KIDS + ADULTS"],
    image: null,
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://www.wholefoodsmarket.com/search?text=365%20organic%20frozen%20vegetables",
    brandCtaLabel: "Browse 365 frozen at Whole Foods",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["recipe:21"],
    productType: "product",
  },

  // ─── Breakfast Powerups ─────────────────────────────────────────────

  "happy-egg-heritage-breed": {
    id: "happy-egg-heritage-breed",
    brand: "Happy Egg Co.",
    name: "Heritage Breed Eggs (blue carton)",
    why: "The whole point of a 7-minute jammy egg is the yolk. Heritage-breed hens lay richer, deeper-yolked eggs than commodity cartons. The blue Happy Egg carton is the one we reach for at the grocery store — free-range heritage breed, consistently rich yolks.",
    bestFor: "Any egg-forward recipe where the yolk is the payoff — jammy eggs, sunny-side, poached, custards.",
    whatToKnow: "Refrigerated — Amazon Fresh only in select regions, so we route to the Happy Egg store locator by default. Costs about 2× a commodity dozen. Yolk color varies with the hen's diet and season, so a specific carton may look darker or paler than the last.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/runny-sunny-eggs-chicken-sausage/context-happy-egg-blue.webp",
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://happyegg.com/products/heritage-breed",
    brandCtaLabel: "Find Heritage Breed at Happy Egg",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:7-minute-runny-sunny-eggs-chicken-sausage"],
    productType: "product",
  },

  "bilinskis-cajun-andouille": {
    id: "bilinskis-cajun-andouille",
    brand: "Bilinski's",
    name: "Organic Cajun Style Andouille Chicken Sausage (fully cooked)",
    why: "Pre-cooked chicken sausage with Cajun seasoning already baked in — you're heating and browning, not cooking through. About 130 cal and 14g protein per link on the label. Pork-free, so it works for households avoiding pork without giving up the andouille profile.",
    bestFor: "Fast breakfasts where the protein needs to land in under 5 minutes — pair with jammy eggs, breakfast tacos, rice bowls.",
    whatToKnow: "Refrigerated (short shelf life once opened) — Amazon Fresh only in select regions, so we route to Bilinski's store locator. Cajun andouille reads spicier than the sweet-Italian or mild Bilinski's variants; heat-sensitive eaters should try the mild first. Not a swap for a pork andouille if you're chasing a specific gumbo profile.",
    badges: ["PURCHASED OURS", "USED 1+ YEAR", "ADULTS PRIMARILY"],
    image: "/images/runny-sunny-eggs-chicken-sausage/context-bilinskis-cajun-andouille.webp",
    amazonUrl: null,
    amazonCtaLabel: null,
    brandUrl: "https://bilinskis.com/product/organic-cajun-style-andouille/",
    brandCtaLabel: "Find Cajun Andouille at Bilinski's",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:7-minute-runny-sunny-eggs-chicken-sausage"],
    productType: "product",
  },

  "tony-chacheres-creole": {
    id: "tony-chacheres-creole",
    brand: "Tony Chachere's",
    name: "Original Creole Seasoning",
    why: "Cheap, universal, one shake adds Creole heat and salt at once. The finishing seasoning on the 7-minute jammy egg plate. Also cross-utility for rice, chicken, fries.",
    bestFor: "Finishing seasoning on eggs, chicken, fries, or anywhere Creole heat + salt should land in one pass.",
    whatToKnow: "Salt-forward — one heavy shake can push a plate too salty. Start light and taste. Contains soybean oil derivatives in the anti-caking mix; check the label if you're avoiding it.",
    badges: ["PURCHASED OURS", "USED 2+ YEARS", "ADULTS PRIMARILY"],
    image: null,
    amazonUrl: amznSearch("tony chacheres original creole seasoning"),
    amazonCtaLabel: null,
    brandUrl: "https://tonychachere.com/product/original-creole-seasoning/",
    brandCtaLabel: "Or shop direct at Tony Chachere's",
    lastLinkCheck: TODAY,
    sourceRecipeIds: ["cookbook:7-minute-runny-sunny-eggs-chicken-sausage"],
    productType: "product",
  },
};
