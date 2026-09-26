# Recipe image integration

Use this check for new recipes and for video packages attached to existing recipes. The image work is complete only when the recipe page itself tells the visual story. A populated social carousel or a few uploaded files do not satisfy the recipe page.

## Pattern from finished dinner pages

The Chicken Pot Pie and High-Protein Halal Cart Chicken Rice Bowls pages lead with a polished hero and attach relevant food photos to the method steps. The beef-and-broccoli update initially led with a raw wok frame, put two portrait stills into short landscape boxes with empty margins, and left the filmed method text-only. That arrangement hid the polished Path A set from readers.

## Required placement

1. Use a polished, food-forward `recipe.image` that represents the adult/kid split for dinners. Check the actual crop at the recipe hero size and on dinner cards. A technically valid image path can still make a poor crop.
2. Place no more than two supporting photos near the hero. Give each a specific caption and use a crop that fills its frame. Do not put a portrait still into a fixed-height landscape box with `object-contain` and large empty margins.
3. Put process photos next to the actions they document. Match the pictured food and stage of cooking to the step text. A distinct filmed variant needs its own step-photo sequence; preserve the original method and its images when its ingredients or portions differ.
4. Reuse the approved polished assets for both recipe and social surfaces when they depict the same action. Keep separate explicit `socialCarousel` photo assignments so ingredient and method cards cannot render empty photo slots.
5. Label original and filmed yields/macros separately. Captions and alt text must describe what is actually visible, including whether bowls are in progress or finished.

## Before publishing

- Build the site and confirm every referenced image exists in `public/` and `dist/`.
- Open the recipe and social URLs at desktop and phone widths. Scroll through the full page so lazy images load. Check the hero crop, supporting-photo crops, every pictured method step, and the social cards. A successful HTTP response alone is insufficient.
- Confirm there are no broken images or browser page errors, and that captions and macro claims match the version shown.
