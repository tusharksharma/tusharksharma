import assert from 'node:assert/strict';
import { sortSocialRecipes } from '../src/utils/socialOrder.js';
// Publication dates win over numeric IDs and current array/category position.
assert.deepEqual(sortSocialRecipes([
  { id: 1, initialMainPostDate: '2026-09-01' },
  { id: 99, initialMainPostDate: '2026-07-01' },
  { id: 'brand-new-package' },
]).map(r => r.id), [99, 1, 'brand-new-package']);
assert.deepEqual(sortSocialRecipes([
  { id: 'split-plate-berry-power-up-snack-box' },
  { id: 'split-plate-pizza-snack-box' },
  { id: 'split-plate-apple-pie-snack-box' },
]).map(r => r.id), ['split-plate-pizza-snack-box', 'split-plate-apple-pie-snack-box', 'split-plate-berry-power-up-snack-box']);
const a={id:'a',initialMainPostDate:'2026-08-01'}, b={id:'b',initialMainPostDate:'2026-08-01'};
assert.deepEqual(sortSocialRecipes([b,a]),[b,a]);
console.log('Social ordering verified: original dates, category moves, stable ties and new packages.');

const { creamis } = await import('../src/data/cookbook.js');
assert.deepEqual(sortSocialRecipes(creamis).slice(-3).map(r => r.id), ['fruity-pebbles-cereal-milk-creami', 'vanilla-mini-mms-protein-creami', 'cookies-cream-white-chip-protein-creami']);
