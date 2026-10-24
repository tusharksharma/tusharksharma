import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import recipes from '../src/data/recipes.js';
import * as cookbook from '../src/data/cookbook.js';

// This inventory is an official release snapshot, not a playback certificate.
// Refresh it from GitHub when publishing or replacing these media files.
const inventory = JSON.parse(readFileSync(new URL('./seo-video-release.json', import.meta.url)));
if (process.argv.includes('--live')) {
  const response = await fetch(`https://api.github.com/repos/${inventory.repository}/releases/tags/${inventory.tag}`);
  assert.ok(response.ok, `Cannot verify live release inventory: HTTP ${response.status}`);
  const release = await response.json();
  inventory.assets = release.assets.map((asset) => asset.name);
  if (inventory.secondaryRepository && inventory.secondaryTag) {
    const secRes = await fetch(`https://api.github.com/repos/${inventory.secondaryRepository}/releases/tags/${inventory.secondaryTag}`);
    assert.ok(secRes.ok, `Cannot verify secondary live release inventory: HTTP ${secRes.status}`);
    const secRelease = await secRes.json();
    inventory.secondaryAssets = secRelease.assets.map((asset) => asset.name);
  }
  inventory.checkedAt = 'live GitHub release';
}
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
const directories = ['high-protein-pepperoni-mac-meal-prep', 'protein-tiramisu', 'white-drop-cookies-n-creme-creami', 'sunny-side-eggs-canadian-bacon-breakfast'];
const paths = [...new Set(JSON.stringify([recipes, ...Object.values(cookbook).filter(Array.isArray)]).match(/\/videos\/[^"\s]+\.(?:mp4|m4a)/g) || [])];
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

const tspSet = new Set(inventory.assets || []);
const septSet = new Set(inventory.secondaryAssets || []);
function resolveDestination(videoPath) {
  for (const r of config.rewrites) {
    if (r.source === '/(.*)') continue;
    if (!r.source.includes(':')) {
      if (r.source === videoPath) return r.destination;
      continue;
    }
    const prefix = r.source.split(':')[0];
    if (r.source.startsWith('/videos/:recipe/')) {
      const ext = r.source.includes('.m4a') ? '.m4a' : '.mp4';
      if (videoPath.endsWith(ext)) return r.destination.replace(':filename', videoPath.split('/').at(-1));
    } else if (videoPath.startsWith(prefix)) {
      return r.destination.replace(':filename', videoPath.split('/').at(-1));
    }
  }
  return null;
}

let totalVerified = 0;
for (const videoPath of paths) {
  const dest = resolveDestination(videoPath);
  assert.ok(dest, `No vercel.json rewrite matches ${videoPath}`);
  const fn = dest.split('/').at(-1);
  if (dest.includes(`/${inventory.repository}/releases/download/${inventory.tag}/`)) {
    assert.ok(tspSet.has(fn), `Missing ${inventory.tag} release asset for ${videoPath} -> ${fn}`);
  } else if (inventory.secondaryRepository && dest.includes(`/${inventory.secondaryRepository}/releases/download/${inventory.secondaryTag}/`)) {
    assert.ok(septSet.has(fn), `Missing ${inventory.secondaryTag} release asset for ${videoPath} -> ${fn}`);
  } else {
    assert.fail(`Unrecognized release destination for ${videoPath}: ${dest}`);
  }
  totalVerified++;
}
console.log(`SEO video references verified: ${count} audited files (${totalVerified} total catalog videos) against ${inventory.checkedAt} release inventory.`);
