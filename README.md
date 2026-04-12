# The Split Plate

**One Meal. Two Outcomes. No Extra Work.**

High-protein family meals using the Split Cook Method — cook once for adults and kids, no extra effort.

**Live:** [recipes-site-two.vercel.app](https://recipes-site-two.vercel.app)

## What This Is

A recipe site built around one idea: you shouldn't have to cook two separate meals for adults and kids.

Every recipe follows the Split Cook Method:
1. **Cook the base** — protein + carbs, no spice
2. **Split** — divide into two pans at the right moment
3. **Adult finish** — bold flavor, spice, full experience
4. **Kid finish** — mild, simple, familiar

## Features

- 20 recipes with structured metadata (protein anchor, meal type, flavor direction)
- Split Cook toggle on recipe pages (Adult Mode / Kids + Adult Mode)
- Per-step cooking photos
- Protein-per-calorie stats on every card
- Browse by system (not categories)
- Shareable recipe URLs (/recipes/:slug)

## Stack

React 19 + Vite + Tailwind CSS 4 + React Router + Vercel

## Run Locally

```bash
npm install
npm run dev
```

## Add a Recipe

Edit `src/data/recipes.js` — follow the existing schema. Required fields:

```js
{
  id, slug, title, category, pillar,
  proteinAnchor, mealType, flavorDirection, splitFriendly,
  tags, time, servings, protein, calories, image,
  description, whyItWorks, ingredients, steps
}
```

Optional: `splitCook`, `executionRules`, `brands`
