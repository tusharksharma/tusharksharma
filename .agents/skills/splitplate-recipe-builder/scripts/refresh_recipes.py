"""Refresh public Split Plate Recipe JSON-LD and ingredient frequency evidence."""
import concurrent.futures
import datetime
import html
import json
import re
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'references'
BASE = 'https://thesplitplate.com'

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'SplitPlateRecipeBuilder/1.0'})
    with urllib.request.urlopen(req, timeout=35) as response:
        return response.read().decode('utf-8')

def read_recipe(url):
    try:
        page = fetch(url)
        for block in re.findall(r'<script[^>]*type=[\"\']application/ld\+json[\"\'][^>]*>(.*?)</script>', page, re.S):
            data = json.loads(html.unescape(block))
            items = data if isinstance(data, list) else [data]
            for item in items:
                for recipe in item.get('@graph', [item]):
                    types = recipe.get('@type', [])
                    if types == 'Recipe' or isinstance(types, list) and 'Recipe' in types:
                        return {'url': url, 'recipe': recipe}, None
        return None, {'url': url, 'error': 'No Recipe JSON-LD'}
    except Exception as exc:
        return None, {'url': url, 'error': str(exc)}

def main():
    urls = set()
    discovery_errors = []
    for route in ['/', '/dinners', '/cookbook', '/sitemap.xml']:
        try:
            page = fetch(BASE + route)
            for path in re.findall(r'(?:https://thesplitplate\.com)?(/(?:recipes|cookbook)/[a-z0-9-]+)', page):
                urls.add(BASE + path)
        except Exception as exc:
            discovery_errors.append({'url': BASE + route, 'error': str(exc)})
    if not urls:
        raise SystemExit('No recipe URLs discovered; existing snapshot preserved.')
    recipes, errors = [], discovery_errors
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for record, error in pool.map(read_recipe, sorted(urls)):
            if record:
                recipes.append(record)
            if error:
                errors.append(error)
    if not recipes:
        raise SystemExit('No recipes retrieved; existing snapshot preserved.')
    prior_path = ROOT / 'recipe-corpus.json'
    previous = json.loads(prior_path.read_text(encoding='utf-8')) if prior_path.exists() else {}
    stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    current = {record['url']: dict(record, fetched_at=stamp, current=True) for record in recipes}
    for old in previous.get('recipes', []):
        if old['url'] not in current:
            current[old['url']] = dict(old, current=False)
    result = {'refreshed_at': stamp, 'current_recipe_count': len(recipes), 'discovered_urls': len(urls),
              'errors': errors, 'recipes': sorted(current.values(), key=lambda x: x['url'])}
    ROOT.mkdir(parents=True, exist_ok=True)
    temp = prior_path.with_suffix('.tmp')
    temp.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
    temp.replace(prior_path)
    counts = Counter()
    for record in recipes:
        counts.update(set(re.sub(r'\s+', ' ', x.strip().lower()) for x in record['recipe'].get('recipeIngredient', [])))
    lines = ['# Ingredient evidence', '', f'Refreshed: {stamp}',
             f'Current recipes: {len(recipes)}; discovery/fetch errors: {len(errors)}.', '',
             'Counts are recipes containing each exact normalized ingredient line. These are not consolidated brand rankings.', '',
             '| Recipe count | Ingredient line |', '| --- | --- |']
    lines += [f'| {n} | {ingredient.replace(chr(124), chr(47))} |' for ingredient, n in counts.most_common(100)]
    (ROOT / 'ingredient-evidence.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps({'current_recipes': len(recipes), 'discovered_urls': len(urls), 'errors': len(errors), 'snapshot': str(prior_path)}))

if __name__ == '__main__':
    main()
