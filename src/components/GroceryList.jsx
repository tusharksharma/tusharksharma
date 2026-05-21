import { useState, useCallback, useEffect } from "react";
import track from "../hooks/useTrack";

// Base quantities at 4 servings. Scalable items have baseQty (number) + unit.
// Non-scalable items (pantry staples) have qty as string.
// All baseQty values are calibrated for 4 servings (2 adults + 2 kids).
// Items with baseQty scale with family size. Items with only qty are pantry
// staples or "buy 1" items that don't need scaling (seasonings, oil, etc).
const GROCERY_BY_WEEK = {
  // Week 1: Mon=Sandwiches(23), Wed=Smash Tacos(22), Fri=Air Fryer Chicken(21)
  1: {
    "Protein": [
      { name: "Kirkland chicken breast fillets", baseQty: 4, unit: "fillets", meal: "Mon" },
      { name: "99/1 ground chicken", baseQty: 24, unit: "oz", meal: "Wed" },
      { name: "Chicken thighs (boneless skinless)", baseQty: 2, unit: "lb", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Bettergoods Keto Hamburger Buns", baseQty: 4, unit: "buns", meal: "Mon adult" },
      { name: "Slider buns", baseQty: 4, unit: "buns", meal: "Mon kid" },
      { name: "Mission Zero Net Carbs tortillas", baseQty: 8, unit: "tortillas", meal: "Wed adult" },
      { name: "Mission Street Tacos flour tortillas", baseQty: 4, unit: "tortillas", meal: "Wed kid" },
      { name: "Dinner rolls", baseQty: 4, unit: "rolls", meal: "Fri kid" },
    ],
    "Vegetables": [
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Mon + Wed" },
      { name: "Pickles", qty: "1 jar", meal: "Mon" },
      { name: "Broccoli", baseQty: 16, unit: "oz", meal: "Fri" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Liquid Chipotle or Money Mustard", baseQty: 4, unit: "servings", meal: "Mon" },
      { name: "Spiceology Taco seasoning", qty: "pantry", meal: "Wed" },
      { name: "Bolthouse Farms Caesar dressing", baseQty: 8, unit: "tbsp", meal: "Wed" },
      { name: "Dan-O's Outlaw seasoning", qty: "pantry", meal: "Fri" },
      { name: "Dan-O's Original seasoning", qty: "pantry", meal: "Fri" },
      { name: "Dan-O's Cheesoning", qty: "pantry", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
      { name: "Lime", baseQty: 2, unit: "", meal: "Wed" },
      { name: "Fresh cilantro", baseQty: 1, unit: "bunch", meal: "Wed" },
    ],
    "Creamy Base": [
      { name: "Kraft Mild Cheddar shredded", baseQty: 4, unit: "oz", meal: "Wed" },
    ],
    "Kid Mode": [
      { name: "Ketchup", qty: "pantry", meal: "Mon kid" },
      { name: "Regular Caesar dressing", qty: "pantry", meal: "Wed kid" },
      { name: "Quest Tortilla Chips", baseQty: 1, unit: "bag", meal: "Wed" },
      { name: "Regular chips", baseQty: 1, unit: "bag", meal: "Wed kid" },
    ],
  },
  // Week 2: Mon=Stir-fry(4), Wed=Tri-tip Penne(2), Fri=Rice Bowl(24)
  2: {
    "Protein": [
      { name: "Ground beef or sirloin", baseQty: 1.25, unit: "lb", meal: "Mon" },
      { name: "Tri-tip steak", baseQty: 1.25, unit: "lb", meal: "Wed" },
      { name: "Gary's QuickSteak Sirloin", baseQty: 1, unit: "pack", meal: "Fri" },
      { name: "Earth's Best mini meatballs", baseQty: 1, unit: "bag", meal: "Kid swap" },
    ],
    "Carbs": [
      { name: "Rice", baseQty: 14, unit: "oz dry", meal: "Mon + Fri" },
      { name: "Penne pasta", baseQty: 8, unit: "oz", meal: "Wed" },
    ],
    "Vegetables": [
      { name: "Broccoli", baseQty: 12, unit: "oz", meal: "Mon" },
      { name: "Spinach", baseQty: 3, unit: "oz", meal: "Wed" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Soy sauce or tamari", qty: "pantry", meal: "Mon" },
      { name: "Sesame oil", qty: "pantry", meal: "Mon" },
      { name: "Roli Roti bone broth", baseQty: 32, unit: "oz", meal: "Mon + Wed" },
      { name: "Chicken bone broth", baseQty: 3, unit: "cups", meal: "Fri" },
      { name: "Kirkland Organic Ghee", qty: "pantry", meal: "Fri" },
      { name: "Turmeric", qty: "pantry", meal: "Fri" },
      { name: "Liquid Chipotle Sauce", baseQty: 4, unit: "servings", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
    ],
    "Creamy Base": [
      { name: "Cottage cheese", baseQty: 12, unit: "oz", meal: "Wed" },
      { name: "Fairlife fat-free milk", qty: "pantry", meal: "Sauce base" },
    ],
    "Kid Mode": [
      { name: "Shredded mild cheese", qty: "pantry", meal: "Kid topping" },
    ],
  },
  // Week 3: Mon=Gnocchi(1), Wed=Sandwiches(23), Fri=Quesadillas(27)
  3: {
    "Protein": [
      { name: "Chicken thighs or Del Real shredded", baseQty: 1.25, unit: "lb", meal: "Mon" },
      { name: "Kirkland chicken breast fillets", baseQty: 4, unit: "fillets", meal: "Wed" },
      { name: "Cooked chicken (pre-cooked)", baseQty: 10, unit: "oz", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Shelf-stable gnocchi", baseQty: 16, unit: "oz", meal: "Mon" },
      { name: "Bettergoods Keto Hamburger Buns", baseQty: 4, unit: "buns", meal: "Wed adult" },
      { name: "Slider buns", baseQty: 4, unit: "buns", meal: "Wed kid" },
      { name: "Carb-balance tortillas", baseQty: 4, unit: "tortillas", meal: "Fri adult" },
      { name: "Street taco tortillas", baseQty: 6, unit: "tortillas", meal: "Fri kid" },
    ],
    "Vegetables": [
      { name: "Bell peppers", baseQty: 2.5, unit: "", meal: "Mon + Fri" },
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Wed" },
      { name: "Pickles", qty: "1 jar", meal: "Wed" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Dan-O's Outlaw seasoning", qty: "pantry", meal: "Mon" },
      { name: "Lime", baseQty: 1, unit: "", meal: "Mon" },
      { name: "Liquid Chipotle or Money Mustard", baseQty: 4, unit: "servings", meal: "Wed" },
      { name: "Taco seasoning", qty: "pantry", meal: "Fri" },
      { name: "Chicken bone broth", baseQty: 1, unit: "cup", meal: "Fri" },
      { name: "Smoky Chipotle Crema", baseQty: 4, unit: "servings", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
    ],
    "Creamy Base": [
      { name: "Cottage cheese", baseQty: 12, unit: "oz", meal: "Mon" },
      { name: "Fat-free cheddar", baseQty: 3, unit: "oz", meal: "Fri" },
      { name: "Fairlife fat-free milk", qty: "pantry", meal: "Sauce base" },
    ],
    "Kid Mode": [
      { name: "Rao's Alfredo sauce", baseQty: 15, unit: "oz jar", meal: "Mon kid" },
      { name: "Ketchup", qty: "pantry", meal: "Wed kid" },
      { name: "Regular cheddar", baseQty: 3, unit: "oz", meal: "Fri kid" },
      { name: "Primal Kitchen Special Sauce", qty: "pantry", meal: "Fri kid" },
    ],
  },
  // Week 4: Mon=Steak & Fries(25), Wed=Smash Tacos(22), Fri=Sandwiches(23)
  // Week 4: Mon=Steak & Fries(25), Wed=Smash Tacos(22), Fri=Emergency Kebab Night(34)
  4: {
    "Protein": [
      { name: "Bavette steak", baseQty: 1.5, unit: "lb", meal: "Mon" },
      { name: "Pork breakfast patties", baseQty: 6, unit: "patties", meal: "Mon kid" },
      { name: "99/1 ground chicken", baseQty: 24, unit: "oz", meal: "Wed" },
      { name: "Colonel Kababz Chicken Seekh Kabab (8 large, 11 oz frozen)", baseQty: 1, unit: "box", meal: "Fri adult" },
      { name: "Colonel Kababz Beef Seekh Kabab (8 large, 11 oz frozen)", baseQty: 1, unit: "box", meal: "Fri kid" },
    ],
    "Carbs": [
      { name: "Checkers/Rally's frozen fries", baseQty: 4, unit: "servings", meal: "Mon" },
      { name: "Mission Zero Net Carbs tortillas", baseQty: 8, unit: "tortillas", meal: "Wed adult" },
      { name: "Mission Street Tacos flour tortillas", baseQty: 4, unit: "tortillas", meal: "Wed kid" },
      { name: "Vadilal Quick Treat Rumali Roti (6 pieces)", baseQty: 1, unit: "pack", meal: "Fri" },
    ],
    "Vegetables": [
      { name: "Baby carrots", baseQty: 1, unit: "bag", meal: "Mon kid" },
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Wed" },
      { name: "Red onion", baseQty: 1, unit: "medium", meal: "Fri adult" },
      { name: "Cucumber", baseQty: 1, unit: "medium", meal: "Fri" },
    ],
    "Sauce & Flavor": [
      { name: "SPG seasoning", qty: "pantry", meal: "Mon" },
      { name: "Spiceology Chimichurri seasoning", qty: "pantry", meal: "Mon" },
      { name: "Olive oil", qty: "pantry", meal: "Mon" },
      { name: "Red wine vinegar", qty: "pantry", meal: "Mon" },
      { name: "Chili flakes", qty: "pantry", meal: "Mon" },
      { name: "Spiceology Taco seasoning", qty: "pantry", meal: "Wed" },
      { name: "Bolthouse Farms Caesar dressing", baseQty: 8, unit: "tbsp", meal: "Wed" },
      { name: "Green chutney (store-bought cilantro-mint)", qty: "pantry", meal: "Fri adult" },
      { name: "Lime", baseQty: 2, unit: "", meal: "Wed + Fri" },
      { name: "Fresh cilantro", baseQty: 1, unit: "bunch", meal: "Wed" },
    ],
    "Creamy Base": [
      { name: "Kraft Mild Cheddar shredded", baseQty: 4, unit: "oz", meal: "Wed" },
    ],
    "Kid Mode": [
      { name: "Regular Caesar dressing", qty: "pantry", meal: "Wed kid" },
      { name: "Quest Tortilla Chips", baseQty: 1, unit: "bag", meal: "Wed" },
    ],
  },
  // Week 5: Mon=Tandoori Drumsticks(26), Wed=Buffalo Wing Night(33), Fri=Creamy Sausage Spinach Pasta(36)
  5: {
    "Protein": [
      { name: "Skinless chicken drumsticks", baseQty: 10, unit: "drumsticks", meal: "Mon" },
      { name: "Kinder's Buttery Buffalo Party Wings (19 oz frozen)", baseQty: 1, unit: "bag", meal: "Wed" },
      { name: "Falls Brand Mild Italian Sausage (24 oz / 1.5 lb tray)", baseQty: 2, unit: "tray", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Pete's Pasta Rotini (8 oz, high-protein)", baseQty: 2, unit: "bag", meal: "Fri adult" },
      { name: "Barilla Mini Penne (1 lb box)", baseQty: 1, unit: "box", meal: "Fri kid" },
      { name: "Rudi's Three Cheese Texas Toast", baseQty: 2, unit: "slices", meal: "Wed kid" },
    ],
    "Vegetables": [
      { name: "Cucumber", baseQty: 2, unit: "", meal: "Mon" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "Mon" },
      { name: "Baby carrots", baseQty: 1, unit: "lb", meal: "Wed" },
      { name: "Marketside Baby Spinach (11 oz clamshell)", baseQty: 1, unit: "container", meal: "Fri adult" },
      { name: "Lemon", baseQty: 2, unit: "", meal: "Mon + Wed (sauce)" },
      { name: "Fresh chives", baseQty: 1, unit: "bunch", meal: "Wed" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Shan Tandoori Masala", baseQty: 1, unit: "packet", meal: "Mon" },
      { name: "Lawry's seasoning", qty: "pantry", meal: "Mon kid" },
      { name: "Kala namak (black salt)", qty: "pantry", meal: "Mon" },
      { name: "Kashmiri chili", qty: "pantry", meal: "Mon" },
      { name: "Dan-O's SPG Tri-O (Salt-Pepper-Garlic)", qty: "pantry", meal: "Wed (sauce)" },
      { name: "Rao's Homemade Alfredo Sauce (15 oz jar)", baseQty: 2, unit: "jar", meal: "Fri" },
      { name: "Chicken bone broth", baseQty: 1, unit: "cup", meal: "Fri (sauce loosener)" },
      { name: "Red chili flakes", qty: "pantry", meal: "Fri adult" },
      { name: "Italian seasoning", qty: "pantry", meal: "Fri adult" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
    ],
    "Creamy Base": [
      { name: "Fat-free Greek yogurt", baseQty: 1.5, unit: "containers", meal: "Mon" },
      { name: "Daisy 2% Cottage Cheese (Wed: 150g for crema)", baseQty: 6, unit: "oz", meal: "Wed (sauce)" },
      { name: "365 Blue Cheese Crumbles (4 oz container)", baseQty: 1, unit: "container", meal: "Wed (sauce)" },
      { name: "Fairlife Fat-Free Lactose-Free milk", qty: "pantry", meal: "Wed (sauce)" },
    ],
    "Kid Mode": [
      { name: "Shredded mild cheese", qty: "pantry", meal: "Kid topping" },
      { name: "Naan bread", baseQty: 4, unit: "pieces", meal: "Mon kid" },
    ],
  },
  // Week 6: Mon=Chili Chicken(28), Wed=Beef Stir-fry(4), Fri=Rice Bowl(24)
  // Week 6: Mon=Chili Chicken(28), Wed=Beef Stir-fry(4), Fri=Dan-O's Thighs(31)
  6: {
    "Protein": [
      { name: "Kirkland chicken breast chunks", baseQty: 32, unit: "oz", meal: "Mon" },
      { name: "Ground beef or sirloin", baseQty: 1.25, unit: "lb", meal: "Wed" },
      { name: "Bone-in skin-on chicken thighs", baseQty: 8, unit: "thighs", meal: "Fri" },
      { name: "Earth's Best mini meatballs", baseQty: 1, unit: "bag", meal: "Kid swap" },
    ],
    "Carbs": [
      { name: "Rice", baseQty: 7, unit: "oz dry", meal: "Wed" },
      { name: "Toasted buns", baseQty: 4, unit: "buns", meal: "Mon kid" },
      { name: "Small flour tortillas", baseQty: 2, unit: "tortillas", meal: "Fri kid" },
    ],
    "Vegetables": [
      { name: "Bell peppers", baseQty: 16, unit: "oz", meal: "Mon" },
      { name: "Onion", baseQty: 2, unit: "large", meal: "Mon + Wed" },
      { name: "Broccoli", baseQty: 12, unit: "oz", meal: "Wed" },
      { name: "Asparagus", baseQty: 1.25, unit: "lb bunch", meal: "Fri" },
      { name: "Lemon (fresh)", baseQty: 1, unit: "lemon", meal: "Fri adult" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Kikkoman Thai Chili Sauce", qty: "pantry", meal: "Mon" },
      { name: "Ching's Red Chili Sauce", qty: "pantry", meal: "Mon" },
      { name: "Nakano Rice Vinegar", qty: "pantry", meal: "Mon" },
      { name: "Kikkoman Soy Sauce", qty: "pantry", meal: "Mon + Wed + Fri adult" },
      { name: "Sesame Chili Oil", qty: "pantry", meal: "Mon" },
      { name: "Dynasty Chili Crisp", qty: "pantry", meal: "Mon" },
      { name: "Jet Tila Umami Punch", qty: "pantry", meal: "Mon" },
      { name: "Sesame oil", qty: "pantry", meal: "Wed" },
      { name: "Roli Roti bone broth", baseQty: 32, unit: "oz", meal: "Wed" },
      { name: "Dan-O's Spicy Seasoning", qty: "pantry", meal: "Fri adult" },
      { name: "Dan-O's Original Seasoning", qty: "pantry", meal: "Fri kid" },
      { name: "Kraft Light Mayo", qty: "pantry", meal: "Fri adult" },
      { name: "Smash Kitchen Dijon Mustard", qty: "pantry", meal: "Fri adult" },
      { name: "Lee Kum Kee Chili Crisp Oil", qty: "pantry", meal: "Fri adult" },
      { name: "Olive oil", qty: "pantry", meal: "Fri" },
    ],
    "Creamy Base": [],
    "Kid Mode": [
      { name: "Raw mini peppers", baseQty: 1, unit: "bag", meal: "Mon kid" },
    ],
  },
  // Week 8: Mon=Creamy Steak Noodles(30), Wed=Smash Tacos(22), Fri=Sandwiches(23)
  8: {
    "Protein": [
      { name: "Steak (flat iron or sirloin)", baseQty: 1.25, unit: "lb", meal: "Mon" },
      { name: "99/1 ground chicken", baseQty: 24, unit: "oz", meal: "Wed" },
      { name: "Kirkland chicken breast fillets", baseQty: 4, unit: "fillets", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Wide egg noodles", baseQty: 12, unit: "oz", meal: "Mon" },
      { name: "Mission Zero Net Carbs tortillas", baseQty: 8, unit: "tortillas", meal: "Wed adult" },
      { name: "Mission Street Tacos flour tortillas", baseQty: 4, unit: "tortillas", meal: "Wed kid" },
      { name: "Bettergoods Keto Hamburger Buns", baseQty: 4, unit: "buns", meal: "Fri adult" },
      { name: "Slider buns", baseQty: 4, unit: "buns", meal: "Fri kid" },
    ],
    "Vegetables": [
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Wed + Fri" },
      { name: "Pickles", qty: "1 jar", meal: "Fri" },
      { name: "Fresh parsley", baseQty: 1, unit: "bunch", meal: "Mon + Wed" },
    ],
    "Sauce & Flavor": [
      { name: "Bettergoods Beef Bone Broth", baseQty: 2, unit: "cups", meal: "Mon" },
      { name: "Dijon mustard", qty: "pantry", meal: "Mon" },
      { name: "Worcestershire sauce", qty: "pantry", meal: "Mon" },
      { name: "Garlic powder", qty: "pantry", meal: "Mon" },
      { name: "Onion powder", qty: "pantry", meal: "Mon" },
      { name: "Spiceology Taco seasoning", qty: "pantry", meal: "Wed" },
      { name: "Bolthouse Farms Caesar dressing", baseQty: 8, unit: "tbsp", meal: "Wed" },
      { name: "Liquid Chipotle or Money Mustard", baseQty: 4, unit: "servings", meal: "Fri" },
      { name: "Lime", baseQty: 2, unit: "", meal: "Wed" },
      { name: "Fresh cilantro", baseQty: 1, unit: "bunch", meal: "Wed" },
    ],
    "Creamy Base": [
      { name: "Daisy Cottage Cheese 2%", baseQty: 1, unit: "containers", meal: "Mon" },
      { name: "Fairlife 2% milk", baseQty: 1, unit: "cups", meal: "Mon" },
      { name: "Kirkland Grass-Fed Butter", qty: "pantry", meal: "Mon" },
      { name: "All-purpose flour", qty: "pantry", meal: "Mon" },
      { name: "Kraft Mild Cheddar shredded", baseQty: 4, unit: "oz", meal: "Wed" },
    ],
    "Kid Mode": [
      { name: "Regular Caesar dressing", qty: "pantry", meal: "Wed kid" },
      { name: "Quest Tortilla Chips", baseQty: 1, unit: "bag", meal: "Wed" },
      { name: "Ketchup", qty: "pantry", meal: "Fri kid" },
    ],
  },
  // Week 7: Mon=Buldak Ramen(29), Wed=Quesadillas(27), Fri=Gnocchi(1)
  // Week 7: Mon=Buldak Ramen(29), Wed=Quesadillas(27), Fri=TKS Sweet Heat Bowl(35)
  7: {
    "Protein": [
      { name: "Bilinski's Cajun Chicken Sausage", baseQty: 2, unit: "pack", meal: "Mon" },
      { name: "Cooked chicken (pre-cooked)", baseQty: 10, unit: "oz", meal: "Wed" },
      { name: "Crazy Cuizine Mandarin Orange Chicken (frozen, discard packet sauce)", baseQty: 1, unit: "lb", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Buldak High Protein Ramen", baseQty: 2, unit: "pack", meal: "Mon adult" },
      { name: "Maruchan Chicken Ramen", baseQty: 2, unit: "pack", meal: "Mon kid" },
      { name: "Carb-balance tortillas", baseQty: 4, unit: "tortillas", meal: "Wed adult" },
      { name: "Street taco tortillas", baseQty: 6, unit: "tortillas", meal: "Wed kid" },
      { name: "Long-grain rice (for Sunday bone broth rice batch)", baseQty: 2, unit: "cups", meal: "Fri" },
    ],
    "Vegetables": [
      { name: "Bell peppers", baseQty: 1.5, unit: "", meal: "Wed" },
      { name: "Mini sweet peppers (Costco multicolor bag)", baseQty: 1, unit: "bag", meal: "Fri kid" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "Wed" },
      { name: "Scallions / green onions", baseQty: 1, unit: "bunch", meal: "Fri adult" },
      { name: "Fresh chives", baseQty: 1, unit: "bunch", meal: "Fri adult" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Kirkland Chicken Bone Broth", baseQty: 6, unit: "cups", meal: "Mon + Fri (rice base)" },
      { name: "Taco seasoning", qty: "pantry", meal: "Wed" },
      { name: "Smoky Chipotle Crema", baseQty: 4, unit: "servings", meal: "Wed" },
      { name: "Verka Organic Ginger Garlic Paste", qty: "pantry", meal: "Fri adult" },
      { name: "Dynasty Sesame Chili Oil", qty: "pantry", meal: "Fri adult" },
      { name: "Nakano Seasoned Rice Vinegar", qty: "pantry", meal: "Fri adult" },
      { name: "Kikkoman All-Purpose Soy Sauce", qty: "pantry", meal: "Fri adult" },
      { name: "Bare Bones Instant Chicken Bone Broth (15g packet)", baseQty: 1, unit: "packet", meal: "Fri adult" },
      { name: "Taste Flavor Co. Hot Honey Sriracha", qty: "pantry", meal: "Fri adult" },
      { name: "Jet Tila's Umami Punch (Spiceology)", qty: "pantry", meal: "Fri adult (fried rice)" },
      { name: "Huy Fong Sambal Oelek", qty: "pantry", meal: "Fri adult (fried rice)" },
      { name: "Toasted sesame seeds", qty: "pantry", meal: "Fri adult garnish" },
      { name: "Lime", baseQty: 1, unit: "", meal: "Wed" },
      { name: "Avocado oil", qty: "pantry", meal: "Fri (fried rice)" },
    ],
    "Creamy Base": [
      { name: "Fat-free cheddar", baseQty: 3, unit: "oz", meal: "Wed adult" },
    ],
    "Kid Mode": [
      { name: "Regular cheddar", baseQty: 3, unit: "oz", meal: "Wed kid" },
      { name: "Primal Kitchen Special Sauce", qty: "pantry", meal: "Wed kid" },
      { name: "Eggs (for adult fried rice)", baseQty: 2, unit: "", meal: "Fri adult" },
    ],
  },
};

function getGrocery(week) { return GROCERY_BY_WEEK[week] || GROCERY_BY_WEEK[1]; }

// Units that must be purchased as whole items — always round up.
// When a new GROCERY_BY_WEEK entry uses a unit not in this set, scaleQty falls back to
// fractional display (e.g. "~0.5 box"). validate-weeks.js asserts that every unit appearing
// in any week is either WHOLE_UNITS or in FRACTIONAL_UNITS — to prevent silent regressions.
const WHOLE_UNITS = new Set([
  "", // empty unit = bare count (e.g. "2 limes" stored as unit: "")
  "head", "bunch", "bag", "bags", "jar", "jars", "pack", "packs", "packet", "packets",
  "large", "medium", "small",
  "bottle", "bottles",
  "box", "boxes",
  "container", "containers",
  "tray", "trays",
  "buns", "fillets", "rolls", "tortillas", "slices", "pieces", "patties", "thighs", "kababs", "drumsticks", "wings",
  "servings",
  "lemon", "lemons", "lime", "limes", "cucumber", "cucumbers", "onion", "onions",
  "cup", "cups",
]);

// Units that legitimately stay fractional (weight/volume measures).
// Keep this set in sync with grocery data so validate-weeks.js can flag stragglers.
const FRACTIONAL_UNITS = new Set([
  "oz", "oz dry", "oz jar", "lb", "lb bunch",
  "tbsp", "tsp",
]);

// baseQty values are for 4 servings (2 adults + 2 kids standard).
// Kid-tagged items scale by kids only. Adult-tagged by adults only. Shared by total.
// Leftovers multiplier only applies if the item's day has reheats:true.
function isKidItem(entry) {
  return /kid/i.test(entry.meal);
}

function isAdultItem(entry) {
  return /adult/i.test(entry.meal);
}

function getItemDays(entry) {
  return entry.meal.split(/\s*\+\s*/).map((d) => d.trim().replace(/\s+(kid|adult)$/i, "").substring(0, 3));
}

function scaleQty(entry, adults, kids, leftovers, dayReheats) {
  if (entry.baseQty != null) {
    const base = isKidItem(entry) ? kids / 2 : isAdultItem(entry) ? adults / 2 : (adults + kids) / 4;
    // Per-day leftovers: split baseQty across tagged days, double only reheating days
    const days = getItemDays(entry);
    let leftoverMultiplier = 1;
    if (leftovers && dayReheats && days.length > 0) {
      const reheatCount = days.filter((d) => dayReheats[d]).length;
      // E.g., 2 days tagged, 1 reheats: multiplier = (1*2 + 1*1) / 2 = 1.5
      leftoverMultiplier = days.length > 0 ? (reheatCount * 2 + (days.length - reheatCount)) / days.length : 1;
    }
    const scale = base * leftoverMultiplier;
    const scaled = entry.baseQty * scale;
    // Suppress zero-quantity items (e.g. kid-only entries when kids = 0).
    if (scaled <= 0) return "";
    if (WHOLE_UNITS.has(entry.unit)) {
      const ceiled = Math.ceil(scaled);
      return `${ceiled} ${entry.unit}`.trim();
    }
    const rounded = Math.round(scaled * 10) / 10;
    const display = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `~${display} ${entry.unit}`.trim();
  }
  if (entry.qty === "pantry") return "";
  return entry.qty || "";
}

export default function GroceryList({ adults = 2, kids = 2, leftovers = true, dayReheats = {}, excludedTags = [], week = 1, planLabel = "" }) {
  const [checked, setChecked] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const GROCERY = getGrocery(week);
  const allItems = Object.values(GROCERY).flat();

  // Reset checked items when anything changes the shopping list
  useEffect(() => {
    setChecked(new Set());
  }, [week, adults, kids, leftovers, excludedTags]);

  // Filter out items based on excluded days AND adult/kid composition
  const isExcluded = (entry) => {
    // Hide kid items when no kids, adult items when no adults
    if (kids === 0 && isKidItem(entry)) return true;
    if (adults === 0 && isAdultItem(entry)) return true;
    // Check excluded day tags
    if (excludedTags.length === 0) return false;
    const tag = entry.meal;
    if (tag === "All" || tag === "Sauce base" || tag === "Kid swap" || tag === "Kid topping") return false;
    const tagDays = tag.split(/\s*\+\s*/).map((d) => d.trim().replace(/\s+(kid|adult)$/i, "").substring(0, 3));
    return tagDays.every((d) => excludedTags.includes(d));
  };

  const toggle = useCallback((idx) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const clearChecked = () => setChecked(new Set());

  const copyList = () => {
    const text = Object.entries(GROCERY)
      .map(([cat, items]) => {
        const visible = items.filter((i) => {
          if (isExcluded(i)) return false;
          // Drop baseQty items that scaled to zero.
          if (i.baseQty != null && scaleQty(i, adults, kids, leftovers, dayReheats) === "") return false;
          return true;
        });
        if (visible.length === 0) return null;
        return `${cat}:\n${visible.map((i) => `  - ${i.name}${scaleQty(i, adults, kids, leftovers, dayReheats) ? ` (${scaleQty(i, adults, kids, leftovers, dayReheats)})` : ""}`).join("\n")}`;
      })
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  // Build a set of visible item indices for accurate counting
  let countIdx = 0;
  const visibleIndices = new Set();
  allItems.forEach((entry) => {
    const idx = countIdx++;
    if (!isExcluded(entry)) visibleIndices.add(idx);
  });
  const visibleCount = visibleIndices.size;
  const checkedCount = [...checked].filter((idx) => visibleIndices.has(idx)).length;
  const allDone = checkedCount >= visibleCount && visibleCount > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); track("grocery_open", { week, adults, kids, leftovers }); }}
        className="w-full bg-amber-500 text-black font-bold rounded-xl py-3.5 text-sm hover:bg-amber-400 transition-colors cursor-pointer"
      >
        Shop This Week ({adults} adults{kids > 0 ? ` + ${kids} kids` : ""}{leftovers ? " + leftovers" : ""})
      </button>
    );
  }

  let globalIdx = 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">{planLabel || `Plan ${week}`} — Grocery List</h3>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer">Close</button>
        </div>
        <p className="text-neutral-500 text-xs">
          {adults} adults{kids > 0 ? ` + ${kids} kids` : ""} &middot; {3 - excludedTags.length} dinners{leftovers ? " &middot; doubled for leftovers" : ""}
        </p>
        {excludedTags.length > 0 && (
          <p className="text-amber-400 text-[10px] font-semibold mt-1">
            Shopping list updated for {3 - excludedTags.length} dinners
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px]">
          <span className="text-neutral-600">Included:</span>
          {["Mon", "Wed", "Fri"].map((d) => (
            <span key={d} className={excludedTags.includes(d) ? "text-neutral-700 line-through" : "text-neutral-400 font-semibold"}>
              {d}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => { copyList(); track("grocery_copy", { week }); }} className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
            Copy List
          </button>
          {checkedCount > 0 && (
            <button onClick={clearChecked} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
              Clear ({checkedCount})
            </button>
          )}
          <span className="text-neutral-600 text-xs ml-auto">{checkedCount}/{visibleCount}</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(GROCERY).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2.5">{category}</h4>
            <ul className="space-y-0.5">
              {items.map((entry) => {
                const idx = globalIdx++;
                if (isExcluded(entry)) return null;
                const isChecked = checked.has(idx);
                const qty = scaleQty(entry, adults, kids, leftovers, dayReheats);
                // Hide scaled-to-zero baseQty items (e.g. kid-only when kids = 0).
                // Pantry items keep showing (entry.baseQty undefined, qty === "" is normal).
                if (entry.baseQty != null && qty === "") return null;
                return (
                  <li key={idx} onClick={() => toggle(idx)} className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer select-none transition-colors">
                    <span className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center text-[10px] transition-colors ${isChecked ? "bg-amber-500 border-amber-500 text-black" : "border-neutral-600"}`}>
                      {isChecked && "\u2713"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold block transition-colors ${isChecked ? "text-neutral-600 line-through" : "text-neutral-100"}`}>
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {qty && <span className={`text-[10px] ${isChecked ? "text-neutral-700" : "text-neutral-500"}`}>{qty}</span>}
                        <span className="text-[10px] bg-neutral-800 text-neutral-600 px-1.5 py-0 rounded">{entry.meal}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Completion / efficiency */}
      {allDone ? (
        <div className="px-5 py-6 border-t border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-amber-400 font-black text-sm">Shopping list complete.</p>
          <p className="text-neutral-500 text-xs mt-1">3 dinners planned. One grocery run. You're set.</p>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <p className="text-neutral-500 text-xs text-center">
            One grocery run covers the whole plan. Same base ingredients reused across meals. Minimal waste.
          </p>
        </div>
      )}
    </div>
  );
}
