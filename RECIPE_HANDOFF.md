# Recipe Handoff — Grilled Sweet & Tangy Chicken Thighs with Smashed Potatoes + Chili Crisp Sour Cream

**Created:** 2026-05-25
**For:** fresh chat in `~/recipes-site`
**Status:** ready to build — all answers locked, brand list set, next-rotation pick chosen

---

## What you're building

A new recipe (id 37) in `src/data/recipes.js`, plus YourWeek.jsx + GroceryList.jsx updates, plus brand URLs + images per the recipes-site rules.

## Reference photos

In `/tmp/chicken-thighs-imgs/img1.jpg img2.jpg img4.jpg img5.jpg img6.jpg` (5 of 6 downloaded; img3 returned HTTP 400, user said it was the **compartment-plate family-plating shot** — ask Tushar to re-paste).

Photo provenance flag for the build chat: img1 shows bone-in skin-on, img4 shows breasts with BBQ glaze. Only img5 (BSL thighs, strong grill marks, char + honey drizzle) actually matches "BSL thighs with Dan-O's Sweet & Tangy + hot sauce." Either anchor on img5 only, or ask for the real cook photos.

## Locked decisions (Tushar answered)

1. **Remove the "hot sauce causes surface caramelization" claim.** Caramelization is sugar-driven; vinegar-forward hot sauces don't caramelize. Reframe as: hot sauce adds acidity + heat + color.
2. **Calorie math:** fat trimmed BSL thighs, ≤1 tsp oil per serving. So ~300 cal chicken (8oz raw → ~6oz cooked, fat trimmed) + 40 cal oil + 150 cal potatoes + 50 cal sauce = **~540 cal per serving**. Use that, mark `estimated: false`.
3. **Sauce ratio: 1:1** Daisy Light Sour Cream : Lee Kum Kee Chili Crisp. Note: this is spicy-heavy; warn in `splitCook` that kids get smaller scoop or sour cream only.
4. **Dan-O's Sweet & Tangy has sugar already.** Drop the "you didn't add sugar" framing — be honest that sweetness is baked into the seasoning. Hot sauce (assume Frank's RedHot, vinegar-forward) does NOT add more sugar.
5. **Sodium note:** Little Potato Company Savory Herb seasoning packet is ~400-600 mg sodium per serving. Include this in `macroHonesty`.
6. **Family-plating anchor photo:** the compartment plate (img3, broken URL — user to re-paste). For now, use img5 as `image` field and add img1 + img2 for the steps.
7. **Next-rotation pick (Tushar said "you decide"): Lemon-Oregano-Yogurt Grilled Thighs** — Mediterranean profile. Completely different from sweet/smoky/spicy: tangy + herb-forward + garlic. Yogurt marinade tenderizes; lemon zest + dried oregano + garlic + olive oil. Pair with quick cucumber-tomato salad + tzatziki. **File this as a second handoff doc when this build lands.** Note in this recipe's `description` or `whyMostFail` that the next family-dinner build pivots to Mediterranean to break sweet/smoky/spicy palate fatigue.

## Brand list — verify URL + image for each

Per memory: every brand needs BOTH `url` AND `image`. WebSearch → WebFetch → curl download → Read to verify. Brand site > big-box > Amazon. Match exact product variant.

1. **Dan-O's Seasoning** — Outlaw Sweet & Tangy. Brand site: danosseasoning.com
2. **Frank's RedHot** — Original Cayenne Pepper Sauce. Brand site: franksredhot.com (default — vinegar-forward, supports the "acidity not caramelization" reframe)
3. **Little Potato Company** — Savory Herb Microwave Ready (the steam-tray bag with seasoning packet). Brand site: littlepotatoes.com
4. **Daisy** — Light Sour Cream (16 oz). Brand site: daisybrand.com
5. **Lee Kum Kee** — Chili Crisp (Sichuan-style, original or extra spicy depending on what Tushar uses — confirm with him). Brand site: usa.lkk.com

## Recipe shape (id 37, slug: grilled-sweet-tangy-thighs-smashed-potatoes)

