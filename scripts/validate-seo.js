import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join } from 'node:path';

const samples = [
  'recipes/spicy-fajita-chicken-gnocchi',
  'recipes/high-protein-pepperoni-mac-meal-prep',
  'recipes/viral-proteinized-burger-in-a-bun',
  'cookbook/protein-tiramisu',
  'cookbook/high-protein-caesar-dressing',
  'cookbook/white-drop-cookies-n-creme-creami',
  'cookbook/creamy-chipotle-chicken-ditalini',
];

for (const path of samples) {
  const html = readFileSync(join('dist', path, 'index.html'), 'utf8');
  assert.match(html, /<div id="root">[\s\S]*?<\/nav>/, `${path}: initial HTML must contain navigation`);
  assert.match(html, /(?:Ingredients|What you need)/i, `${path}: initial HTML must contain recipe ingredients`);
  const start = html.indexOf('<script type="application/ld+json">');
  assert.ok(start >= 0, `${path}: missing Recipe JSON-LD`);
  const end = html.indexOf('</script>', start);
  const json = JSON.parse(html.slice(start + '<script type="application/ld+json">'.length, end));
  assert.equal(json['@type'], 'Recipe');
  assert.ok(json.recipeIngredient?.length > 0, `${path}: missing structured ingredients`);
  assert.ok(json.recipeInstructions?.length > 0, `${path}: missing structured instructions`);
  assert.equal(json.author?.name, 'Tushar Sharma');
  if (path.includes('burger-in-a-bun')) {
    assert.equal(json.totalTime, 'PT45M');
    assert.equal(json.recipeYield, '4');
    assert.ok(json.recipeIngredient.some((text) => text.startsWith('3 Velveeta Original cheese slices')));
    assert.equal(json.nutrition, undefined, 'mixed adult/kid batch must not imply universal nutrition');
    assert.match(html, /3 Velveeta Original cheese slices for two kid burgers/);
  }
  if (path.includes('protein-tiramisu')) {
    assert.match(html, /Full serving — 7 wafers/);
    assert.doesNotMatch(html, /Full serving — 8 wafers/);
  }
  if (path.includes('white-drop')) {
    assert.equal(json.name, 'Cookies and Cream Protein Ice Cream (Ninja Creami)');
    assert.match(html, /Another Ninja Creami recipe/);
  }
}
for (const hub of ['dinners', 'cookbook']) {
  const html = readFileSync(join('dist', hub, 'index.html'), 'utf8');
  assert.match(html, /<div id="root">[\s\S]*?href="\/(?:recipes|cookbook)\//, `${hub}: initial HTML must contain recipe links`);
}
console.log(`SEO HTML and Recipe markup verified for ${samples.length} audit URLs.`);
