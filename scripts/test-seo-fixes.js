import assert from 'node:assert/strict';
import { test } from 'node:test';
import recipes from '../src/data/recipes.js';
import { sauces, creamis, breakfasts, snackBoxes } from '../src/data/cookbook.js';
import { buildRecipeSchema, cleanSeoDescription, summarizeSeoDescription } from '../src/utils/recipeSchema.js';

test('default kid variant instructions and ingredients match the visible lane', () => {
  const recipe = recipes.find((item) => item.slug === 'creamy-beef-bacon-pasta');
  const schema = JSON.parse(buildRecipeSchema(recipe, 'Dinner'));
  assert.equal(schema.recipeInstructions.length, 8);
  assert.ok(schema.recipeInstructions.some((step) => step.name === 'Kid Pot'));
  assert.ok(schema.recipeInstructions.some((step) => step.name === 'Plate Kid'));
  assert.ok(!schema.recipeInstructions.some((step) => step.text.includes('Skip the Alfredo entirely')));
  assert.equal(schema.nutrition, undefined);
});
test('ranch steak includes the default kid serving step', () => {
  const schema = JSON.parse(buildRecipeSchema(recipes.find((item) => item.slug === 'ranch-steak-european-greens-mash'), 'Dinner'));
  assert.ok(schema.recipeInstructions.some((step) => step.name === 'Serve' && step.text.includes('chicken-patty')));
});
test('unsplit cookbook and missing durations retain truthful omissions', () => {
  const item = sauces.find((entry) => entry.id === 'money-mustard');
  const schema = JSON.parse(buildRecipeSchema({ ...item, image: item.heroImage }, 'Cookbook'));
  assert.match(schema.name, /Greek Yogurt Honey Mustard/);
  assert.ok(schema.recipeIngredient.length);
  assert.ok(schema.recipeInstructions.length);
  const sparse = JSON.parse(buildRecipeSchema({ title: 'Fixture', servings: 4, ingredients: ['1 cup milk'], steps: [{ text: 'Mix.' }] }, 'Dinner'));
  assert.equal(sparse.recipeYield, '4');
  assert.equal(sparse.totalTime, undefined);
  assert.equal(sparse.nutrition, undefined);
});
test('step images, compound timings, author url, and cuisine inference are emitted accurately', () => {
  const gnocchi = recipes.find((item) => item.slug === 'spicy-fajita-chicken-gnocchi');
  const gnocchiSchema = JSON.parse(buildRecipeSchema(gnocchi, 'Dinner'));
  assert.equal(gnocchiSchema.author.url, 'https://thesplitplate.com/about');
  assert.ok(gnocchiSchema.recipeInstructions.some((step) => step.image?.startsWith('https://thesplitplate.com/images/')));
  assert.ok(gnocchiSchema.recipeCuisine);

  const compound = JSON.parse(
    buildRecipeSchema(
      {
        title: 'Baked Pasta Fixture',
        time: '25 min prep + 45 min bake',
        servings: 6,
        ingredients: ['1 lb pasta'],
        steps: [{ text: 'BAKE: 45 minutes.', image: '/images/test/step-01.webp' }],
      },
      'Dinner'
    )
  );
  assert.equal(compound.prepTime, 'PT25M');
  assert.equal(compound.cookTime, 'PT45M');
  assert.equal(compound.totalTime, 'PT70M');
  assert.equal(compound.recipeInstructions[0].image, 'https://thesplitplate.com/images/test/step-01.webp');
});
test('series prefixes are stripped from descriptions and summarized without mid-sentence ellipsis', () => {
  for (const entry of [...creamis, ...breakfasts, ...snackBoxes]) {
    const cleaned = cleanSeoDescription(entry.seoDescription || entry.tagline);
    assert.doesNotMatch(cleaned, /^(?:CrumblCreamiCut|Proffee Episode|Snack Box Series)/i);
    const summary = summarizeSeoDescription(entry.seoDescription || entry.tagline);
    assert.ok(summary.length <= 155, `${entry.id} summary exceeded 155 chars: ${summary.length}`);
    assert.ok(!summary.endsWith('…'), `${entry.id} summary ended with ellipsis: ${summary}`);
  }
});