This is NOT a TKS recipe (TKS prefix = sauce twists only, per memory). Title stays "Grilled Sweet & Tangy Chicken Thighs with Smashed Potatoes + Chili Crisp Sour Cream."

```js
{
  id: 37,
  status: "live",
  carbLevel: "high",  // potatoes
  meta: {
    macros: { protein: 50, calories: 540, fat: 22, carbs: 28, netCarbs: 25, estimated: false },
    allergens: ["dairy"],
    dietTags: [],
    proteinTags: ["chicken"],
    splitAxes: ["spice"],
    effortTags: ["grill", "family-style"],
    costTier: "budget",
    substitutionNotes: [
      "Use bone-in skin-on thighs if BSL not available — add 5 min cook time",
      "Swap Daisy Light for full-fat Greek yogurt — sauce gets tangier, ~same calories",
      "Sub Frank's for Cholula if you want smokier — both vinegar-forward, no sugar",
    ],
  },
  slug: "grilled-sweet-tangy-thighs-smashed-potatoes",
  proteinAnchor: "chicken",
  mealType: "grill",
  flavorDirection: "sweet-smoky-spicy",
  splitFriendly: "full",
  title: "Grilled Sweet & Tangy Chicken Thighs with Smashed Potatoes + Chili Crisp Sour Cream",
  category: "Core Signatures",  // or "Grill Night" if you want a new category
  pillar: "Protein Meals",
  tags: ["grilled", "chicken", "thighs", "potatoes", "chili-crisp", "family-style"],
  time: "30 min (+ marinade)",
  servings: 4,
  protein: 50,
  calories: 540,
  image: "/images/grilled-sweet-tangy-thighs/hero.webp",  // anchor on img5 style — BSL thighs char + grill marks
  role: "The Family Grill Night",
  makeThisWhen: "It's a school night, you have 30 min, and you want a real plate (protein + starch + cold dip) without ordering pizza.",
  hook: "Dan-O's Sweet & Tangy + hot sauce marinade + smashed potatoes + chili crisp sour cream. One pan-style plate; same dish for adults and kids; the dip is the only thing that changes.",
  description: "~50g protein for ~540 cal. BSL thighs marinated in Dan-O's Outlaw Sweet & Tangy + Frank's RedHot + 1 tsp oil, grilled to char on medium-high. Little Potato Company Savory Herb potatoes microwaved → smashed → baked crispy. Cold chili crisp sour cream dip on the side. Family plating — compartment plate, kids get smaller chicken portion and plain sour cream.",
  whyMostFail: [
    "Marinate too long — Dan-O's salt content over-cures BSL thighs in 4+ hours. 30-60 min is the window.",
    "Pull thighs too early — pale rubber chicken with no Maillard. Grill to char marks, not just to internal temp.",
    "Skip the smash — boiled potatoes that aren't smashed = soft cafeteria potatoes. Smash creates crispy edges.",
    "Sauce the chicken on the grill — Dan-O's already has sugar; saucing burns. Marinate, grill, sauce on the plate.",
    "1:1 chili crisp ratio for everyone — kids get plain sour cream, adults get 1:1. Don't punish the kid plate.",
  ],
  whyThisWorks: [
    "Dan-O's Outlaw Sweet & Tangy already brings sugar + savory + smoke — adding Frank's RedHot brings acidity + heat without piling on more sugar. Restraint comes from NOT adding extra honey/brown sugar, not from skipping hot sauce.",
    "Fat-trimmed BSL thighs at 8 oz raw → ~6 oz cooked = ~300 cal of protein, leaving room for 150 cal of crispy potatoes + 50 cal of dip. That's the macro-balance lever.",
    "Smashed potato texture is built by jagged edges, not by oil quantity. The Little Potato Company steam-tray gets them tender; smashing creates surface area; baking crisps without deep-frying calories.",
    "Sour cream + chili crisp 1:1 = creamy fat dilutes the chili oil aggression. Adult plate gets the full dip; kid plate gets plain sour cream or a quarter swirl.",
    "Compartment-plate plating is the unsung win. Chicken on one side, potatoes on another, dip in the third compartment. Kids handle their own dipping — no negotiation, no spice surprise.",
  ],
  executionRules: [
    "MARINATE 30-60 MIN ONLY. Dan-O's salt over-cures past 90 min — texture goes mealy. 30 min is enough for surface flavor.",
    "TRIM THE FAT. BSL thighs have a thin fat cap and a translucent flap on the underside. Trim both before marinating — keeps macros honest and prevents flare-ups on the grill.",
    "1 TSP OIL PER SERVING. Not more. The marinade is already moist from the hot sauce; oil is for grill release, not flavor.",
    "GRILL MEDIUM-HIGH. ~400°F grates. 4-5 min per side for BSL thighs that are ~1 inch thick. Char marks first, then flip — don't fidget.",
    "MICROWAVE → SMASH → BAKE. Steam-tray the potatoes first (4 min), then smash flat on parchment, season packet + light oil spray, bake 425°F 18-22 min until deeply browned.",
    "DIP 1:1 ADULT, PLAIN OR 4:1 KID. Adult: 2 tbsp sour cream + 2 tbsp chili crisp swirled. Kid: 2 tbsp plain sour cream OR 1 tsp chili crisp swirled into 4 tbsp sour cream.",
    "PLATE COMPARTMENTS. Chicken | potatoes | dip. Don't pile — separation lets kids eat what they recognize without sauce contamination.",
  ],
  troubleshooting: [
    { problem: "Chicken is dry / stringy", fix: "Over-marinated (>90 min) or over-grilled (internal >170°F). Pull at 165°F internal, rest 5 min. 30-60 min marinade max." },
    { problem: "Potatoes are soft, not crispy", fix: "You skipped the smash, or didn't bake long enough. Smash hard — jagged edges are the point. Bake 425°F until visible browning, not just heated." },
    { problem: "Sauce is too spicy for the kid", fix: "Use plain sour cream on the kid plate. Or do 4:1 (4 tbsp sour cream + 1 tsp chili crisp swirled in). Adults get the 1:1." },
    { problem: "Grill flare-ups burn the marinade", fix: "Trim the fat cap. The hot sauce + Dan-O's marinade is sugar-forward — rendered fat + sugar = flare. Trim, then grill." },
    { problem: "Plate looks like a brown blob", fix: "Use a compartment plate or a wide platter with visual gaps. Garnish: chopped chives on the chicken, parsley on the potatoes. Costs 30 sec, makes the plate look intentional." },
  ],
  splitCook: {
    splitRatio: "Same plate, just dip changes",
    splitPoint: "AT THE PLATING. Everything cooks together — only the chili crisp ratio in the sour cream changes per plate.",
    sharedIngredients: [
      "--- PROTEIN ---",
      "2 lb boneless skinless chicken thighs, fat trimmed",
      "1.5 tbsp Dan-O's Outlaw Sweet & Tangy seasoning",
      "2 tbsp Frank's RedHot Original",
      "4 tsp neutral oil (avocado or light olive)",
      "--- STARCH ---",
      "1.5 lb Little Potato Company Savory Herb (microwave-ready bag + seasoning packet)",
      "Light oil spray for the baking sheet",
      "--- DIP BASE ---",
      "1/2 cup Daisy Light Sour Cream",
    ],
    sharedSteps: [
      { text: "MARINATE: Trim fat from thighs. Toss in a bowl with Dan-O's + Frank's + oil. 30-60 min in the fridge.", images: ["/images/grilled-sweet-tangy-thighs/marinade.webp"] },
      { text: "MICROWAVE POTATOES: Steam-tray (in the bag) per package directions, usually 4-5 min.", images: [] },
      { text: "SMASH: Tip potatoes onto parchment-lined sheet. Smash flat with the bottom of a glass or measuring cup. Jagged edges, not puree.", images: ["/images/grilled-sweet-tangy-thighs/smashed-potatoes.webp"] },
      { text: "SEASON + BAKE: Light oil spray, sprinkle the seasoning packet, bake 425°F for 18-22 min until deeply browned.", images: ["/images/grilled-sweet-tangy-thighs/smashed-crispy.webp"] },
      { text: "GRILL CHICKEN: Medium-high (~400°F grates). 4-5 min per side. Char marks first side, then flip. Pull at 165°F internal. Rest 5 min.", images: ["/images/grilled-sweet-tangy-thighs/grilled-thighs.webp"] },
    ],
    adult: {
      label: "Adult — Full Chili Crisp Dip",
      protein: 50,
      calories: 540,
      extraIngredients: [
        "2 tbsp Lee Kum Kee Chili Crisp (per adult serving — 1:1 with sour cream)",
      ],
      steps: [
        { text: "DIP: Combine 4 tbsp Daisy Light Sour Cream + 4 tbsp Lee Kum Kee Chili Crisp for 2 adult servings (1:1 per serving). Swirl, don't fully mix — keeps the chili oil visible on top.", images: ["/images/grilled-sweet-tangy-thighs/chili-crisp-sauce.webp"] },
        { text: "PLATE: Compartment plate. 6 oz cooked thigh sliced into strips | 4-5 smashed potatoes | adult dip on the side.", images: ["/images/grilled-sweet-tangy-thighs/adult-plate.webp"] },
      ],
    },
    kid: {
      label: "Kid — Plain or Mild Sour Cream",
      protein: 30,
      calories: 380,
      extraIngredients: [
        "(Optional) 1/2 tsp Lee Kum Kee Chili Crisp per kid serving — only if your kid handles it",
      ],
      variants: [
        {
          name: "Standard — Plain Sour Cream",
          description: "Default for spice-sensitive kids.",
          steps: [
            { text: "DIP: 2 tbsp plain Daisy Light Sour Cream per kid plate. No chili crisp.", images: [] },
            { text: "PLATE: Compartment plate. ~4 oz cooked thigh in strips | 3 smashed potatoes | plain sour cream.", images: [] },
          ],
        },
        {
          name: "Brave Kid — 4:1 Mild Swirl",
          description: "Tiny chili crisp swirl for the kid who's curious.",
          steps: [
            { text: "DIP: 4 tbsp Daisy Light Sour Cream + 1 tsp Lee Kum Kee Chili Crisp. Swirl in. Tame heat, visible color." },
          ],
        },
      ],
    },
  },
  ingredients: [
    "--- PROTEIN ---",
    "2 lb BSL chicken thighs, fat trimmed",
    "1.5 tbsp Dan-O's Outlaw Sweet & Tangy",
    "2 tbsp Frank's RedHot Original",
    "4 tsp neutral oil",
    "--- STARCH ---",
    "1.5 lb Little Potato Company Savory Herb (includes seasoning packet)",
    "Light oil spray",
    "--- DIP ---",
    "1/2 cup Daisy Light Sour Cream",
    "4 tbsp Lee Kum Kee Chili Crisp [adult]",
    "(Optional) 1 tsp Lee Kum Kee Chili Crisp [kid 'brave' variant]",
  ],
  steps: [
    { text: "MISE EN PLACE: Thighs trimmed, Dan-O's + Frank's + oil mixed in a bowl. Potatoes ready (still in bag). Sour cream + chili crisp on the counter. Compartment plates out.", images: [] },
    { text: "MARINATE: 30-60 min in the fridge.", images: ["/images/grilled-sweet-tangy-thighs/marinade.webp"] },
    { text: "MICROWAVE POTATOES: Steam-tray per package, 4-5 min.", images: [] },
    { text: "PREHEAT OVEN 425°F. Smash potatoes on parchment. Oil spray + seasoning packet. Bake 18-22 min.", images: ["/images/grilled-sweet-tangy-thighs/smashed-potatoes.webp"] },
    { text: "GRILL THIGHS: Medium-high, 4-5 min per side. Char marks first, then flip. Internal 165°F. Rest 5 min.", images: ["/images/grilled-sweet-tangy-thighs/grilled-thighs.webp"] },
    { text: "MAKE DIPS: Adult: 4 tbsp Daisy + 4 tbsp Lee Kum Kee chili crisp swirled. Kid: 2 tbsp plain Daisy (default) OR 4 tbsp Daisy + 1 tsp chili crisp (brave variant).", images: ["/images/grilled-sweet-tangy-thighs/chili-crisp-sauce.webp"] },
    { text: "PLATE COMPARTMENTS: Chicken | potatoes | dip. Garnish chives on chicken, parsley on potatoes if you want it to look intentional.", images: ["/images/grilled-sweet-tangy-thighs/hero.webp"] },
  ],
  brands: [
    // FILL EACH WITH url + image — see Brand list above. Required: every brand has BOTH fields verified.
    { name: "Dan-O's", item: "Outlaw Sweet & Tangy Seasoning", why: "Sugar + smoke + savory baked in. Drives the marinade — adding extra honey/brown sugar would tip into BBQ-glaze territory.", url: "TODO", image: "TODO" },
    { name: "Frank's RedHot", item: "Original Cayenne Pepper Sauce", why: "Vinegar-forward = acidity + heat without extra sugar. NOT a caramelization driver — Dan-O's already covers sugar. Frank's is here for tang + color.", url: "TODO", image: "TODO" },
    { name: "Little Potato Company", item: "Savory Herb Microwave Ready (1.5 lb steam-tray)", why: "Steam-tray gets to tender in 4 min — saves 30 min of boiling. Seasoning packet has herb + salt blend that works straight onto smashed-and-oiled potatoes. Sodium note: ~400-600 mg per serving.", url: "TODO", image: "TODO" },
    { name: "Daisy", item: "Light Sour Cream (16 oz)", why: "~25 cal/tbsp vs ~60 for full-fat. Tangy enough to dilute the chili crisp aggression without going chalky like nonfat versions.", url: "TODO", image: "TODO" },
    { name: "Lee Kum Kee", item: "Chili Crisp", why: "Sichuan-style, fried garlic + chili oil + crispy bits. 1:1 with sour cream is the adult ratio. Kids get plain or a 4:1 mild swirl. Confirm variant (original vs extra spicy) with Tushar.", url: "TODO", image: "TODO" },
  ],
  macroHonesty: "Per-serving (540 cal / 50g protein / 22g fat / 28g carbs / 25g net carbs) computed for 4 servings = 2 adults at 8oz raw thigh + 2 kids at 6oz raw thigh, fat trimmed, 1 tsp oil per serving. Potatoes: ~150 cal per ~6 oz cooked. Adult dip: ~100 cal (2 tbsp Daisy + 2 tbsp chili crisp). Kid dip: ~30 cal plain. Sodium is the macro to watch — Dan-O's + Frank's + Little Potato seasoning packet stack to ~1,100-1,400 mg sodium per adult serving.",
  mealPrep: {
    storage: "Chicken + potatoes hold 3 days fridge. Sauce holds 5 days separately — don't pre-mix dip into the chicken container.",
    reheat: "Chicken: 350°F oven 8 min covered. Microwave fine but loses crispness. Potatoes: re-crisp on a dry pan medium 3 min per side — better than the oven for texture.",
    lasts: "3 days fridge for cooked chicken + potatoes. Sauce 5 days.",
  },
}
```

