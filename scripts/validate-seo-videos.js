import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import recipes from '../src/data/recipes.js';
import * as cookbook from '../src/data/cookbook.js';

// This inventory is an official release snapshot, not a playback certificate.
// Refresh it from GitHub when publishing or replacing these media files.
const inventory = JSON.parse(readFileSync(new URL('./seo-video-release.json', import.meta.url)));
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
const directories = ['high-protein-pepperoni-mac-meal-prep', 'protein-tiramisu', 'white-drop-cookies-n-creme-creami', 'sunny-side-eggs-canadian-bacon-breakfast'];
const paths = JSON.stringify([recipes, ...Object.values(cookbook).filter(Array.isArray)]).match(/\/videos\/[^"\s]+\.mp4/g) || [];
let count = 0;
for (const directory of directories) {
  const prefix = `/videos/${directory}/`;
  const rule = config.rewrites.find((entry) => entry.source.startsWith(prefix));
  assert.equal(rule?.destination, `https://github.com/${inventory.repository}/releases/download/${inventory.tag}/:filename`);
  for (const path of new Set(paths.filter((value) => value.startsWith(prefix)))) {
    assert.ok(inventory.assets.includes(path.split('/').at(-1)), `Missing approved release asset: ${path}`);
    count++;
  }
}
assert.ok(count >= 4, 'Expected all four audited media sources');
console.log(`SEO video references verified: ${count} files against ${inventory.checkedAt} release inventory.`);
