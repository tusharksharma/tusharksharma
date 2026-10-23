import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scaleIngredientText } from '../src/utils/scaleIngredient.js';
import recipes from '../src/data/recipes.js';

test('relative allocations stay fixed across half and double batches', () => {
  for (const factor of [0.5, 2/3, 2]) {
    assert.equal(scaleIngredientText('~70% of the cooked bacon', factor), '~70% of the cooked bacon');
    assert.equal(scaleIngredientText('30% of the cooked bacon', factor), '30% of the cooked bacon');
  }
});
test('absolute quantities and ranges still scale', () => {
  assert.equal(scaleIngredientText('3 boxes of shells', 2), '6 boxes of shells');
  assert.equal(scaleIngredientText('1/2 cup milk', 2), '1 cup milk');
  assert.equal(scaleIngredientText('1-2 tbsp parsley', 2), '2–4 tbsp parsley');
  assert.equal(scaleIngredientText('1 container (16 oz) cottage cheese', 2), '2 container (16 oz) cottage cheese');
});
test('unverified mixed-portion nutrition is withheld consistently', () => {
  const r = recipes.find((item) => item.slug === 'creamy-beef-bacon-pasta');
  assert.equal(r.protein, null);
  assert.equal(r.calories, null);
  for (const key of ['protein', 'calories', 'fat', 'carbs', 'netCarbs']) assert.equal(r.meta.macros[key], undefined);
  assert.equal(r.splitCook.adult.protein, null);
  assert.equal(r.splitCook.kid.calories, null);
  assert.match(r.meta.macroHonesty, /under review/);
  assert.doesNotMatch(r.description + r.makeThisWhen + r.macroHonesty, /350|42\.7|27\.8|19g/);
});
import { scaleBatchMethod } from '../src/utils/scaleIngredient.js';
test('pepperoni method quantities agree with selected batch in detail, print and cooking model', () => {
  const original = recipes.find((r) => r.id === 65);
  for (const scale of [0.5, 1, 2]) {
    const adjusted = scaleBatchMethod(original, scale);
    const text = adjusted.steps.map((step) => step.text).join(' ');
    if (scale === 0.5) {
      assert.match(text, /all 1 1\/2 boxes/);
      assert.match(text, /1\/2 cups whole milk/);
      assert.match(text, /PORTION 4 SERVINGS/);
    }
    if (scale === 2) {
      assert.match(text, /all 6 boxes/);
      assert.match(text, /all 6 cheese packets/);
      assert.match(text, /2 cups whole milk/);
      assert.match(text, /Chop 8 servings/);
      assert.match(text, /PORTION 16 SERVINGS/);
      assert.match(text, /8 full servings and 8 slightly smaller/);
    }
  }
  assert.match(original.steps[0].text, /all 3 boxes/);
});