## YourWeek.jsx insertion

Pick ONE: prefer **Week 7** to break the all-chicken-all-Asian-all-high-carb monotony with a different chicken treatment, OR **Week 5** to swap into the Friday pasta-prep slot and balance the week (Mon: tandoori, Wed: wings, Fri: this — three different chicken treatments instead of pork-pasta closer).

My pick: **Week 5 Friday swap** — current Friday is creamy sausage spinach pasta (id 36, high-carb). Swapping in this grilled-thighs build keeps Week 5's protein variety (chicken/chicken/chicken instead of chicken/chicken/pork is worse, BUT each treatment is radically different: yogurt-marinated tandoori, frozen wings, fresh grilled-with-Dan-O's). High-carb stays via the potatoes. Reheats well.

**Alternative pick: insert as a brand-new "Week 9"** if Tushar wants to grow the rotation without displacing the pasta-prep meal which is a load-bearing meal-prep workflow.

Recommend: ask Tushar in the build chat which he prefers before editing YourWeek.jsx.

## GroceryList.jsx insertion

If Week 5 swap: replace the Friday pasta block with:
```
"Protein": [{ name: "BSL chicken thighs, fat trimmed", baseQty: 2, unit: "lb", meal: "Fri" }],
"Carbs": [{ name: "Little Potato Company Savory Herb (1.5 lb bag)", baseQty: 1, unit: "bag", meal: "Fri" }],
"Sauce & Flavor": [
  { name: "Dan-O's Outlaw Sweet & Tangy", qty: "pantry", meal: "Fri" },
  { name: "Frank's RedHot Original", qty: "pantry", meal: "Fri" },
  { name: "Lee Kum Kee Chili Crisp", qty: "pantry", meal: "Fri adult" },
],
"Creamy Base": [{ name: "Daisy Light Sour Cream", baseQty: 8, unit: "oz", meal: "Fri" }],
```

