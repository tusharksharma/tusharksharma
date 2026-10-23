import assert from 'node:assert/strict';
import { test } from 'node:test';
import recipes from '../src/data/recipes.js';
import { sauces } from '../src/data/cookbook.js';
import { buildRecipeSchema } from '../src/utils/recipeSchema.js';

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
