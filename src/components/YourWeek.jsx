import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes";
import GroceryList from "./GroceryList";

const ADULT_OPTIONS = [1, 2, 3, 4];
const KID_OPTIONS = [0, 1, 2, 3];

const WEEKS = {
  // ──────────────────────────────────────────────────────────
  // Each plan has a clear intention so users know which to pick.
  // Leftover days only show for meals where reheats: true.
  // ──────────────────────────────────────────────────────────
  1: {
    label: "Week 1",
    description: "Every dinner 25 min or less. All reheat for next-day leftovers.",
    subtitle: "Sandwiches, Smash Tacos, Air Fryer Chicken",
    cookDays: [
      { day: "Monday", label: "Fast Food Night", vibe: "15 min — crispy chicken sandwiches, better than drive-through", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
      { day: "Wednesday", label: "Smash Night", vibe: "15 min — crispy smash tacos, Caesar finish", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
      { day: "Friday", label: "Hands-Off Win", vibe: "25 min — air fryer does the work, you don't", id: 21, time: "25 min", reheats: true, adult: "Outlaw Blackened chicken, cheesy broccoli, Money Mustard", kid: "Original seasoned chicken, broccoli, dinner roll", needs: ["Chicken thighs", "Broccoli", "Dan-O's", "Dinner rolls"], carbLevel: "none" },
    ],
  },
  2: {
    label: "Week 2",
    description: "Hearty all-beef week. Bavette Monday opens with a low-carb showstopper, creamy tri-tip penne midweek, golden rice + steak Friday. Every meal reheats. Carb mix: low + high + high.",
    subtitle: "Bavette + Fries, Tri-tip Penne, Golden Rice Bowl",
    cookDays: [
      { day: "Monday", label: "Steak Night", vibe: "Bavette + chimichurri + air fryer fries — start strong with a low-carb showstopper", id: 25, time: "20 min", reheats: false, adult: "Bavette steak, chimichurri, fries", kid: "Pork patties, fries, carrots", needs: ["Bavette", "Fries", "Spiceology Chimichurri", "Pork patties"], carbLevel: "low" },
      { day: "Wednesday", label: "Cook Once, Win Twice", vibe: "Midweek — creamy pasta, weekend is handled", id: 2, time: "35 min", reheats: true, adult: "Chili cream sauce, Dan-O's, sliced tri-tip", kid: "Mild creamy penne, meatballs, cheese", needs: ["Tri-tip", "Penne", "Spinach", "Cottage cheese", "Beef broth"], carbLevel: "high" },
      { day: "Friday", label: "System Meal", vibe: "Golden rice reheats all week, steak is fresh in 10 min", id: 24, time: "25 min", reheats: true, adult: "Golden turmeric rice, seared steak, chipotle drizzle", kid: "Rice + steak, no sauce — rice already has flavor", needs: ["Rice", "Bone broth", "Gary's QuickSteak", "Ghee", "Turmeric"], carbLevel: "high" },
    ],
  },
  3: {
    label: "Week 3",
    description: "Different style every night. Gnocchi is best fresh — no leftover day for it.",
    subtitle: "Gnocchi, Chicken Sandwiches, Golden Rice Bowl",
    cookDays: [
      { day: "Monday", label: "Comfort + Protein", vibe: "Crispy gnocchi, creamy sauce — comfort that earns its calories", id: 1, time: "30 min", reheats: false, adult: "Spicy fajita cream, peppers, chili oil", kid: "Rao's Alfredo or mild creamy", needs: ["Chicken", "Gnocchi", "Bell peppers", "Cottage cheese", "Dan-O's"], carbLevel: "high" },
      { day: "Wednesday", label: "Fast Food Night", vibe: "15 min — crispy chicken sandwiches, better than drive-through", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
      { day: "Friday", label: "Quesadilla Night", vibe: "Crispy for adults, soft tacos for kids — same chicken", id: 27, time: "20 min", reheats: true, adult: "Crispy quesadilla + fajitas + chipotle sauce", kid: "Soft street tacos + Primal Kitchen sauce", needs: ["Chicken", "Carb-balance tortillas", "Street taco tortillas", "Cheddar", "Chipotle sauce"], carbLevel: "low" },
    ],
  },
  4: {
    label: "Week 4",
    description: "Steak Monday + Smash Tacos midweek + Emergency Kebab Night Friday. Bavette showstopper, frozen-to-plate rescue.",
    subtitle: "Steak & Fries, Smash Tacos, Emergency Kebab Night",
    cookDays: [
      { day: "Monday", label: "Steak Night", vibe: "Start strong — bavette + chimichurri + air fryer fries", id: 25, time: "20 min", reheats: false, adult: "Bavette steak, chimichurri, fries", kid: "Pork patties, fries, carrots", needs: ["Bavette", "Fries", "Spiceology Chimichurri", "Pork patties"], carbLevel: "low" },
      { day: "Wednesday", label: "Smash Night", vibe: "15 min — crispy smash tacos, Caesar finish", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
      { day: "Friday", label: "Emergency Dinner", vibe: "6 PM, nobody planned — frozen kebab + frozen rumali + 5 min salad = real Indian dinner in 20 min", id: 34, time: "20 min", reheats: true, adult: "Chicken seekh wrapped in rumali + red onion-cucumber-green chutney salad", kid: "Beef seekh + plain rumali + cucumber sticks", needs: ["Colonel Kababz Chicken Seekh", "Colonel Kababz Beef Seekh", "Vadilal Rumali Roti", "Red onion", "Cucumber", "Green chutney"], carbLevel: "high" },
    ],
  },
  5: {
    label: "Week 5",
    description: "Grill night Monday + Buffalo Wing Night midweek + creamy sausage-spinach pasta Friday. Adds the first pork protein to the rotation. Meal-preps into 8 containers.",
    subtitle: "Tandoori Drumsticks, Buffalo Wing Night, Creamy Sausage Spinach Pasta",
    cookDays: [
      { day: "Monday", label: "Grill Night", vibe: "Tandoori drumsticks — marinated overnight, grilled in 30 min", id: 26, time: "30 min", reheats: true, adult: "Shan tandoori drumsticks, onion salad, cucumber", kid: "Lawry's mild drumstick, cucumber, naan", needs: ["Drumsticks", "Greek yogurt", "Shan Tandoori Masala", "Lawry's", "Lemon"], carbLevel: "none" },
      { day: "Wednesday", label: "Wing Night", vibe: "Frozen wings + protein blue cheese crema = junk dinner becomes high-protein comfort", id: 33, time: "25 min", reheats: true, adult: "Sauced wings + crema dip + carrots + chives", kid: "Naked wings + crema dip + Rudi's Three Cheese Texas Toast", needs: ["Kinder's Buttery Buffalo wings", "Baby carrots", "Rudi's Three Cheese Texas Toast", "Daisy cottage cheese", "365 blue cheese", "Fairlife milk", "Dan-O's SPG", "Lemon", "Chives"], carbLevel: "low" },
      { day: "Friday", label: "Pasta Meal Prep", vibe: "Cook once, 8 meal-prep containers. Pete's rotini + Italian sausage + spinach for adults; Barilla mini penne + sausage only for kids", id: 36, time: "35 min", reheats: true, adult: "Pete's protein rotini + sausage-Alfredo + spinach + chili flakes + Italian seasoning", kid: "Barilla mini penne + sausage-Alfredo (no spinach, no spice)", needs: ["Falls Brand mild Italian sausage (3 lb)", "Pete's Pasta Rotini", "Barilla Mini Penne", "Rao's Homemade Alfredo (2 jars)", "Marketside baby spinach", "Chicken bone broth", "Chili flakes", "Italian seasoning"], carbLevel: "high" },
    ],
  },
  6: {
    label: "Week 6",
    description: "Takeout night, comfort stir-fry, easiest dinner. Three styles, balanced carbs.",
    subtitle: "Chili Chicken, Beef Stir-fry, Dan-O's Thighs",
    cookDays: [
      { day: "Monday", label: "Takeout Night", vibe: "Indo-Chinese chili chicken — glossy, spicy, restaurant-level", id: 28, time: "25 min", reheats: false, adult: "Glossy chili chicken, charred peppers, chili crisp", kid: "Plain air-fried chunks, toasted buns, raw peppers", needs: ["Kirkland chicken chunks", "Chili sauces", "Peppers", "Onions"], carbLevel: "none" },
      { day: "Wednesday", label: "Fast Win", vibe: "Lowest friction dinner of the week", id: 4, time: "25 min", reheats: true, adult: "Spicy soy-sesame, charred broccoli, chili oil", kid: "Mild soy, broccoli on side, meatballs", needs: ["Beef", "Broccoli", "Rice", "Soy sauce", "Bone broth"], carbLevel: "high" },
      { day: "Friday", label: "Easiest Dinner", vibe: "Two trays, two seasonings, one oven — the back of the bottle is the recipe", id: 31, time: "45 min", reheats: true, adult: "Dan-O's Spicy thighs, charred asparagus, Umami Lemon Heat drizzle", kid: "Dan-O's Original thigh, plain asparagus, folded wrap", needs: ["Bone-in skin-on thighs", "Asparagus", "Dan-O's Spicy", "Dan-O's Original", "Tortillas", "Mayo", "Lemon", "Soy sauce", "Dijon", "Chili oil"], carbLevel: "low", chainTo: { slug: "next-day-chicken-tacos", title: "Next-Day Chicken Tacos", note: "Chop the leftover thighs fine, save the pan juices, build tacos in 10 min" } },
    ],
  },
  7: {
    label: "Week 7",
    description: "Ramen night + quesadillas + TKS Sweet Heat Bowl. Asian-leaning week, all modular.",
    subtitle: "Buldak Ramen, Quesadillas, TKS Sweet Heat Bowl",
    cookDays: [
      { day: "Monday", label: "Ramen Night", vibe: "61g protein ramen in 15 min — Buldak for adults, Maruchan for kids", id: 29, time: "15 min", reheats: false, adult: "Spicy Buldak in bone broth, semi-dry, sausage", kid: "Maruchan chicken ramen + sausage", needs: ["Buldak ramen", "Maruchan", "Bilinski's sausage", "Bone broth"], carbLevel: "high" },
      { day: "Wednesday", label: "Quesadilla Night", vibe: "Crispy for adults, soft tacos for kids — same chicken", id: 27, time: "20 min", reheats: true, adult: "Crispy quesadilla + fajitas + chipotle sauce", kid: "Soft street tacos + mild sauce", needs: ["Chicken", "Tortillas", "Cheddar", "Peppers"], carbLevel: "low" },
      { day: "Friday", label: "Sweet Heat Bowl", vibe: "Crazy Cuizine chicken + TKS Sauce + fried rice. Drop the orange packet, stack the cookbook bases", id: 35, time: "20 min", reheats: true, adult: "Crispy chicken in TKS glaze + Spicy Umami Fried Rice + scallion-sesame garnish", kid: "Plain crispy chicken + half-serving bone broth rice + raw sweet peppers", needs: ["Crazy Cuizine chicken", "Bone broth rice (made ahead)", "TKS Sauce ingredients (ginger garlic paste, sesame chili oil, rice vinegar, soy, bone broth packet, hot honey sriracha)", "Mini sweet peppers"], carbLevel: "high" },
    ],
  },
  8: {
    label: "Week 8",
    description: "Comfort-heavy week. Creamy steak noodles + two fast favorites.",
    subtitle: "Creamy Steak Noodles, Smash Tacos, Chicken Sandwiches",
    cookDays: [
      { day: "Monday", label: "Comfort Bowl", vibe: "Creamy steak noodles — cottage cheese sauce, no cream, 31g protein", id: 30, time: "30 min", reheats: true, adult: "Chili flakes + parsley finish", kid: "Plain creamy noodles, optional butter", needs: ["Steak", "Egg noodles", "Cottage cheese", "Beef broth", "Fairlife"], carbLevel: "high" },
      { day: "Wednesday", label: "Smash Night", vibe: "15 min — crispy smash tacos, Caesar finish", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
      { day: "Friday", label: "Fast Food Night", vibe: "Finish easy — crispy chicken sandwiches, 15 min", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
    ],
  },
  9: {
    label: "Week 9",
    description: "Three nights, three signature sauces. Buffalo blue cheese crema Monday, chimichurri Wednesday, chili crisp sour cream Friday — sauce-anchored dinners that all reheat.",
    subtitle: "Buffalo Wings, Steak + Chimichurri, Outlaw Grilled Thighs",
    cookDays: [
      { day: "Monday", label: "Wing Night", vibe: "Frozen wings + protein blue cheese crema = junk dinner becomes high-protein comfort", id: 33, time: "25 min", reheats: true, adult: "Sauced wings + crema dip + carrots + chives", kid: "Naked wings + crema dip + Rudi's Three Cheese Texas Toast", needs: ["Kinder's Buttery Buffalo wings", "Baby carrots", "Rudi's Three Cheese Texas Toast", "Daisy cottage cheese", "365 blue cheese", "Fairlife milk", "Dan-O's SPG", "Lemon", "Chives"], carbLevel: "low" },
      { day: "Wednesday", label: "Steak Night", vibe: "Bavette + chimichurri + air fryer fries — midweek showstopper", id: 25, time: "20 min", reheats: false, adult: "Bavette steak, chimichurri, fries", kid: "Pork patties, fries, carrots", needs: ["Bavette", "Fries", "Spiceology Chimichurri", "Pork patties"], carbLevel: "low" },
      { day: "Friday", label: "Grill Night", vibe: "Outlaw Sweet & Tangy thighs over crispy smashed potatoes + chili crisp sour cream — split plate ends in a 3-compartment tray for the kid", id: 37, time: "30 min", reheats: true, adult: "Sliced grilled thighs + smashed potatoes + chili crisp sour cream", kid: "Diced chicken (no char) + smashed potatoes + plain sour cream dip in a 3-compartment tray", needs: ["Boneless thighs", "Little Potato Co. Savory Herb tray", "Dan-O's Outlaw Sweet & Tangy", "Lee Kum Kee Chiu Chow Chili Crisp", "Daisy Light Sour Cream"], carbLevel: "high" },
    ],
  },
  12: {
    label: "Week 12",
    description: "Pizza night Wednesday with no guilt. Different pizzas per eater + a 27g-protein Caesar Crunch salad that carries the macro budget. Bookended by pork lettuce wraps and a steak rice bowl.",
    subtitle: "Pork Lettuce Wraps, Caesar Crunch Pizza Night, Golden Garlic Rice + Steak",
    cookDays: [
      { day: "Monday", label: "Wrap Night", vibe: "SE-Asian pork mince in Sweet Gem lettuce — Lift Drizzle adult, mild cilantro-crema mince for kids", id: 38, time: "25 min", reheats: true, adult: "Pork mince + chilies + Lift Drizzle, Sweet Gem leaves", kid: "Pre-mixed mince with Herdez Avocado Cilantro + olive oil + bone broth, lettuce OR slider rolls", needs: ["NY Style 95% lean ground pork", "Tanimura & Antle Sweet Gem lettuce", "Verka ginger garlic paste", "Red Boat fish sauce", "Dynasty sesame chili oil", "Kikkoman soy", "ReaLemon", "Deep Coriander", "Dan-O's SPG", "Chosen avocado oil spray", "Green onions", "Fresh red Thai chilies", "Herdez Avocado Cilantro", "Chicken bone broth", "Dinner slider rolls", "Olive oil"], carbLevel: "low" },
      { day: "Wednesday", label: "Pizza Night", vibe: "Adults: 1/3 Bettergoods Margherita + Caesar Crunch Salad. Kids: personal Red Baron Deep Dish + small salad. Different pizzas, no slice-fairness fights.", id: 40, time: "20 min", reheats: true, adult: "1/3 Bettergoods Margherita + Caesar Crunch Salad with Dan-O's Jalapeño Cheesoning + optional Chipotle Crema", kid: "1 personal Red Baron Deep Dish (Pepperoni or Four Cheese) + small Caesar Crunch portion", needs: ["Soules Kitchen Fajita Chicken (2 pouches)", "Bettergoods Italian Wood-Fired Margherita Pizza", "Red Baron Deep Dish Singles (Pepperoni or Four Cheese, 2)", "Tanimura & Antle Sweet Gem", "Bolthouse Farms Creamy Caesar Parmigiano", "Quest Hot & Spicy Protein Chips", "Dan-O's Jalapeño Cheesoning", "Smoky Chipotle Crema (optional cookbook)"], carbLevel: "high" },
      { day: "Friday", label: "System Meal", vibe: "Golden turmeric rice reheats all week, steak is fresh in 10 min", id: 24, time: "25 min", reheats: true, adult: "Golden turmeric rice, seared steak, chipotle drizzle", kid: "Rice + steak, no sauce — rice already has flavor", needs: ["Rice", "Bone broth", "Gary's QuickSteak", "Ghee", "Turmeric"], carbLevel: "high" },
    ],
  },
  11: {
    label: "Week 11",
    description: "Restaurant-grade pork chops Monday with the new Cowboy Butter sauce + crusted snap peas. Smash tacos midweek. Creamy steak noodles Friday — three proteins, three formats, the cookbook side cross-links across two of them.",
    subtitle: "Pork Chops + Cowboy Butter, Smash Tacos, Creamy Steak Noodles",
    cookDays: [
      { day: "Monday", label: "Chops Night", vibe: "Herb-marinated pork chops + Parmesan Corn Chex snap peas + Cowboy Butter drizzle — restaurant-grade weeknight", id: 39, time: "30 min", reheats: true, adult: "Sliced chop + crusted snap peas + Cowboy Butter (herb-folded)", kid: "Diced chop + same snap peas + plain Cowboy Butter in dip well (3-compartment tray)", needs: ["Boneless pork loin chops", "Fresh rosemary", "Fresh thyme", "Garlic", "Kikkoman soy", "Lea & Perrins Worcestershire", "Smash Kitchen Dijon", "Smoked paprika", "Chili flakes", "Lemon", "Snap peas", "Kirkland Parmigiano Stravecchio", "Corn Chex", "Laughing Cow Light", "Kirkland bone broth", "Kirkland butter", "Fresh parsley", "Fresh chives"], carbLevel: "low" },
      { day: "Wednesday", label: "Smash Night", vibe: "15 min — crispy smash tacos, Caesar finish", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
      { day: "Friday", label: "Comfort Bowl", vibe: "Creamy steak noodles — cottage cheese sauce, no cream, 31g protein", id: 30, time: "30 min", reheats: true, adult: "Chili flakes + parsley finish", kid: "Plain creamy noodles, optional butter", needs: ["Steak", "Egg noodles", "Cottage cheese", "Beef broth", "Fairlife"], carbLevel: "high" },
    ],
  },
  10: {
    label: "Week 10",
    description: "Format variety week. Pork lettuce wraps Monday, golden garlic rice bowls midweek, Dan-O's bone-in thighs Friday. Three proteins, three vehicles, three sauces — no recipe repeats.",
    subtitle: "Pork Lettuce Wraps, Golden Garlic Rice + Steak, Dan-O's Bone-In Thighs",
    cookDays: [
      { day: "Monday", label: "Wrap Night", vibe: "SE-Asian pork mince in Sweet Gem lettuce — Lift Drizzle for adults, mild cilantro-crema mince for kids in slider rolls", id: 38, time: "25 min", reheats: true, adult: "Pork mince + chilies + Lift Drizzle on the side, Sweet Gem leaves", kid: "Pre-mixed mince with Herdez Avocado Cilantro crema + olive oil + bone broth, lettuce OR slider rolls", needs: ["NY Style 95% lean ground pork (2 packs)", "Tanimura & Antle Sweet Gem lettuce", "Verka ginger garlic paste", "Red Boat fish sauce", "Dynasty sesame chili oil", "Kikkoman soy sauce", "ReaLemon", "Deep Coriander", "Dan-O's SPG", "Chosen avocado oil spray", "Green onions", "Fresh red Thai chilies", "Herdez Avocado Cilantro", "Chicken bone broth", "Dinner slider rolls", "Olive oil"], carbLevel: "low" },
      { day: "Wednesday", label: "System Meal", vibe: "Golden turmeric rice reheats all week, steak is fresh in 10 min", id: 24, time: "25 min", reheats: true, adult: "Golden turmeric rice, seared steak, chipotle drizzle", kid: "Rice + steak, no sauce — rice already has flavor", needs: ["Rice", "Bone broth", "Gary's QuickSteak", "Ghee", "Turmeric"], carbLevel: "high" },
      { day: "Friday", label: "Easiest Dinner", vibe: "Two trays, two seasonings, one oven — the back of the bottle is the recipe", id: 31, time: "45 min", reheats: true, adult: "Dan-O's Spicy thighs, charred asparagus, Umami Lemon Heat drizzle", kid: "Dan-O's Original thigh, plain asparagus, folded wrap", needs: ["Bone-in skin-on thighs", "Asparagus", "Dan-O's Spicy", "Dan-O's Original", "Tortillas", "Mayo", "Lemon", "Soy sauce", "Dijon", "Chili oil"], carbLevel: "low", chainTo: { slug: "next-day-chicken-tacos", title: "Next-Day Chicken Tacos", note: "Chop the leftover thighs fine, save the pan juices, build tacos in 10 min" } },
    ],
  },
  13: {
    label: "Week 13",
    description: "Pasta comfort anchor Monday + low-carb Wed and Fri for balance. Three proteins (beef bacon, pork, chicken), three formats (creamy pasta, lettuce wraps, sandwiches), three flavor lanes — comfort, SE-Asian, fast food.",
    subtitle: "Creamy Beef Bacon Pasta, Pork Lettuce Wraps, Chicken Sandwiches",
    cookDays: [
      { day: "Monday", label: "Comfort Pasta", vibe: "Beef bacon + Carbe Diem keto penne + cottage-cheese-blended Alfredo — looks like restaurant comfort food at 350 cal / 28g protein per adult serving. Kids get plain wheat penne + jar Alfredo + their share of the bacon.", id: 41, time: "30 min", reheats: true, adult: "Carbe Diem Penne + blended cottage-cheese Alfredo + crispy beef bacon + parsley", kid: "Regular wheat penne + plain Rao's Alfredo + bacon folded in (no blend, no parsley)", needs: ["Godshall's Beef Bacon (2 packs = 20 slices)", "Carbe Diem Penne", "Regular wheat penne (kid)", "Daisy Low-Fat Cottage Cheese", "Laughing Cow Light wedges", "Rao's Homemade Alfredo", "Kirkland chicken bone broth", "Fresh parsley", "Black pepper"], carbLevel: "high" },
      { day: "Wednesday", label: "Wrap Night", vibe: "SE-Asian pork mince in Sweet Gem lettuce — Lift Drizzle adult, mild cilantro-crema mince for kids", id: 38, time: "25 min", reheats: true, adult: "Pork mince + chilies + Lift Drizzle, Sweet Gem leaves", kid: "Pre-mixed mince with Herdez Avocado Cilantro + olive oil + bone broth, lettuce OR slider rolls", needs: ["NY Style 95% lean ground pork", "Tanimura & Antle Sweet Gem lettuce", "Verka ginger garlic paste", "Red Boat fish sauce", "Dynasty sesame chili oil", "Kikkoman soy", "ReaLemon", "Deep Coriander", "Dan-O's SPG", "Chosen avocado oil spray", "Green onions", "Fresh red Thai chilies", "Herdez Avocado Cilantro", "Chicken bone broth", "Dinner slider rolls", "Olive oil"], carbLevel: "low" },
      { day: "Friday", label: "Fast Food Night", vibe: "15 min — crispy chicken sandwiches, better than drive-through", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
    ],
  },
  14: {
    label: "Week 14",
    description: "Build-your-own Monday + low-carb wings Wednesday + high-carb rice + steak Friday. Three proteins (pork, chicken, beef), three formats (taco plate, wings, rice bowl), three flavor lanes — Mexican bright, comfort food, golden warm-spice.",
    subtitle: "Carnitas Taco Plate, Buffalo Wing Night, Golden Garlic Rice + Steak",
    cookDays: [
      { day: "Monday", label: "Taco Plate", vibe: "15 min — Del Real carnitas seared + broth-braised, build-your-own taco plates. Kids get a compartment tray with separate components, adults get a white plate with onions + Lucky Dog hot sauce. One tray, four servings, zero prep beyond the skillet.", id: 42, time: "15 min", reheats: false, adult: "Carnitas + 3-4 corn tortillas + Wholly guac mini + Mezzetta pickled onions + Lucky Dog", kid: "Compartment tray: 2-3 corn tortillas + 2.5 oz carnitas + Wholly guac mini (no onions, no hot sauce)", needs: ["Del Real Slow-Cooked Carnitas (15 oz tray)", "Mission Yellow Corn Tortillas Super Soft", "Wholly Guacamole Classic Minis (6-cup pack)", "Mezzetta Pickled Red Onions", "Lucky Dog Hot Sauce", "Kirkland chicken bone broth"], carbLevel: "medium" },
      { day: "Wednesday", label: "Wing Night", vibe: "Frozen wings + protein blue cheese crema = junk dinner becomes high-protein comfort", id: 33, time: "25 min", reheats: true, adult: "Sauced wings + crema dip + carrots + chives", kid: "Naked wings + crema dip + Rudi's Three Cheese Texas Toast", needs: ["Kinder's Buttery Buffalo wings", "Baby carrots", "Rudi's Three Cheese Texas Toast", "Daisy cottage cheese", "365 blue cheese", "Fairlife milk", "Dan-O's SPG", "Lemon", "Chives"], carbLevel: "low" },
      { day: "Friday", label: "System Meal", vibe: "Golden turmeric rice reheats all week, steak is fresh in 10 min", id: 24, time: "25 min", reheats: true, adult: "Golden turmeric rice, seared steak, chipotle drizzle", kid: "Rice + steak, no sauce — rice already has flavor", needs: ["Rice", "Bone broth", "Gary's QuickSteak", "Ghee", "Turmeric"], carbLevel: "high" },
    ],
  },
  15: {
    label: "Week 15",
    description: "Highest-protein anchor Monday + low-carb Wednesday + high-carb pasta Friday. Three proteins (beef, chicken, pork), three formats (taco bowl, oven thighs, creamy pasta), three flavor lanes — Mexican high-protein, sheet-pan comfort, creamy Italian.",
    subtitle: "High-Protein Taco Bowls, Dan-O's Bone-In Thighs, Creamy Sausage Spinach Pasta",
    cookDays: [
      { day: "Monday", label: "Highest-Protein Anchor", vibe: "20 min — 93/7 lean beef + Quest Loaded Taco chips + Kraft fat-free cheddar = 67g protein / 500 cal / 7g net carbs per adult bowl. The highest-protein, lowest-net-carb dinner on the site. Kids get a compartment tray with Simply Tostitos + Tillamook Medium cheddar + same beef + Wholly guac.", id: 43, time: "20 min", reheats: false, adult: "Quest Loaded Taco chips bowl + cheesy fat-free-cheddar beef + iceberg + Roma + Wholly guac", kid: "Compartment tray: Simply Tostitos chips + medium-cheddar beef + Wholly guac + lettuce/Roma side bowl", needs: ["93/7 lean ground beef (1.25 lb)", "Spiceology Taco Seasoning Blend", "Quest Loaded Taco Protein Chips (2 bags)", "Simply Tostitos Organic Yellow Corn", "Kraft Fat-Free Shredded Cheddar", "Tillamook Medium Cheddar", "Wholly Guacamole Classic Minis (4)", "Iceberg lettuce", "Roma tomatoes (2)", "Kirkland chicken bone broth", "Cooking spray"], carbLevel: "low" },
      { day: "Wednesday", label: "Easiest Dinner", vibe: "Two trays, two seasonings, one oven — the back of the bottle is the recipe", id: 31, time: "45 min", reheats: true, adult: "Dan-O's Spicy thighs, charred asparagus, Umami Lemon Heat drizzle", kid: "Dan-O's Original thigh, plain asparagus, folded wrap", needs: ["Bone-in skin-on thighs", "Asparagus", "Dan-O's Spicy", "Dan-O's Original", "Tortillas", "Mayo", "Lemon", "Soy sauce", "Dijon", "Chili oil"], carbLevel: "low", chainTo: { slug: "next-day-chicken-tacos", title: "Next-Day Chicken Tacos", note: "Chop the leftover thighs fine, save the pan juices, build tacos in 10 min" } },
      { day: "Friday", label: "Pasta Meal Prep", vibe: "Cook once, 8 meal-prep containers. Pete's rotini + Italian sausage + spinach for adults; Barilla mini penne + sausage only for kids", id: 36, time: "35 min", reheats: true, adult: "Pete's protein rotini + sausage-Alfredo + spinach + chili flakes + Italian seasoning", kid: "Barilla mini penne + sausage-Alfredo (no spinach, no spice)", needs: ["Falls Brand mild Italian sausage (3 lb)", "Pete's Pasta Rotini", "Barilla Mini Penne", "Rao's Homemade Alfredo (2 jars)", "Marketside baby spinach", "Chicken bone broth", "Chili flakes", "Italian seasoning"], carbLevel: "high" },
    ],
  },
  16: {
    label: "Week 16",
    description: "Halal-cart Monday + low-carb pork chops Wednesday + creamy beef pasta Friday. Three proteins (chicken, pork, beef), three formats (rice bowl + chop-and-sauce + creamy pasta), three carb levels — medium, low, high.",
    subtitle: "Halal Cart Chicken Rice Bowls, Herb-Garlic Pork Chops, Chili Cream Tri-Tip Penne",
    cookDays: [
      { day: "Monday", label: "Halal Cart Night", vibe: "40 min — Trader Joe's shawarma chicken griddled with halal-cart edges, yellow basmati cooked in Kirkland bone broth + Bare Bones powder for a protein lift, Mezete toum + Shuug harissa for adults. Kid compartment tray gets toum drizzle only, no harissa. 550 cal / 50g protein adult bowl.", id: 44, time: "40 min", reheats: true, adult: "Yellow rice + chopped chicken + iceberg + Roma + Mezete toum + Shuug harissa", kid: "Compartment tray: rice + chicken with toum drizzle + lettuce/tomato side bowl (no harissa)", needs: ["Trader Joe's Shawarma Chicken Thighs (1.5 lb)", "Basmati rice (1 cup)", "Kirkland chicken bone broth", "Bare Bones Instant Bone Broth Powder (chicken, 15g stick)", "Ghee", "Turmeric, cumin, garlic powder, onion powder", "Iceberg lettuce", "Roma tomatoes (2)", "Mezete Toum sauce", "Shuug Original Harissa Hot Sauce", "Cooking spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Chops Night", vibe: "Herb-marinated pork chops + Parmesan Corn Chex snap peas + Cowboy Butter drizzle — restaurant-grade weeknight", id: 39, time: "30 min", reheats: true, adult: "Sliced chop + crusted snap peas + Cowboy Butter (herb-folded)", kid: "Diced chop + same snap peas + plain Cowboy Butter in dip well (3-compartment tray)", needs: ["Boneless pork loin chops", "Fresh rosemary", "Fresh thyme", "Garlic", "Kikkoman soy", "Lea & Perrins Worcestershire", "Smash Kitchen Dijon", "Smoked paprika", "Chili flakes", "Lemon", "Snap peas", "Kirkland Parmigiano Stravecchio", "Corn Chex", "Laughing Cow Light", "Kirkland bone broth", "Kirkland butter", "Fresh parsley", "Fresh chives"], carbLevel: "low" },
      { day: "Friday", label: "Cook Once, Win Twice", vibe: "Creamy chili cream sauce, tri-tip, penne — adults get heat, kids get mild creamy version with meatballs", id: 2, time: "35 min", reheats: true, adult: "Chili cream sauce, Dan-O's, sliced tri-tip over penne", kid: "Mild creamy penne, meatballs, cheese", needs: ["Tri-tip", "Penne", "Spinach", "Cottage cheese", "Beef broth"], carbLevel: "high" },
    ],
  },
  17: {
    label: "Week 17",
    description: "Two hands-off oven dinners bracket a midweek comfort pasta. Costco-shortcut pot pie Monday + creamy beef bacon pasta Wednesday + sheet-pan garlic-parm drumsticks Friday — three proteins (chicken, beef, chicken), three formats (puff-pastry bowl + creamy pasta + rack-roasted), three carb levels — medium, high, medium.",
    subtitle: "Chicken Pot Pie, Creamy Beef Bacon Pasta, Garlic Parm Drumsticks + Chipotle Corn",
    cookDays: [
      { day: "Monday", label: "Costco Shortcut Pot Pie", vibe: "50 min — Costco's Kirkland chipotle chicken does the protein lift; mushrooms + carrots + asparagus + Kirkland bone broth + flour roux become the filling. Pepperidge Farm puff pastry tops at 425°F × 20 min. Adult full bowl, kid half-bowl after a 5-min steam-off.", id: 46, time: "50 min", reheats: true, adult: "Full bowl + crack-the-pastry table moment", kid: "Half bowl cooled 5 min so the filling doesn't burn", needs: ["Kirkland chipotle-seasoned cooked chicken (18 oz)", "Mushrooms (4 oz)", "Carrots (4 oz)", "Asparagus (4 oz)", "Pepperidge Farm puff pastry (1 sheet)", "Martini & Rossi Extra Dry Vermouth (1/4 cup)", "Kirkland Organic Chicken Bone Broth (3 cups)", "All-purpose flour (1 oz)", "Egg (for wash)", "Chosen Foods avocado oil spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Comfort Pasta", vibe: "Beef bacon + Carbe Diem keto penne + cottage-cheese-blended Alfredo — looks like restaurant comfort food at 350 cal / 28g protein per adult serving. Kids get plain wheat penne + jar Alfredo + their share of the bacon.", id: 41, time: "30 min", reheats: true, adult: "Carbe Diem Penne + blended cottage-cheese Alfredo + crispy beef bacon + parsley", kid: "Regular wheat penne + plain Rao's Alfredo + bacon folded in (no blend, no parsley)", needs: ["Godshall's Beef Bacon (2 packs = 20 slices)", "Carbe Diem Penne", "Regular wheat penne (kid)", "Daisy Low-Fat Cottage Cheese", "Laughing Cow Light wedges", "Rao's Homemade Alfredo", "Kirkland chicken bone broth", "Fresh parsley", "Black pepper"], carbLevel: "high" },
      { day: "Friday", label: "Sheet-Pan Drumsticks", vibe: "50 min — 6 chicken drumsticks dry-rubbed with Dan-O's Cheesoning + baking powder for crispy skin, 3 ears corn on the same rack-over-sheet-pan setup. Adults finish with Smoky Chipotle Crema on the corn; kids get cucumber sticks + mayo on the side.", id: 45, time: "50 min", reheats: true, adult: "2 drumsticks + 1 full ear chipotle-crema corn", kid: "1 drumstick + 1/2 ear corn + cucumber sticks + mayo on the side", needs: ["Chicken drumsticks (6, bone-in skin-on)", "Corn on the cob (3 ears)", "Dan-O's Cheesoning (2 tbsp)", "Clabber Girl Baking Powder (1 tbsp)", "Smoky Chipotle Crema (2 tbsp — cookbook sauce)", "Chosen Foods Classic Mayo (1 tbsp)", "Persian cucumber (1 small)", "Garlic powder, salt, paprika"], carbLevel: "medium" },
    ],
  },
  18: {
    label: "Week 18",
    description: "Kid-approved formats engineered for adult macros. Smash burgers Monday (adult 93/7 keto-bun double / kid 80/20 brioche slider), pizza night Wednesday (adult Caesar Crunch + margherita / kid Red Baron deep-dish), Dan-O's air fryer chicken Friday. Three proteins (beef, chicken, chicken), three carb levels — medium, high, none.",
    subtitle: "Smash Burgers, Pizza Night, Air Fryer Chicken",
    cookDays: [
      { day: "Monday", label: "Burger Night", vibe: "30 min — one griddle, two beef grades (93/7 adult double, 80/20 kid slider). Bettergoods keto bun + In-N-Out-style spread with harissa for adults; Marketside brioche slider + bottled sauce + ketchup for kids. 490 cal / 51g protein adult plate.", id: 47, time: "30 min", reheats: false, adult: "Keto bun + 2x 93/7 smash patties + Velveeta + spread-with-harissa + Rally's fries", kid: "Brioche slider + 1x 80/20 patty + Velveeta + bottled sauce + 1/2 fries + ketchup", needs: ["93/7 ground beef (12 oz)", "80/20 ground beef (6 oz)", "Bettergoods Keto Friendly Hamburger Buns (2)", "Marketside Brioche Slider Rolls (2)", "Velveeta Original slices (6)", "Rally's Famous Fries (3 servings)", "Yellow mustard", "Light mayo", "Ketchup", "Pickle juice", "Harissa (Shuug or any)", "Dill pickles", "Bottled secret sauce (Heinz Special or similar)", "Kosher salt", "Cooking spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Pizza Night", vibe: "Adults: 1/3 Bettergoods Margherita + Caesar Crunch Salad. Kids: personal Red Baron Deep Dish + small salad. Different pizzas, no slice-fairness fights.", id: 40, time: "20 min", reheats: true, adult: "1/3 Bettergoods Margherita + Caesar Crunch Salad with Dan-O's Jalapeño Cheesoning + optional Chipotle Crema", kid: "1 personal Red Baron Deep Dish (Pepperoni or Four Cheese) + small Caesar Crunch portion", needs: ["Soules Kitchen Fajita Chicken (2 pouches)", "Bettergoods Italian Wood-Fired Margherita Pizza", "Red Baron Deep Dish Singles (Pepperoni or Four Cheese, 2)", "Tanimura & Antle Sweet Gem", "Bolthouse Farms Creamy Caesar Parmigiano", "Quest Hot & Spicy Protein Chips", "Dan-O's Jalapeño Cheesoning", "Smoky Chipotle Crema (optional cookbook)"], carbLevel: "high" },
      { day: "Friday", label: "Hands-Off Win", vibe: "25 min — air fryer does the work, you don't. Outlaw Blackened for adults, Original seasoned for kids, cheesy broccoli side.", id: 21, time: "25 min", reheats: true, adult: "Outlaw Blackened chicken, cheesy broccoli, Money Mustard", kid: "Original seasoned chicken, broccoli, dinner roll", needs: ["Chicken thighs", "Broccoli", "Dan-O's", "Dinner rolls"], carbLevel: "none" },
    ],
  },
  19: {
    label: "Week 19",
    description: "Grill-anchored week with three proteins + three carb levels. Fire-Grilled chicken thighs open Monday with a freezer-staple side (no chopping), creamy steak noodles midweek, herb-garlic pork chops close Friday with the Cowboy Butter drizzle. Chicken/beef/pork + medium/high/low.",
    subtitle: "Fire-Grilled Thighs, Creamy Steak Noodles, Pork Chops",
    cookDays: [
      { day: "Monday", label: "Grill Night", vibe: "25 min — 6 boneless thighs, one dry rub, one grill session. Frozen veggie side (Birds Eye Garlic Herb baby potato + green bean blend) — no chopping. Adults get 2 thighs + veggies (460 cal / 45g protein). Kids get 1 thigh + veggies + bread + dip.", id: 48, time: "25 min", reheats: true, adult: "2 grilled thighs + 1 serving frozen veggies (garlic-herb potato + green bean blend)", kid: "1 chopped thigh + 1/2 serving veggies + bread + dip (garlic mayo / Alfredo / Smoky Chipotle Crema / bottled)", needs: ["Boneless skinless chicken thighs (6)", "Frozen vegetable blend (Birds Eye Blue Endeavors Garlic Herb or any)", "Bread or dinner rolls (kid)", "Dip (garlic mayo, Alfredo, Smoky Chipotle Crema, Money Mustard, or bottled)", "Paprika", "Garlic powder", "Onion powder", "Dried oregano", "Cumin", "Salt", "Brown sugar", "Cayenne", "Avocado oil spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Comfort Bowl", vibe: "Creamy steak noodles — cottage cheese sauce, no cream, 31g protein", id: 30, time: "30 min", reheats: true, adult: "Chili flakes + parsley finish", kid: "Plain creamy noodles, optional butter", needs: ["Steak", "Egg noodles", "Cottage cheese", "Beef broth", "Fairlife"], carbLevel: "high" },
      { day: "Friday", label: "Chops Night", vibe: "Herb-marinated pork chops + Parmesan Corn Chex snap peas + Cowboy Butter drizzle — restaurant-grade weeknight", id: 39, time: "30 min", reheats: true, adult: "Sliced chop + crusted snap peas + Cowboy Butter (herb-folded)", kid: "Diced chop + same snap peas + plain Cowboy Butter in dip well (3-compartment tray)", needs: ["Boneless pork loin chops", "Fresh rosemary", "Fresh thyme", "Garlic", "Kikkoman soy", "Lea & Perrins Worcestershire", "Smash Kitchen Dijon", "Smoked paprika", "Chili flakes", "Lemon", "Snap peas", "Kirkland Parmigiano Stravecchio", "Corn Chex", "Laughing Cow Light", "Kirkland bone broth", "Kirkland butter", "Fresh parsley", "Fresh chives"], carbLevel: "low" },
    ],
  },
  20: {
    label: "Week 20",
    description: "One-pan cheesesteak Monday (adult Sola sliders + smoky chipotle crema / kid regular rolls + secret sauce), air fryer chicken Wednesday for a hands-off reset, herb-garlic pork chops Friday with Cowboy Butter. Beef / chicken / pork + medium / none / low.",
    subtitle: "Philly Sliders, Air Fryer Chicken, Pork Chops",
    cookDays: [
      { day: "Monday", label: "Slider Night", vibe: "40 min — one pan of Gary's QuickSteak + peppers + onions turns into two slider builds. Adults get 3 Sola sliders + smoky chipotle crema (470 cal / 40g protein). Kids get 3 regular slider rolls + Primal Kitchen secret sauce. Same beef, split at the bread + cheese + sauce.", id: 49, time: "40 min", reheats: true, adult: "3 Sola sliders + chipotle crema + thin provolone + fat-free mozz + Tari hot sauce", kid: "3 regular slider rolls + mayo + thin provolone (both sides) + Primal Kitchen secret sauce", needs: ["Gary's QuickSteak beef (6 pucks / 24 oz)", "Peppers + onions (12 oz, fresh or frozen)", "Bone broth (1/3 cup)", "Sola rolls (6, adult)", "Regular slider rolls (6, kid)", "Sargento thin provolone (18 slices)", "Fat-free mozzarella (3 oz)", "Smoky Chipotle Crema (cookbook sauce)", "Regular mayo", "Tari hot sauce (or any creamy hot sauce)", "Primal Kitchen secret sauce", "Taco seasoning", "Avocado oil spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Hands-Off Win", vibe: "25 min — air fryer does the work, you don't. Outlaw Blackened for adults, Original seasoned for kids, cheesy broccoli side.", id: 21, time: "25 min", reheats: true, adult: "Outlaw Blackened chicken, cheesy broccoli, Money Mustard", kid: "Original seasoned chicken, broccoli, dinner roll", needs: ["Chicken thighs", "Broccoli", "Dan-O's", "Dinner rolls"], carbLevel: "none" },
      { day: "Friday", label: "Chops Night", vibe: "Herb-marinated pork chops + Parmesan Corn Chex snap peas + Cowboy Butter drizzle — restaurant-grade weeknight", id: 39, time: "30 min", reheats: true, adult: "Sliced chop + crusted snap peas + Cowboy Butter (herb-folded)", kid: "Diced chop + same snap peas + plain Cowboy Butter in dip well (3-compartment tray)", needs: ["Boneless pork loin chops", "Fresh rosemary", "Fresh thyme", "Garlic", "Kikkoman soy", "Lea & Perrins Worcestershire", "Smash Kitchen Dijon", "Smoked paprika", "Chili flakes", "Lemon", "Snap peas", "Kirkland Parmigiano Stravecchio", "Corn Chex", "Laughing Cow Light", "Kirkland bone broth", "Kirkland butter", "Fresh parsley", "Fresh chives"], carbLevel: "low" },
    ],
  },
  21: {
    label: "Week 21",
    description: "Busy-day emergency dinner Monday (adult Carb Counter tacos / kid Wholly Guac + regular tortillas), Halal Cart chicken bowls Wednesday, Del Real Carnitas taco plates Friday (adult onions + Lucky Dog / kid compartment tray, no heat). Beef / chicken / pork + low / low / medium.",
    subtitle: "Busy-Day Taco Plates, Halal Cart Bowls, Carnitas Tacos",
    cookDays: [
      { day: "Monday", label: "Emergency Dinner", vibe: "10 min — Soules Kitchen family pack + 1/4 cup broth reheat = adult Carb Counter tacos with salsa roja + Khloud chips (420 cal / 40g protein) / kid regular tortillas + Wholly Guac + regular chips (deconstructed). One skillet, zero prep, cheaper than DoorDash.", id: 50, time: "10 min", reheats: true, adult: "3 La Banderita Carb Counter tacos + salsa roja + 1/2 serving Khloud protein chips", kid: "2 Mission regular tortillas + Wholly Guacamole mini + 1/2 serving regular chips (deconstructed tray)", needs: ["Soules Kitchen Street Taco Steak family pack (22 oz)", "La Banderita Carb Counter Street Taco tortillas (6)", "Mission regular Street Taco flour tortillas (4)", "Wholly Guacamole minis (2)", "Khloud Nacho Protein Chips (1 serving)", "Regular tortilla chips (1 serving)", "Chicken bone broth (1/4 cup)"], carbLevel: "low" },
      { day: "Wednesday", label: "Halal Cart Night", vibe: "40 min — yellow rice + shawarma chicken, adult bowl + kid compartment tray, white sauce + hot sauce split", id: 44, time: "40 min", reheats: true, adult: "Yellow rice bowl + shawarma chicken + white sauce + hot sauce", kid: "Deconstructed compartment tray + white sauce dip only", needs: ["Chicken thighs", "Basmati rice", "Turmeric", "White sauce base"], carbLevel: "low" },
      { day: "Friday", label: "Carnitas Night", vibe: "15 min — 1 Del Real Slow-Cooked Carnitas tray dropped frozen into a stainless skillet, fat drained after the initial sear, then broth-braised under a glass lid. Mission Yellow Corn tortillas warmed dry. Adults plate with Wholly Guac mini + Mezzetta pickled onions + Lucky Dog hot sauce; kids get a compartment tray with carnitas + tortillas + Wholly mini (no onions, no heat).", id: 42, time: "15 min", reheats: true, adult: "Del Real carnitas + Mission corn tortillas + Wholly Guac mini + Mezzetta pickled red onions + Lucky Dog hot sauce", kid: "Compartment tray — Del Real carnitas + Mission corn tortillas + Wholly Guac mini (no onions, no hot sauce)", needs: ["Del Real Slow-Cooked Carnitas (15 oz tray)", "Mission Yellow Corn Tortillas Super Soft", "Wholly Guacamole Classic Minis (adult + kid)", "Mezzetta Pickled Red Onions (adult)", "Lucky Dog Hot Sauce (adult)", "Kirkland Sipping Bone Broth (1/4 cup)"], carbLevel: "medium" },
    ],
  },
  22: {
    label: "Week 22",
    description: "Meal-prep pasta Monday (Pete's rotini + Italian sausage + spinach), tandoori drumsticks midweek (marinated overnight, grilled in 30 min), split-plate chili hot dogs Friday with a 12-serving chili base that also anchors a later chili mac / baked-potato night. Pork / chicken / beef + high / none / low.",
    subtitle: "Creamy Sausage Pasta, Tandoori Drumsticks, Chili Hot Dogs",
    cookDays: [
      { day: "Monday", label: "Pasta Meal Prep", vibe: "Cook once, 8 meal-prep containers. Pete's rotini + Italian sausage + spinach for adults; Barilla mini penne + sausage only for kids", id: 36, time: "35 min", reheats: true, adult: "Pete's protein rotini + sausage-Alfredo + spinach + chili flakes + Italian seasoning", kid: "Barilla mini penne + sausage-Alfredo (no spinach, no spice)", needs: ["Falls Brand mild Italian sausage (3 lb)", "Pete's Pasta Rotini", "Barilla Mini Penne", "Rao's Homemade Alfredo (2 jars)", "Marketside baby spinach", "Chicken bone broth", "Chili flakes", "Italian seasoning"], carbLevel: "high" },
      { day: "Wednesday", label: "Grill Night", vibe: "Tandoori drumsticks — marinated overnight, grilled in 30 min", id: 26, time: "30 min", reheats: true, adult: "Shan tandoori drumsticks, onion salad, cucumber", kid: "Lawry's mild drumstick, cucumber, naan", needs: ["Drumsticks", "Greek yogurt", "Shan Tandoori Masala", "Lawry's", "Lemon"], carbLevel: "none" },
      { day: "Friday", label: "Chili Dog Night", vibe: "45 min — 6 beef dogs + 12-serving chili base = 2 loaded adult chili dogs on keto buns (510 cal / 58g protein) + 2 deconstructed kid trays on regular buns. Cook once, reserve 6 chili servings for chili mac / baked potatoes later.", id: 51, time: "45 min", reheats: true, adult: "1.5 loaded chili dogs on Nature's Own keto buns + red onion + banana peppers + 1/2 Velveeta slice per dog", kid: "1 deconstructed chili dog on a Ball Park regular bun + 0.5 dog on the side + optional yellow mustard, plated on a divided tray", needs: ["Beef hot dogs (6)", "Nature's Own keto hot dog buns (3 adult)", "Ball Park regular hot dog buns (2 kid)", "Velveeta Original slices (3)", "93/7 grass-fed ground beef (2 lb)", "Spiceology Beef-Infused BBQ Rub (or paprika + garlic powder + onion powder + salt alternative)", "Dijon mustard", "Worcestershire sauce", "Tomato paste (6 oz)", "Chicken bone broth (1 cup)", "Red onion", "Banana peppers", "Yellow mustard (kid, optional)"], carbLevel: "low", chainTo: { slug: "hot-dog-chili-base", title: "Hot Dog Chili Base", note: "This dinner uses 6 of the 12-serving chili base. Save 6 for chili mac, baked potatoes, fries, or another chili dog night." } },
    ],
  },
  23: {
    label: "Week 23",
    description: "Costco-shortcut chicken pot pie Monday (Kirkland chipotle chicken + puff pastry, adult full / kid half after a steam-off), herb-garlic pork chops Wednesday with Cowboy Butter drizzle, weeknight picanha Friday with Whole Foods frozen greens + a Costco chimichurri shortcut and a deconstructed kid chicken-patty tray. Chicken / pork / beef + medium / low / none.",
    subtitle: "Chicken Pot Pie, Herb-Garlic Pork Chops, Weeknight Picanha",
    cookDays: [
      { day: "Monday", label: "Costco Shortcut Pot Pie", vibe: "50 min — Costco's Kirkland chipotle chicken does the protein lift; mushrooms + carrots + asparagus + Kirkland bone broth + flour roux become the filling. Pepperidge Farm puff pastry tops at 425°F × 20 min. Adult full bowl, kid half-bowl after a 5-min steam-off.", id: 46, time: "50 min", reheats: true, adult: "Full bowl + crack-the-pastry table moment", kid: "Half bowl cooled 5 min so the filling doesn't burn", needs: ["Kirkland chipotle-seasoned cooked chicken (18 oz)", "Mushrooms (4 oz)", "Carrots (4 oz)", "Asparagus (4 oz)", "Pepperidge Farm puff pastry (1 sheet)", "Martini & Rossi Extra Dry Vermouth (1/4 cup)", "Kirkland Organic Chicken Bone Broth (3 cups)", "All-purpose flour (1 oz)", "Egg (for wash)", "Chosen Foods avocado oil spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Chops Night", vibe: "30 min — herb-marinated pork chops seared medium-high, Parmesan Corn Chex snap peas roasted 18 min, adult Cowboy Butter drizzle folded with parsley + chives + chili flakes / kid plain sauce in the dip well. 450 cal / 50g protein per adult.", id: 39, time: "30 min", reheats: true, adult: "Sliced chop + crusted snap peas + Cowboy Butter (herb-folded)", kid: "Diced chop + same snap peas + plain Cowboy Butter in dip well (3-compartment tray)", needs: ["Boneless pork loin chops", "Fresh rosemary", "Fresh thyme", "Garlic", "Kikkoman soy", "Lea & Perrins Worcestershire", "Smash Kitchen Dijon", "Smoked paprika", "Chili flakes", "Lemon", "Snap peas", "Kirkland Parmigiano Stravecchio", "Corn Chex", "Laughing Cow Light", "Kirkland bone broth", "Kirkland butter", "Fresh parsley", "Fresh chives"], carbLevel: "low" },
      { day: "Friday", label: "Steak Night", vibe: "25 min — 12 oz picanha seared in one skillet, Whole Foods frozen European greens in a second (basil-and-garlic sauce built in), Costco Fotis chimichurri spooned over the adult plate. Steak skillet does triple duty: sear picanha → reheat kid chicken patties → toast slider buns in the residual beef fat. 480 cal / 40g protein per adult. Cross-link to No-Judge Chimichurri for the homemade alternative.", id: 52, time: "25 min", reheats: true, adult: "6 oz sliced picanha + basil-garlic frozen greens + Costco chimichurri", kid: "2 chopped Amylu chicken patties + 1/2 serving frozen greens + 1 toasted slider bun (deconstructed tray)", needs: ["Picanha steaks (12 oz)", "Amylu chicken breakfast patties (4)", "Whole Foods European Greens with Basil & Garlic Sauce (frozen, 3 label servings)", "Fotis Fine Foods Chimichurri (Costco, refrigerated)", "Slider buns (2 kid)", "Salt", "Avocado-oil cooking spray"], carbLevel: "none", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The homemade alternative to the Costco jar — for full control over herbs, garlic, and acid." } },
    ],
  },
  24: {
    label: "Week 24",
    description: "Chain-from Chili Mac meal prep Monday (8 containers from Chili Hot Dogs' reserved chili — one cook, two family dinners), Indo-Chinese Chili Chicken Wednesday with an adult-vs-kid heat split, SE-Asian pork mince lettuce wraps Friday (adult Lift Drizzle / kid cilantro-crema in slider rolls). Beef / chicken / pork + medium / none / low.",
    subtitle: "Chili Mac Meal Prep, Indo-Chinese Chili Chicken, Pork Mince Wraps",
    cookDays: [
      { day: "Monday", label: "Chain-From Meal Prep", vibe: "35 min — 6 reserved servings of Hot Dog Chili Base (from Chili Hot Dogs earlier in the sequence) + blended cottage-cheese-and-Velveeta sauce + two pastas (Carbe Diem elbows adult, Barilla regular kid) = 8 meal-prep containers. ~380 cal / 39g protein per adult container. Kid macros intentionally not published pending label recalc.", id: 53, time: "35 min", reheats: true, adult: "Carbe Diem elbows + full chili serving + blended cottage-cheese-and-Velveeta sauce", kid: "Barilla regular elbows + half chili serving + same sauce base (softer chew, familiar pasta shape)", needs: ["Hot Dog Chili Base (6 reserved servings from Chili Hot Dogs)", "Carbe Diem or Pete's higher-fiber elbows (8 oz dry, adult)", "Barilla regular elbows (6 oz dry, kid)", "Cottage cheese (~300 g)", "Fairlife fat-free ultra-filtered milk (1/2 cup)", "Nutritional yeast (2 tbsp)", "Cheddar cheese powder (2 tbsp)", "Velveeta Original slices (3 oz)", "Kirkland chicken bone broth (3/8 cup)"], carbLevel: "medium", chainFrom: { slug: "chili-hot-dogs", title: "Split Plate Chili Hot Dogs", note: "This meal prep uses the 6 reserved servings from Chili Hot Dogs' 12-serving chili base. Second family dinner without another cook." } },
      { day: "Wednesday", label: "Indo-Chinese Night", vibe: "25 min — air-fried breaded chicken tossed in an Indo-Chinese chili-garlic-soy sauce for adults, plain seasoned nuggets for kids. Bold heat + soy depth without the takeout cost.", id: 28, time: "25 min", reheats: true, adult: "Chili-garlic-soy sauced chicken + green onion + red chili", kid: "Plain seasoned breaded chicken bites, no sauce", needs: ["Breaded chicken breast strips or nuggets", "Kikkoman soy sauce", "Rice vinegar", "Ginger", "Garlic", "Fresh red Thai chilies (or dried)", "Green onions", "Cornstarch", "Sesame oil"], carbLevel: "none" },
      { day: "Friday", label: "Wrap Night", vibe: "25 min — SE-Asian pork mince in Sweet Gem lettuce for adults with Lift Drizzle + fresh red chilies, pre-mixed cilantro-crema mince for kids in slider rolls (softer + familiar). One skillet, two builds.", id: 38, time: "25 min", reheats: true, adult: "Pork mince + chilies + Lift Drizzle, Sweet Gem leaves", kid: "Pre-mixed mince with Herdez Avocado Cilantro + olive oil + bone broth, lettuce OR slider rolls", needs: ["NY Style 95% lean ground pork", "Tanimura & Antle Sweet Gem lettuce", "Verka ginger garlic paste", "Red Boat fish sauce", "Dynasty sesame chili oil", "Kikkoman soy", "ReaLemon", "Deep Coriander", "Dan-O's SPG", "Chosen avocado oil spray", "Green onions", "Fresh red Thai chilies", "Herdez Avocado Cilantro", "Chicken bone broth", "Dinner slider rolls", "Olive oil"], carbLevel: "low" },
    ],
  },
  25: {
    label: "Week 25",
    description: "Freezer-shortcut beef kebab pitas Monday (one air-fry cook — loaded adult pita with quick tzatziki + Shuug / deconstructed kid tray with hummus, 7-year-old asked for another kebab), air fryer chicken thighs + cheesy broccoli Wednesday (Outlaw Blackened adult / Original mild kid, zero pan-watching), steak & fries with no-judge chimichurri Friday (bavette + Spiceology chimichurri adult / pork breakfast patties + carrots kid). Beef / chicken / beef + medium / none / low.",
    subtitle: "Freezer Kebab Pitas, Hands-Off Chicken Thighs, Steak & Fries",
    cookDays: [
      { day: "Monday", label: "Freezer Shortcut Night", vibe: "20 min — 6 fully cooked Mediterranean beef kebabs air-fried 7-8 min from a freezer pouch (follow package temp), quick tzatziki blended from Greek yogurt + drained cucumber + thawed frozen garlic + lemon. Adults get a loaded pita with lettuce/tomatoes/pickled onions + 2 kebabs + Shuug harissa; kids get a deconstructed tray with 1 kebab + pita wedges + hummus + salad. Photographed 7-year-old asked for another kebab. ~400 cal / 30g protein per adult. Kid macros intentionally not published — parents pick the portion.", id: 54, time: "20 min", reheats: true, adult: "Loaded pita: tzatziki + lettuce + tomatoes + pickled red onion + 2 kebabs + Shuug", kid: "Deconstructed tray: 1 kebab + pita wedges + hummus + salad (no Shuug)", needs: ["Fully cooked Mediterranean beef kebabs (6 + up to 2 spare for hungrier kids)", "Pita bread (4)", "Plain 0% Greek yogurt (5.3 oz)", "Cucumber (1/2)", "Frozen garlic cubes", "Lemon", "Iceberg lettuce (shredded)", "Cherry or grape tomatoes", "Pickled red onions", "Prepared hummus (kid)", "Shuug Original Harissa Hot Sauce (adult)", "Avocado oil spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Hands-Off Win", vibe: "25 min — chicken thighs seasoned two ways (Outlaw Blackened Bloody Mary adult / Dan-O's Original mild kid) into the air fryer together, frozen broccoli finished with Dan-O's Cheesoning while hot (the transformer). Adults get bold + extra veg, kids get mild + a dinner roll. Zero pan-watching. ~42g protein / 380 cal per adult.", id: 21, time: "25 min", reheats: true, adult: "Outlaw Blackened chicken thighs + cheesy broccoli + optional Money Mustard", kid: "Original-seasoned thigh (cubed if needed) + broccoli + dinner roll", needs: ["Chicken thighs (boneless skinless, 6-8)", "Frozen broccoli florets", "Dan-O's Original", "Dan-O's Outlaw Blackened Bloody Mary", "Dan-O's Cheesoning", "Dinner rolls (kid)", "Money Mustard (optional adult)", "Chosen avocado oil spray", "Salt"], carbLevel: "none" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  26: {
    label: "Week 26",
    description: "Emergency Shortcut Week — three fridge-and-freezer rescue dinners. 15-min chicken tikka masala split-plate Monday (Sukhi's Costco pouches + Vadilal rumali + adult Kashmiri chili upgrade / kid deconstructed mild, 540 cal / 50g protein adult), Colonel Kababz frozen kebab emergency Wednesday (adult chicken seekh + green chutney salad / kid beef seekh + plain rumali), Soules Kitchen steak street tacos Friday (adult Carb Counter + Khloud chips / kid regular tortillas + Wholly Guac). Chicken / mixed / beef + medium / high / low.",
    subtitle: "15-Min Tikka Masala, Emergency Kebab Night, Soules Kitchen Tacos",
    cookDays: [
      { day: "Monday", label: "Emergency Tikka Night", vibe: "15 min — 2 sealed Sukhi's Costco tikka masala pouches warm in hot tap water while 7 Vadilal frozen rumali rotis thaw. Empty into a saucepan, pan-heat 5 min. SPLIT AT THE POT BEFORE THE CHILI — remove 3 servings for the kids' plates, THEN stir 1 tsp Kashmiri chili into the 4 remaining adult servings. Adults get 2 tikka servings + 2 rotis plated (540 cal / 50g protein). Kids get 1.5 servings + 1.5 rotis in a compartment tray, chicken + gravy + rotis kept separate for self-dipping (405 cal / 38g protein). Halal claim = verify the physical Sukhi's package.", id: 55, time: "15 min", reheats: true, adult: "2 tikka masala servings + 2 rumali rotis + 1 tsp Kashmiri chili stirred in AFTER the kid split", kid: "1.5 tikka servings + 1.5 rotis, deconstructed in a compartment tray (chicken + gravy + rotis separate, mild)", needs: ["Sukhi's Costco chicken tikka masala twin-pack (36 oz / 2 x 18 oz pouches)", "Vadilal frozen rumali rotis (7 rotis, ~40g each)", "Kashmiri chili powder (1 tsp, adult only)", "Water (hot tap, for warming sealed pouches)"], carbLevel: "medium" },
      { day: "Wednesday", label: "Emergency Kebab Night", vibe: "20 min — Colonel Kababz frozen seekh kebabs (chicken adult / beef kid) into the air fryer, Vadilal rumali rotis warmed dry, 5-min red onion + cucumber + green chutney salad. Real Indian dinner from nothing but the freezer. Adult wrapped seekh + salad; kid gets a plain rumali + beef seekh + cucumber sticks. Emergency-tier stock item.", id: 34, time: "20 min", reheats: true, adult: "Chicken seekh wrapped in rumali + red onion-cucumber-green chutney salad", kid: "Beef seekh + plain rumali + cucumber sticks", needs: ["Colonel Kababz Chicken Seekh", "Colonel Kababz Beef Seekh", "Vadilal Rumali Roti", "Red onion", "Cucumber", "Green chutney"], carbLevel: "high" },
      { day: "Friday", label: "Emergency Taco Night", vibe: "10 min — Soules Kitchen family pack + 1/4 cup broth reheat = adult Carb Counter tacos with salsa roja + Khloud chips (420 cal / 40g protein) / kid regular tortillas + Wholly Guac + regular chips (deconstructed). One skillet, zero prep, cheaper than DoorDash. Third emergency dinner of the week — this is the freezer + fridge doing full lifting.", id: 50, time: "10 min", reheats: true, adult: "3 La Banderita Carb Counter tacos + salsa roja + 1/2 serving Khloud protein chips", kid: "2 Mission regular tortillas + Wholly Guacamole mini + 1/2 serving regular chips (deconstructed tray)", needs: ["Soules Kitchen Street Taco Steak family pack (22 oz)", "La Banderita Carb Counter Street Taco tortillas (6)", "Mission regular Street Taco flour tortillas (4)", "Wholly Guacamole minis (2)", "Khloud Nacho Protein Chips (1 serving)", "Regular tortilla chips (1 serving)", "Chicken bone broth (1/4 cup)"], carbLevel: "low" },
    ],
  },
  27: {
    label: "Week 27",
    description: "Viral Tomato Feta Batch Week — one Sunday bake yields three family dinners. 600 g cherry + pear tomatoes and two 8 oz feta blocks roast at 400°F for 45 min while 2 lb chicken thighs air-fry in parallel. Mash into a creamy sauce, split 2:1, fold into low-carb penne (adult, 2 oz dry per container) and regular penne (smaller portion, 1.5 oz dry). Six adult containers + six smaller = Mon / Wed / Fri family dinners for 2 adults + 2 kids. ~450 cal / 37g protein per adult plate. Adult carb / portion split; kid portions adjust to appetite.",
    subtitle: "Viral Tomato Feta Chicken Pasta — batch cook once, reheat Mon / Wed / Fri",
    cookDays: [
      { day: "Monday", label: "Viral Tomato Feta Batch Cook", vibe: "60 min — one sheet-pan bake at 400°F, 45 min, roasts 600 g tomatoes + two 8 oz feta blocks in olive oil + Mediterranean seasoning. In parallel: air-fry 2 lb chicken thighs 20 min (verify safe internal temp). Mash the baked feta and tomatoes into a creamy sauce with visible pieces, chop the chicken. Split the sauce 2:1 into two pastas — 12 oz low-carb penne (adults) + 9 oz regular penne (kids). Pack 6 + 6 for the week. ~450 cal / 37g protein per adult container.", id: 56, time: "60 min", fixedBatch: true, batchCoversDays: ["Mon", "Wed", "Fri"], adult: "2 oz dry low-carb penne + full sauce-and-chicken unit (~450 cal / 37g protein)", kid: "1.5 oz dry regular penne + half sauce-and-chicken unit (portion adjusts to appetite)", needs: ["Cherry + pear tomatoes (600 g)", "Feta cheese blocks (two 8 oz — BLOCK feta only)", "Olive oil", "Mediterranean or Greek seasoning (Spiceology Greek Freak shown)", "Chicken thighs (2 lb, pre-seasoned Mediterranean shortcut or plain)", "Low-carb penne (12 oz dry — adult)", "Regular penne (9 oz dry — kid)"], carbLevel: "low" },
      { day: "Wednesday", label: "Viral Tomato Feta Reheat (Round 2)", vibe: "10 min — pull two adult containers + two smaller containers from Monday's batch. Reheat covered microwave 60-90 sec with a splash of water if the pasta has tightened, or a covered skillet on low. Same sauce, same chicken, same split — the batch does the work.", id: 56, time: "10 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult container from Mon batch (~450 cal / 37g protein)", kid: "Reheated smaller container from Mon batch (portion adjusts to appetite)", needs: [], carbLevel: "low" },
      { day: "Friday", label: "Viral Tomato Feta Reheat (Round 3)", vibe: "10 min — final two adult + two smaller containers from Monday's batch. Reheat gently, add a spoon of water if the pasta has soaked up the sauce. Three family dinners from one Sunday cook.", id: 56, time: "10 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult container from Mon batch (~450 cal / 37g protein)", kid: "Reheated smaller container from Mon batch (portion adjusts to appetite)", needs: [], carbLevel: "low" },
    ],
  },
  28: {
    label: "Week 28",
    description: "Slop Bowl Debut Week — Max Cooks' viral beef-and-potato bowl, Split Plate rebuild. Monday: 24 oz Yukon Gold potatoes roast at 450°F while 24 oz 93/7 ground beef browns in parallel. Split at plating — adults get the new high-protein chipotle cheddar sauce (70 cal / 8g protein per 1/4 batch) + Mt. Olive jalapeños (620 cal / 62g protein), young-kid plates get half portions deconstructed with melted Velveeta + crunchy veg. Wednesday chicken tikka masala emergency, Friday steak-and-fries. Adult presentation / heat / portion split; kid portions adjust to appetite. Also introduces High-Protein Chipotle Cheddar Sauce as a new powerup — the batch makes 4 servings; Monday uses 2, the other 2 hold in the fridge for pasta or vegetables later.",
    subtitle: "Slop Bowl Debut + Tikka Emergency + Steak Night",
    cookDays: [
      { day: "Monday", label: "Slop Bowl Debut", vibe: "55 min — one sheet pan + one skillet. Dice 24 oz Yukon Gold potatoes, spray light, SPG, roast 450°F 40 min (toss halfway). Brown 24 oz 93/7 ground beef with SPG in parallel. Blend the linked High-Protein Chipotle Cheddar Sauce (cottage cheese + cheddar powder + nutritional yeast + fat-free ultra-filtered milk + Smoky Chipotle Crema). Split at plating: adults get 8 oz raw-weight potatoes + 8 oz raw-weight beef + 1 sauce serving + Mt. Olive jalapeños (~620 cal / 62g protein); young-kid plates get half-portions deconstructed with melted Velveeta + cucumber or carrot sticks. Sauce batch = 4 servings; dinner uses 2, refrigerate the other 2 for pasta or vegetables later in the week.", id: 57, time: "55 min", reheats: true, adult: "8 oz raw potatoes + 8 oz raw beef + 1 serving High-Protein Chipotle Cheddar Sauce + Mt. Olive jalapeños (~620 cal / 62g protein)", kid: "Half-portion deconstructed — potatoes + beef + melted Velveeta on the side + cucumber or carrot sticks (no jalapeños)", needs: ["Yukon Gold or yellow potatoes (24 oz raw)", "93/7 lean ground beef (24 oz raw)", "Avocado-oil spray", "SPG (salt, pepper, garlic powder)", "Good Culture 2% cottage cheese (150 g for the sauce)", "Fairlife fat-free ultra-filtered milk (6 tbsp for the sauce)", "Cheddar cheese powder (1 tbsp for the sauce)", "Nutritional yeast (1 tbsp for the sauce)", "Smoky Chipotle Crema (2 tbsp for the sauce — from cookbook batch)", "Mt. Olive pickled jalapeño slices (adult)", "Velveeta or mild melting cheese (kid)", "Cucumber or carrot sticks (kid)"], carbLevel: "moderate", chainTo: { slug: "high-protein-chipotle-cheddar-sauce", title: "High-Protein Chipotle Cheddar Sauce", note: "Batch the sauce once — Monday uses 2 of 4 servings; the other 2 hold for pasta, vegetables, or a second bowl later in the week." } },
      { day: "Wednesday", label: "Emergency Tikka Night", vibe: "15 min — 2 sealed Sukhi's Costco tikka masala pouches warm in hot tap water while 7 Vadilal frozen rumali rotis thaw. Empty into a saucepan, pan-heat 5 min. SPLIT AT THE POT BEFORE THE CHILI — remove 3 servings for the kids' plates, THEN stir 1 tsp Kashmiri chili into the 4 remaining adult servings. Adults get 2 tikka servings + 2 rotis plated (540 cal / 50g protein). Kids get 1.5 servings + 1.5 rotis in a compartment tray, chicken + gravy + rotis kept separate for self-dipping (405 cal / 38g protein). Halal claim = verify the physical Sukhi's package.", id: 55, time: "15 min", reheats: true, adult: "2 tikka masala servings + 2 rumali rotis + 1 tsp Kashmiri chili stirred in AFTER the kid split", kid: "1.5 tikka servings + 1.5 rotis, deconstructed in a compartment tray (chicken + gravy + rotis separate, mild)", needs: ["Sukhi's Costco chicken tikka masala twin-pack (36 oz / 2 x 18 oz pouches)", "Vadilal frozen rumali rotis (7 rotis, ~40g each)", "Kashmiri chili powder (1 tsp, adult only)", "Water (hot tap, for warming sealed pouches)"], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  29: {
    label: "Week 29",
    description: "Rice-Bowl Debut Week — the new Cilantro-Lime Chipotle Chicken Rice Bowls (id 58) run Monday, powered by a Sunday Bone Broth Rice batch (8 servings). The dinner uses 3 servings; the remaining 5 hold in the fridge for later meals. The split is the RICE FINISH AND SAUCE, not the protein — adults get cilantro-lime rice + Tari Verde, kids get buttery rice + toum. Wednesday tikka emergency, Friday steak-and-fries. Kid macros intentionally not published — adjust portions to appetite.",
    subtitle: "Rice-Bowl Debut + Tikka Emergency + Steak Night",
    cookDays: [
      { day: "Monday", label: "Cilantro-Lime Rice Bowl Debut", vibe: "10 min prep + 30 min cook — cook a full Bone Broth Rice batch (2 cups rice + 4 cups bone broth, 18-20 min covered + 10 min rest) OR use 3 stored servings. Air fryer the chipotle chicken 10 min at the package temperature (verify the label). Boil 8 oz fire-roasted corn 5 min, season with lime + salt. Toss 2 rice servings with cilantro + lime + salt for the adults; split the third rice serving between two kid trays with 1 tbsp butter. Adult plates: 6 oz chicken + 2 oz corn + 1 tbsp Tari Verde (450 cal / 43g protein). Kid trays: 3 oz chicken + 2 oz corn + 1/2 tbsp toum in Tushar's build (kid macros not published). Batch leaves 5 Bone Broth Rice servings in the fridge.", id: 58, time: "40 min", reheats: false, adult: "Cilantro-lime Bone Broth Rice + 6 oz chipotle chicken + 2 oz fire-roasted corn + 1 tbsp Tari Verde (450 cal / 43g protein)", kid: "Buttery Bone Broth Rice + 3 oz chipotle chicken + 2 oz fire-roasted corn + 1/2 tbsp toum (Tushar's build; adjust to appetite)", needs: ["Long-grain white rice (2 cups — for the Bone Broth Rice batch)", "Kirkland Organic Chicken Bone Broth (4 cups — for the Bone Broth Rice batch)", "Fully cooked chargrilled chipotle-seasoned chicken (18 oz)", "Frozen fire-roasted corn (8 oz)", "Limes (1-2, for adult rice and corn)", "Fresh cilantro (1 generous handful, for adult rice)", "Butter (1 tbsp, for both kid rice portions)", "Tari Verde (2 tbsp, for adult plates)", "Toum or preferred mayo-based sauce (1 tbsp, for kid plates)"], carbLevel: "medium", chainTo: { slug: "bone-broth-rice", title: "Bone Broth Rice", note: "The 8-serving rice base that powers this dinner. Batch it once — Monday uses 3 servings, the other 5 hold for fried rice / bowls later in the week." } },
      { day: "Wednesday", label: "Emergency Tikka Night", vibe: "15 min — 2 sealed Sukhi's Costco tikka masala pouches warm in hot tap water while 7 Vadilal frozen rumali rotis thaw. Empty into a saucepan, pan-heat 5 min. SPLIT AT THE POT BEFORE THE CHILI — remove 3 servings for the kids' plates, THEN stir 1 tsp Kashmiri chili into the 4 remaining adult servings. Adults get 2 tikka servings + 2 rotis plated (540 cal / 50g protein). Kids get 1.5 servings + 1.5 rotis in a compartment tray, chicken + gravy + rotis kept separate for self-dipping (405 cal / 38g protein). Halal claim = verify the physical Sukhi's package.", id: 55, time: "15 min", reheats: true, adult: "2 tikka masala servings + 2 rumali rotis + 1 tsp Kashmiri chili stirred in AFTER the kid split", kid: "1.5 tikka servings + 1.5 rotis, deconstructed in a compartment tray (chicken + gravy + rotis separate, mild)", needs: ["Sukhi's Costco chicken tikka masala twin-pack (36 oz / 2 x 18 oz pouches)", "Vadilal frozen rumali rotis (7 rotis, ~40g each)", "Kashmiri chili powder (1 tsp, adult only)", "Water (hot tap, for warming sealed pouches)"], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  31: {
    label: "Week 31",
    description: "Cheeseburger Potato Waffle Meal Prep Week — Viral Recipes Proteinized Ep. 2 (@thechefoutwest inspired the potato-waffle format). Monday: batch cook 6 hash-brown waffles in one waffle iron + one 2 lb 93/7 beef skillet with 1/2 cup bone broth. Portion 2:1 across 8 containers (5 oz raw beef per adult / 2.5 oz per kid), top with cold Velveeta (1.5 slices adult, 3/4 slice kid). Wednesday reheat: microwave beef-and-cheese ~90 sec + air-fry waffles 6-8 min. Adult finish = full waffle + Tari. Creator's kid finish = normal bun + half a waffle + ketchup. Two family dinners for 2A+2K. Adult plate: 600 cal / 50g protein. Filmed batch used 414g egg whites and was too wet; the canonical recipe starts at 240g and adds 30g only if needed. Friday: steak + fries + no-judge chimichurri.",
    subtitle: "Cheeseburger Potato Waffle Batch + Wed Reheat + Steak Night",
    cookDays: [
      { day: "Monday", label: "Cheeseburger Potato Waffle Batch Cook", vibe: "70 min — thaw + squeeze 840g frozen shredded hash browns until no water drips. Mix with 168g reduced-fat cheddar + 3 tbsp cornstarch + SPG, then add egg whites 240g at a time (max ~300g; the on-camera 414g batch was too wet). Preheat waffle iron, light avocado-oil spray, cook 6 waffles at 6-8 min each. In parallel: brown 2 lb 93/7 beef with SPG, add 1/2 cup bone broth, cook until absorbed. Portion 2:1 across 8 containers (5 oz raw beef per adult, 2.5 oz per kid), top with cold Velveeta (1.5 slices adult, 3/4 slice kid). Half feeds tonight, half holds for Wednesday.", id: 60, time: "70 min", fixedBatch: true, batchCoversDays: ["Mon", "Wed"], adult: "1 full potato waffle + 5 oz raw-equivalent seasoned beef + 1.5 slices Velveeta + Tari (600 cal / 50g protein)", kid: "1 regular burger bun + half a waffle + 2.5 oz raw-equivalent beef + 3/4 slice Velveeta + ketchup (Tushar's build; adjust to appetite)", needs: ["Frozen shredded hash browns (840 g)", "Liquid egg whites (240-300 g — start at 240g, add 30g only if needed)", "Reduced-fat shredded cheddar (168 g / 6 oz)", "Cornstarch (3 tbsp)", "SPG or Dan-O's SPG (to taste)", "Avocado-oil spray", "93/7 lean ground beef (2 lb / 32 oz)", "Bone broth (1/2 cup)", "Velveeta slices (9 total: 6 adult + 3 kid)", "Tari hot sauce (adult finish)", "Regular burger buns (4 kid)", "Ketchup (kid)"], carbLevel: "medium" },
      { day: "Wednesday", label: "Cheeseburger Potato Waffle Reheat", vibe: "10 min — pull the second half of the meal-prep containers. Microwave the adult and kid beef-and-cheese containers ~90 sec until steaming (Velveeta melts on the reheat). Air-fry the reserved waffles 6-8 min until crisp. Do not microwave the waffles — they turn soggy. Adult plate = full waffle + Tari; kid plate = regular bun + half a waffle + ketchup.", id: 60, time: "10 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult container + air-fried waffle + Tari (600 cal / 50g protein)", kid: "Reheated kid container + regular bun + half a waffle + ketchup (Tushar's build; adjust to appetite)", needs: [], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  30: {
    label: "Week 30",
    description: "Dumpling Lasagna Debut Week — @april_eatz's viral dumpling lasagna, proteinized. Monday: one 9x13 pan, 51 wonton wrappers layered 15/9/12/15 with a 50/50 lean chicken + lean pork filling, 1 cup chicken broth poured over the top, foil-covered 30 min at 400 F. Yields 6 full servings = TWO family dinners for 2A+2K. Split is post-bake only — soy + scallion shared on the whole pan, chili-garlic ONLY on the adult section. Wednesday reheat pulls the second half of the pan; Friday steak-and-fries. Adult presentation / heat / portion split; kid portions adjust to appetite.",
    subtitle: "Dumpling Lasagna Debut + Wed Reheat + Steak Night",
    cookDays: [
      { day: "Monday", label: "Dumpling Lasagna Batch Cook", vibe: "15 min prep + 30 min bake + 10 min rest — mix 1 lb 93/7 ground chicken + 1 lb 95/5 ground pork with half the scallions + soy + rice vinegar + umami seasoning + ginger-garlic paste. Layer 15 wonton wrappers, 1/3 filling, 9 wrappers, 1/3 filling, 12 wrappers, remaining filling, 15 wrappers (51 total). Pour 1 cup chicken broth over the top, foil-cover tightly, bake 400 F for 30 min. Verify 165 F center. Rest 10 min, cut 6 squares, drizzle soy + finish with reserved scallions. Chili-garlic ONLY on adult section. Half the pan feeds tonight (2 adults + 2 kids in Tushar's build); the other half holds for Wednesday.", id: 59, time: "55 min", fixedBatch: true, batchCoversDays: ["Mon", "Wed"], adult: "1 full serving + chili-garlic drizzle (450 cal / 40g protein)", kid: "1/2 serving, no chili-garlic (Tushar's build; adjust to appetite)", needs: ["93/7 lean ground chicken (1 lb)", "95/5 lean ground pork (1 lb)", "Scallions (1 bunch)", "Soy sauce (2 tbsp + post-bake drizzle)", "Rice vinegar (2 tbsp)", "Umami seasoning (2 tbsp)", "Ginger-garlic paste (2 tbsp)", "Wonton wrappers (1 package / 51 sheets)", "Chicken broth (1 cup)", "Chili-garlic sauce (adult section only)", "Cooking spray"], carbLevel: "medium" },
      { day: "Wednesday", label: "Dumpling Lasagna Reheat", vibe: "10 min — pull the second half of Monday's pan. Reheat covered with a small splash of broth in a 325 F oven or the microwave until steaming and 165 F center. Re-drizzle fresh chili-garlic on the adult portion after reheating. One pan = two family dinners with 45 min of active work total across the week.", id: 59, time: "10 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult serving from Mon's pan + fresh chili-garlic drizzle (~450 cal / 40g protein)", kid: "Reheated kid portion from Mon's pan, no chili-garlic (Tushar's build; adjust to appetite)", needs: [], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  32: {
    label: "Week 32",
    description: "Lomo Saltado Meal Prep Week — a Peruvian-inspired split-plate cook. Monday: hard-sear 2 lb lean stir-fry beef in a wok, cook onion + yellow tomato, toss in the six-ingredient sauce hack (soy + fish + white-wine vinegar + Tari Amarillo + ginger-garlic paste + Bare Bones bone-broth stick pack), fold in fresh air-fried fries immediately before serving. Bone-broth rice from 1 cup dry / 2 cups broth splits across eight household portions. Adult bowl gets extra Tari; the creator's kids get half an adult beef serving based on appetite + same rice + toum or no extra sauce. Wednesday reheats the beef + rice with fresh air-fried fries. Friday steak-and-fries. Adult plate: 600 cal / 65g protein estimated.",
    subtitle: "Lomo Saltado Debut + Wed Reheat + Steak Night",
    cookDays: [
      { day: "Monday", label: "Lomo Saltado Batch Cook", vibe: "45 min — whisk the sauce hack first (2 tbsp each soy + fish + white-wine vinegar + Tari Amarillo + ginger-garlic paste + 1 Bare Bones bone-broth stick pack). Cook 1 cup rice in 2 cups bone broth. Trim visible fat from 2 lb lean stir-fry beef, SPG, hard-sear in a blazing wok in 2-3 batches. Stir-fry 8 oz sliced red onion + 8 oz yellow tomato until onion softens and tomato holds shape. Return the beef + sauce, toss over high heat until glossy, add 1/2 bunch green onion. Air-fry 8 oz frozen fries and fold in immediately before serving. Adult bowls: extra Tari Amarillo drizzle (600 cal / 65g protein est.). Creator's kids: half an adult beef serving + same rice + fries + toum or nothing. Refrigerate the beef and rice separately; save 8 oz frozen fries for Wed.", id: 61, time: "45 min", fixedBatch: true, batchCoversDays: ["Mon", "Wed"], adult: "Full bowl — sauced lean stir-fry beef + bone-broth rice + fresh fries + extra Tari Amarillo (creator est. 600 cal / 65g protein)", kid: "Half adult beef serving + same rice + same fries + toum or no extra sauce (Tushar's build; adjust to appetite)", needs: ["Lean stir-fry beef (2 lb, trimmed further)", "Red onion (8 oz, thickly sliced)", "Tomatoes (8 oz — creator used homegrown yellow)", "Green onions (1/2 bunch, 2-inch pieces)", "SPG (to taste)", "Avocado-oil spray", "Soy sauce (2 tbsp)", "Fish sauce (2 tbsp)", "White-wine vinegar (2 tbsp)", "Tari Amarillo hot-ish sauce (2 tbsp + adult drizzle)", "Ginger-garlic paste (2 tbsp)", "Bare Bones bone-broth stick pack (1, ~15g)", "Long-grain rice (1 cup dry)", "Bone broth (2 cups)", "Frozen fries (16 oz — 8 oz Mon + 8 oz Wed, air-fry fresh)", "Butter (optional kid rice finish)", "Toum (optional kid drizzle)"], carbLevel: "medium" },
      { day: "Wednesday", label: "Lomo Saltado Reheat", vibe: "15 min — pull the second half of Monday's beef and rice from the fridge. Reheat the beef mixture and rice together in the microwave until steaming (~90 sec, add a splash of water if the beef looks dry). Air-fry the reserved 8 oz frozen fries fresh — do not reheat batch-fried fries — and fold in immediately before serving. Adult bowl: fresh extra Tari drizzle. Kid plate: same rice + fries; toum or no extra sauce.", id: 61, time: "15 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult beef + rice + fresh air-fried fries + extra Tari Amarillo (creator est. 600 cal / 65g protein)", kid: "Reheated kid portion + fresh fries + toum or nothing (Tushar's build; adjust to appetite)", needs: ["Frozen fries (8 oz — from Mon's grocery, air-fry fresh)"], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
  33: {
    label: "Week 33",
    description: "Chicken Alfredo Crunch Nests Week — original recipe test (Can I Make a Recipe Go Viral? Ep. 1). Monday: press hash-brown shells into a 12-cup muffin pan, roast alongside 20 oz broccoli, blend and warm a cottage-cheese Alfredo, fold in Costco chipotle chicken, fill 6 nests for tonight and refrigerate the rest for Wednesday. Wednesday: re-crisp the reserved shells, warm the filling, fill and bake the second 6 nests, roast the second 20 oz broccoli fresh. Cheese lids stored dry at room temperature; add at the table both nights. Friday steak-and-fries. Adult plate: ~340 cal / 28g protein estimated (2 nests + lemon broccoli).",
    subtitle: "Alfredo Nests Debut + Wed Reheat + Steak Night",
    cookDays: [
      { day: "Monday", label: "Alfredo Nests Batch Cook", vibe: "60 min — bake 12 cheese-crisp lids first (415 F, 5-7 min, cool completely). Squeeze 15 oz thawed hash browns very dry, mix with 2 egg whites + Parm + cornstarch + oil + garlic + salt, press 35g per muffin cup. Roast shells + 20 oz broccoli together (~18-23 min). Blend Alfredo: 1 cup 2% cottage cheese + 2 tbsp Fairlife 2% milk + Parm + cornstarch + spices; warm over medium-low + fold in 12 oz Costco chipotle chicken. Fill only 6 nests tonight at 390 F for 6-8 min to 165 F. Rest 4 min, add cooled lids at the table. Adult plate: 2 nests + lemon broccoli (~340 cal / 28g protein est). Creator's kids: 1 nest + broccoli + Alfredo dip based on appetite. Refrigerate the remaining 6 baked shells, filling, and lids separately for Wednesday.", id: 62, time: "60 min", fixedBatch: true, batchCoversDays: ["Mon", "Wed"], adult: "2 nests + lemon broccoli + cheese lid on at the table (creator est. ~340 cal / 28g protein)", kid: "1 nest + broccoli + small Alfredo dip (Tushar's build; adjust to appetite)", needs: ["Plain frozen shredded hash browns (15 oz — thaw + squeeze very dry)", "Egg whites (2 large)", "Finely grated Parmesan (~1 cup total across shell + filling + lid mix)", "Part-skim low-moisture mozzarella, shredded (1 1/2 oz — lid mix)", "Costco chipotle seasoned grilled chicken (12 oz, cooked, finely chopped)", "2% cottage cheese (1 cup)", "Fairlife 2% ultra-filtered milk (2 tbsp)", "Cornstarch (3 tsp total)", "Avocado oil (2 tsp + 1-2 tsp for pan)", "Garlic powder, onion powder, Italian seasoning, kosher salt, black pepper (pantry)", "Broccoli florets (40 oz total — 20 oz Mon + 20 oz Wed)", "Avocado or olive oil (1 tbsp per dinner for broccoli)", "Lemon (1 wedge per dinner)", "Rao's Alfredo Sauce (optional — kid dipping)"], carbLevel: "medium" },
      { day: "Wednesday", label: "Alfredo Nests Reheat", vibe: "25 min — pull the reserved 6 baked shells, filling, and lids from the fridge. Re-crisp the shells at 400 F for ~5 min. Warm the filling over medium-low until steaming. Roast the second 20 oz broccoli fresh at 415 F while the shells re-crisp. Fill the shells with ~50g each, bake at 390 F for 6-8 min to 165 F. Rest 4 min, add the cooled lids at the table. Same adult and kid plates as Monday.", id: 62, time: "25 min", isReheat: true, reheatOf: "Mon", adult: "Reheated adult plate — 2 nests re-crisped + fresh broccoli + cheese lid at the table (creator est. ~340 cal / 28g protein)", kid: "Reheated kid plate — 1 nest + fresh broccoli + small Alfredo dip (Tushar's build; adjust to appetite)", needs: ["Broccoli florets (20 oz — from Mon's grocery)"], carbLevel: "medium" },
      { day: "Friday", label: "Steak Night", vibe: "20 min — Checkers/Rally's frozen fries in the air fryer first (12-15 min), bavette steak seared 2-3 min per side in a hot stainless pan while fries finish, pork breakfast patties cooked in the same pan during the 5-min steak rest. No-judge chimichurri = Spiceology Chimichurri Blend + olive oil + red wine vinegar + chili flakes (mix, sit 5 min). Adults get sliced bavette + fries + chimichurri; kids get cut-up pork patties + fries + raw carrots. ~45g protein / 620 cal per adult. Cross-link to No-Judge Chimichurri cookbook entry.", id: 25, time: "20 min", reheats: false, adult: "Sliced bavette + Checkers fries + spoonful of chimichurri over the steak", kid: "Cut-up pork breakfast patties + fries + raw carrots (no sauce)", needs: ["Bavette steak (6 oz per adult)", "SPG seasoning (salt, pepper, garlic)", "Great Value pork breakfast patties (kid, 1.5 per kid)", "Checkers/Rally's frozen fries", "Spiceology Chimichurri Blend", "O California organic extra virgin olive oil", "Napa Valley Naturals organic red wine vinegar", "Chili flakes", "Raw carrots (baby or sticks, kid)", "Cooking spray"], carbLevel: "low", chainTo: { slug: "no-judge-chimichurri", title: "No-Judge Chimichurri", note: "The 60-second sauce that carries this dinner — Spiceology blend + olive oil + red wine vinegar + a rest." } },
    ],
  },
};

function getLeftoverMsg(hasLeftovers) {
  if (!hasLeftovers) {
    return { tue: "No leftovers — eat out or cook something quick", thu: "No leftovers — eat out or cook something quick", sat: "No leftovers — eat out or cook something quick", sun: "Flexible — eat out or reset" };
  }
  return { tue: "Reheat Monday's dinner — already handled", thu: "Reheat Wednesday's dinner — already handled", sat: "Reheat Friday's dinner — already handled", sun: "Flexible — finish leftovers, eat out, or reset" };
}

function CookDay({ day, label, vibe, id, time, reheats, isReheat, fixedBatch, reheatOf, adult, kid, needs, servings, enabled, onToggle, adults, kids, leftovers }) {
  const r = recipes.find((x) => x.id === id);
  if (!r) return null;
  // Reheat days pull from another day's batch — no toggle, no grocery add.
  const isReheatDay = !!isReheat;
  return (
    <div className={`transition-all ${enabled ? "" : "opacity-40"}`}>
      <div className="flex items-center gap-2 mb-1 sm:pl-12">
        <button
          onClick={(e) => { e.preventDefault(); onToggle(); }}
          className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-[10px] cursor-pointer transition-colors ${
            enabled ? "bg-amber-500 border-amber-500 text-black" : "border-neutral-600 bg-neutral-800"
          }`}
        >
          {enabled && "\u2713"}
        </button>
        {!isReheatDay ? (
          <span className="text-neutral-500 text-[10px]">{enabled ? "Included" : "Skipped — removed from grocery"}</span>
        ) : (
          <span className="text-green-500/80 text-[10px] font-semibold">Reheats from {reheatOf} batch — no new grocery</span>
        )}
      </div>
      <Link to={enabled ? `/recipes/${r.slug}?adults=${adults}&kids=${kids}&leftovers=${leftovers ? 1 : 0}` : "#"} className={`block ${enabled ? "group" : "pointer-events-none"}`}>
        <div className={`bg-neutral-900 border rounded-xl overflow-hidden transition-all ${enabled ? "border-neutral-800 hover:border-amber-500/40" : "border-neutral-800/50"}`}>
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-40 flex-shrink-0 relative">
              <img src={r.image} alt={r.title} className={`w-full h-32 sm:h-full object-cover transition-all ${enabled ? "group-hover:brightness-110" : "grayscale brightness-50"}`} loading="lazy" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-black">{day}</span>
                {fixedBatch && enabled && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-600/80 text-white">Batch</span>}
                {isReheatDay && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-600/80 text-white">Reheat</span>}
                {reheats && !isReheatDay && enabled && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-600/80 text-white">Reheats</span>}
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">{label}</span>
                <span className="text-neutral-600 text-[10px]">{time} &middot; {servings} servings</span>
              </div>
              <h3 className={`font-bold text-sm transition-colors ${enabled ? "text-white group-hover:text-amber-400" : "text-neutral-600 line-through"}`}>{r.title}</h3>
              {enabled && vibe && (
                <p className="text-neutral-500 text-[10px] italic mt-0.5">{vibe}</p>
              )}
              {enabled && (
                <>
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2 items-start">
                      <span className="text-red-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">ADULT</span>
                      <p className="text-neutral-400 text-xs">{adult}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-green-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">KID</span>
                      <p className="text-neutral-400 text-xs">{kid}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {needs.map((n) => (
                      <span key={n} className="text-[10px] bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="text-amber-400 font-bold">{r.protein}g protein</span>
                    <span className="text-neutral-700">&middot;</span>
                    <span className="text-neutral-500">{r.calories} cal/serving</span>
                    <span className="text-neutral-700">&middot;</span>
                    <span className="text-neutral-500">{Math.round((r.protein * 4 / r.calories) * 100)}% PPC</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function LeftoverDay({ day, meal, visible, chain }) {
  if (!visible) return null;
  if (chain) {
    return (
      <Link to={`/recipes/${chain.slug}`} className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-colors group">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 w-12 flex-shrink-0">{day}</span>
        <span className="text-xs text-neutral-200">
          <span className="font-bold text-amber-400 group-hover:underline">Reinvent as {chain.title}</span>
          {chain.note && <span className="text-neutral-500 ml-2">— {chain.note}</span>}
        </span>
        <span className="text-[10px] bg-amber-900/30 text-amber-500 px-2 py-0.5 rounded-full ml-auto">Meal chain &rarr;</span>
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/30 border border-neutral-800/50 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 w-12 flex-shrink-0">{day}</span>
      <span className="text-xs text-neutral-500">{meal}</span>
      <span className="text-[10px] bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full ml-auto">No cooking</span>
    </div>
  );
}

function FlexDay({ day, meal }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-dashed border-neutral-800 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 w-12 flex-shrink-0">{day}</span>
      <span className="text-xs text-neutral-600 italic">{meal}</span>
    </div>
  );
}

const LATEST_WEEK = Math.max(...Object.keys(WEEKS).map(Number));

export default function YourWeek() {
  const [week, setWeek] = useState(LATEST_WEEK);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(2);
  const [leftovers, setLeftovers] = useState(true);
  const [enabledMeals, setEnabledMeals] = useState({ Mon: true, Wed: true, Fri: true });
  const [showFeedback, setShowFeedback] = useState(false);

  const servings = adults + kids;
  const currentWeek = WEEKS[week];
  // Build per-day reheats map for grocery scaling
  const dayReheats = { Mon: currentWeek.cookDays[0]?.reheats, Wed: currentWeek.cookDays[1]?.reheats, Fri: currentWeek.cookDays[2]?.reheats };
  const enabledCount = Object.values(enabledMeals).filter(Boolean).length;
  const leftoverMsgs = getLeftoverMsg(leftovers);

  const handleWeekChange = (w) => {
    setWeek(w);
    setEnabledMeals({ Mon: true, Wed: true, Fri: true });
  };

  const toggleMeal = (dayKey) => {
    const current = enabledMeals[dayKey];
    if (current && enabledCount <= 2) return; // guardrail: keep at least 2
    setEnabledMeals((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const resetMeals = () => setEnabledMeals({ Mon: true, Wed: true, Fri: true });

  const handleFamilyChange = (setter, val) => {
    setter(val);
    setShowFeedback(true);
  };

  useEffect(() => {
    if (showFeedback) {
      const t = setTimeout(() => setShowFeedback(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showFeedback, servings]);

  // Build excluded grocery tags
  const excludedTags = useMemo(() => {
    const tags = [];
    if (!enabledMeals.Mon) tags.push("Mon");
    if (!enabledMeals.Wed) tags.push("Wed");
    if (!enabledMeals.Fri) tags.push("Fri");
    return tags;
  }, [enabledMeals]);

  return (
    <section id="your-week" className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/80 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Sample Weekly Plans</p>
          <h2 className="text-3xl font-black text-white">3 Dinners. 1 Grocery Run.</h2>
          <p className="text-neutral-400 text-sm mt-2">Pick the plan that matches your week. Each has its own grocery list.</p>
        </div>

        {/* Plan selector — current plan pinned; older plans behind an archive
            toggle so the button grid doesn't grow unbounded. */}
        <PlanSelector
          weeks={WEEKS}
          activeWeek={week}
          onChange={handleWeekChange}
          currentWeek={currentWeek}
        />

        {/* Family size */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white text-xs font-bold">Your family</span>
              <span className="text-neutral-600 text-[10px] ml-2">Adjusts grocery + portions</span>
            </div>
            {showFeedback && (
              <span className="text-amber-400 text-[10px] font-bold animate-pulse">Updated for {servings}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs w-12">Adults:</span>
              <div className="flex gap-1">
                {ADULT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => handleFamilyChange(setAdults, n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${adults === n ? "bg-red-500 text-white scale-110" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs w-12">Kids:</span>
              <div className="flex gap-1">
                {KID_OPTIONS.map((n) => (
                  <button key={n} onClick={() => handleFamilyChange(setKids, n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${kids === n ? "bg-green-500 text-white scale-110" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
            <button
              onClick={() => { setLeftovers(!leftovers); setShowFeedback(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${leftovers ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}
            >
              <span className={`w-3 h-3 rounded-sm border ${leftovers ? "bg-black border-black" : "border-neutral-600"} flex items-center justify-center text-[8px]`}>{leftovers ? "\u2713" : ""}</span>
              Make leftovers for next day
            </button>
            <span className="text-neutral-600 text-[10px]">
              {servings} servings
            </span>
          </div>
        </div>

        {/* Meal inclusion */}
        {enabledCount < 3 ? (
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-neutral-500 text-[10px]">
              {enabledCount} of 3 dinners active &middot; grocery adjusted
            </span>
            <button onClick={resetMeals} className="text-amber-500 text-[10px] font-bold cursor-pointer hover:underline">
              Reset to full week
            </button>
          </div>
        ) : (
          <p className="text-neutral-600 text-[10px] text-center mb-4">
            Can't do all 3? Uncheck a dinner below to skip it — grocery updates automatically.
          </p>
        )}

        {/* Start here */}
        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl py-4 px-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-xs font-black uppercase tracking-wider">Start here</span>
            <span className="text-neutral-600 text-[10px]">Zero decisions required</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <a href="#grocery" className="text-white font-bold text-sm hover:text-amber-400 transition-colors">1. Shop</a>
              <p className="text-neutral-500 text-[10px] mt-0.5">One list, one trip</p>
            </div>
            <div>
              <span className="text-white font-bold text-sm">2. Cook</span>
              <p className="text-neutral-500 text-[10px] mt-0.5">3 dinners, your schedule</p>
            </div>
            <div>
              <span className="text-white font-bold text-sm">3. Done</span>
              <p className="text-neutral-500 text-[10px] mt-0.5">{leftovers ? "Leftovers cover off-nights" : "Cook nights sorted"}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative" id="timeline">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-neutral-800 hidden sm:block" />
          <div className="space-y-2 relative">
            {/* Monday */}
            <TimelineDot type="cook" enabled={enabledMeals.Mon} />
            <CookDay {...currentWeek.cookDays[0]} servings={servings} enabled={enabledMeals.Mon} onToggle={() => toggleMeal("Mon")} adults={adults} kids={kids} leftovers={leftovers} />
            <TimelineDot type="leftover" enabled={enabledMeals.Mon} />
            <LeftoverDay day="Tuesday" meal={leftoverMsgs.tue} visible={leftovers && enabledMeals.Mon && currentWeek.cookDays[0].reheats} chain={currentWeek.cookDays[0].chainTo} />

            {/* Wednesday */}
            <TimelineDot type="cook" enabled={enabledMeals.Wed} />
            <CookDay {...currentWeek.cookDays[1]} servings={servings} enabled={enabledMeals.Wed} onToggle={() => toggleMeal("Wed")} adults={adults} kids={kids} leftovers={leftovers} />
            <TimelineDot type="leftover" enabled={enabledMeals.Wed} />
            <LeftoverDay day="Thursday" meal={leftoverMsgs.thu} visible={leftovers && enabledMeals.Wed && currentWeek.cookDays[1].reheats} chain={currentWeek.cookDays[1].chainTo} />

            {/* Friday */}
            <TimelineDot type="cook" enabled={enabledMeals.Fri} />
            <CookDay {...currentWeek.cookDays[2]} servings={servings} enabled={enabledMeals.Fri} onToggle={() => toggleMeal("Fri")} adults={adults} kids={kids} leftovers={leftovers} />
            <TimelineDot type="leftover" enabled={enabledMeals.Fri} />
            <LeftoverDay day="Saturday" meal={leftoverMsgs.sat} visible={leftovers && enabledMeals.Fri && currentWeek.cookDays[2].reheats} chain={currentWeek.cookDays[2].chainTo} />

            {/* Sunday */}
            <TimelineDot type="flex" />
            <FlexDay day="Sunday" meal={leftoverMsgs.sun} />
          </div>
        </div>

        {/* Weekly stats */}
        {(() => {
          const dayKeys = ["Mon", "Wed", "Fri"];
          // isReheat cards ARE the leftover day (fixedBatch pattern) — exclude
          // from cook count and count as leftover days regardless of toggle.
          const cookCount = currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && !d.isReheat).length;
          const legacyLeftoverDays = leftovers ? currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && d.reheats).length : 0;
          const inlineReheatDays = currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && d.isReheat).length;
          const leftoverDays = legacyLeftoverDays + inlineReheatDays;
          // Real protein sum: enabled cook days × recipe-specific adult/kid macros × leftover doubling.
          // Adult falls back to top-level recipe.protein; kid does NOT — if the
          // recipe doesn't publish kid macros, that portion contributes 0
          // (substituting adult inflates the total).
          let totalProtein = 0;
          currentWeek.cookDays.forEach((day, i) => {
            if (!enabledMeals[dayKeys[i]]) return;
            const recipe = recipes.find((r) => r.id === day.id);
            if (!recipe) return;
            const adultProt = recipe.splitCook?.adult?.protein ?? recipe.protein ?? 0;
            const kidProt = recipe.splitCook?.kid?.protein ?? 0;
            let mealProtein = adults * adultProt + kids * kidProt;
            if (leftovers && day.reheats) mealProtein *= 2;
            totalProtein += mealProtein;
          });
          return (
            <div className="mt-8 flex justify-center gap-4 text-xs text-neutral-500 flex-wrap">
              <span><span className="text-amber-400 font-bold">~{Math.round(totalProtein)}g protein</span> this week</span>
              <span className="text-neutral-700">|</span>
              <span><span className="text-white font-semibold">{cookCount} cooks</span>{leftoverDays > 0 ? ` + ${leftoverDays} leftover days` : ""}</span>
              <span className="text-neutral-700">|</span>
              <span>~30 min avg</span>
            </div>
          );
        })()}

        {/* Grocery */}
        <div className="mt-10" id="grocery">
          <GroceryList adults={adults} kids={kids} leftovers={leftovers} dayReheats={dayReheats} excludedTags={excludedTags} week={week} planLabel={currentWeek.label} />
        </div>

        {/* Sauce bridge */}
        <div className="mt-8 bg-neutral-900/50 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-amber-400">Add flavor to any dinner</h4>
            <Link to="/cookbook" className="text-amber-500 text-[10px] font-bold hover:underline">View all sauces &rarr;</Link>
          </div>
          <p className="text-neutral-400 text-xs">Sauces that turn any meal from good to great. ~30 cal, 5 min, works on everything.</p>
          <Link to="/cookbook" className="mt-3 flex items-center gap-3 bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800 transition-colors">
            <div className="flex-1">
              <span className="text-white text-xs font-bold">Money Mustard</span>
              <span className="text-neutral-500 text-[10px] ml-2">Chick-fil-A style, high protein</span>
            </div>
            <span className="text-amber-500 text-[10px] font-bold">Use this &rarr;</span>
          </Link>
        </div>

        {/* Flexibility note */}
        <div className="mt-4 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-white mb-2">Make it yours</h4>
          <div className="space-y-1.5 text-xs text-neutral-400">
            <p>Swap any protein: chicken &harr; beef &harr; turkey. System still works.</p>
            <p>Uncheck a dinner above to remove it from your week and grocery list.</p>
            <p>Adjust spice levels, not the structure. That's how this stays repeatable.</p>
          </div>
        </div>

        {/* Completion */}
        {(() => {
          const dayKeys = ["Mon", "Wed", "Fri"];
          const cookCount = currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && !d.isReheat).length;
          const legacyLeftoverDays = leftovers ? currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && d.reheats).length : 0;
          const inlineReheatDays = currentWeek.cookDays.filter((d, i) => enabledMeals[dayKeys[i]] && d.isReheat).length;
          const leftoverDays = legacyLeftoverDays + inlineReheatDays;
          // Fresh-only cooks = enabled cook cards with no leftover mechanism
          // (neither legacy `reheats` nor a downstream `batchCoversDays`).
          const nonReheatDays = leftovers ? currentWeek.cookDays.filter((d, i) =>
            enabledMeals[dayKeys[i]] && !d.isReheat && !d.reheats && !d.batchCoversDays
          ).length : 0;
          return (
            <div className="mt-6 text-center py-6 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-neutral-500 text-xs">Once you've shopped and checked everything off:</p>
              <p className="text-amber-400 font-black text-base mt-1">
                {cookCount} dinners + {leftoverDays} leftover days handled.
              </p>
              <p className="text-neutral-600 text-[10px] mt-1">
                {nonReheatDays > 0 && leftovers ? `${nonReheatDays} dinner best eaten fresh (no leftover day).` : ""}
                {!leftovers ? "Turn on leftovers to cover more of the week." : ""}
              </p>
            </div>
          );
        })()}

        {/* Return hook */}
        <div className="mt-6 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-5 px-4">
          <p className="text-white text-xs font-bold">Come back Sunday</p>
          <p className="text-amber-400 text-[10px] mt-1 font-semibold">New dinners every week.</p>
          <p className="text-neutral-500 text-[10px] mt-1">Same system, new flavors. Swap 1 protein, keep the structure, zero thinking.</p>
          <p className="text-neutral-600 text-[10px] mt-2">3 dinners. 1 shop. 0 decisions. Every week.</p>
        </div>
      </div>
    </section>
  );
}

function TimelineDot({ type, enabled = true }) {
  if (!enabled && type !== "flex") return <div className="h-0" />;
  return <div className="h-0 relative"><div className={`absolute left-[21px] top-2 w-2.5 h-2.5 rounded-full border-2 hidden sm:block z-10 ${
    type === "cook" ? "bg-amber-500 border-amber-500" : type === "leftover" ? "bg-neutral-700 border-neutral-600" : "bg-neutral-800 border-neutral-700"
  }`} /></div>;
}

function PlanSelector({ weeks, activeWeek, onChange, currentWeek }) {
  const entries = Object.entries(weeks)
    .map(([num, w]) => ({ num: Number(num), ...w }))
    .sort((a, b) => b.num - a.num);
  const latest = entries[0];
  const archive = entries.slice(1);
  // Auto-expand the archive when the user has navigated to a non-latest plan
  // so the highlighted button is visible without an extra click.
  const [archiveOpen, setArchiveOpen] = useState(activeWeek !== latest.num);
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-bold mr-1">This week</span>
        <button
          onClick={() => onChange(latest.num)}
          aria-pressed={activeWeek === latest.num}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeWeek === latest.num
              ? "bg-amber-500 text-black"
              : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-amber-500/40"
          }`}
        >
          {latest.label}
        </button>
        {archive.length > 0 && (
          <button
            onClick={() => setArchiveOpen((v) => !v)}
            aria-expanded={archiveOpen}
            aria-controls="week-archive"
            className="ml-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-neutral-400 bg-neutral-900 border border-neutral-700 hover:border-amber-500/40 hover:text-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Older plans ({archive.length})</span>
            <span className={`transition-transform ${archiveOpen ? "rotate-180" : ""}`} aria-hidden="true">▾</span>
          </button>
        )}
      </div>
      {archiveOpen && archive.length > 0 && (
        <div id="week-archive" className="flex items-center gap-1.5 flex-wrap justify-center mt-1 pt-2 border-t border-neutral-800 max-w-full">
          {archive.map((w) => (
            <button
              key={w.num}
              onClick={() => onChange(w.num)}
              aria-pressed={activeWeek === w.num}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activeWeek === w.num
                  ? "bg-amber-500 text-black"
                  : "bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}
      <div className="text-center mt-1">
        <span className="text-neutral-400 text-xs">{currentWeek.subtitle}</span>
        {currentWeek.description && <p className="text-neutral-600 text-[10px] mt-1">{currentWeek.description}</p>}
      </div>
    </div>
  );
}