Adjust Mon + Wed grocery to keep existing.

## Image prompts (both paths, mandatory per memory)

### Path A — Gemini "Transform this image" (polish, preserve composition)
> Transform this photo into a polished food-blog hero shot. Keep the exact plate composition, chicken placement, and potato arrangement. Enhance: golden-brown char on the chicken edges, visible grill marks, glossy moisture on the meat surface, crispy smashed-potato edges with visible jagged texture, parsley garnish on potatoes, chives on chicken. Add a small ramekin of swirled sour cream + red chili crisp in the upper-left corner. Wooden cutting board surface, soft natural light from the left, slight depth-of-field blur on background. Maintain warm color temperature.

### Path B — ChatGPT text-to-image (studio, restyle)
> Studio overhead shot of a Mediterranean-style compartment dinner plate on a dark slate background. Three compartments: (1) 4-5 sliced strips of grilled boneless skinless chicken thigh with deep mahogany char marks and a slight glossy glaze from a sweet-tangy marinade; (2) 5-6 crispy smashed baby potatoes with golden-brown jagged edges and visible herb seasoning, garnished with chopped flat-leaf parsley; (3) a small swirl of pale sour cream topped with bright red Sichuan chili crisp showing visible chili flakes and oil droplets. Soft directional lighting from upper-left, sharp focus on the food, subtle steam rising from the chicken, warm wood-grain accent under the plate. Editorial food photography style, 4K, no text or watermarks.

