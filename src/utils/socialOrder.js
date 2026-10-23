import publication from '../data/socialPublication.json' with { type: 'json' };

// Updates never change these historical keys. Unknown/new packages append.
// A creation/catalog date is only a provisional fallback, never a posted claim.
export function socialOrderKey(item) {
  const record = publication[item.slug || item.id];
  return item.initialMainPostDate || record?.initialMainPostDate ||
    record?.initialMainCreatedAt || record?.firstAddedAt || '9999-12-31';
}

export function sortSocialRecipes(items) {
  return items.map((item, index) => ({ item, index }))
    .sort((a, b) => socialOrderKey(a.item).localeCompare(socialOrderKey(b.item)) || a.index - b.index)
    .map(({ item }) => item);
}