## Next-rotation handoff (file as second doc when this build merges)

Recipe pick: **Lemon-Oregano-Yogurt Grilled Thighs with Cucumber-Tomato Salad + Tzatziki**

Why: Tushar's brutal review nailed it — current rotation is sweet/smoky/spicy across multiple meals. This pivot is herb-forward + citrus + dairy-tang, no sugar, no chili, completely different flavor architecture. Same grilling technique transfers — only marinade + sides + sauce change.

Sketch:
- Marinade: Greek yogurt + lemon juice + lemon zest + dried oregano + garlic + olive oil + salt
- 2-4 hr marinade (yogurt's lactic acid is gentler than salt — handles longer marinade unlike Dan-O's)
- Grill same way
- Sides: cucumber-tomato-red-onion salad (5 min) + warm pita or Joseph's lavash for low-carb option
- Sauce: tzatziki (Greek yogurt + grated cucumber + dill + lemon)
- Brands: Fage 5% or 0% Greek yogurt · McCormick dried oregano · Joseph's lavash (low-carb option)

## What to do in the fresh chat

```
cd ~/recipes-site
# Tell Claude: "Read RECIPE_HANDOFF.md and build the recipe per its locked decisions.
# Verify brand URLs + images for the 5 brands. Insert as id 37 in src/data/recipes.js.
# Ask me whether to swap Week 5 Friday or add as Week 9 before editing YourWeek.jsx + GroceryList.jsx."
```
