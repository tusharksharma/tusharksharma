/** Render indexable routes into their generated HTML so recipes and links are
 * present in the HTTP response before the client bundle runs. */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = resolve(root, `.${pathname}`);
    if (!target.startsWith(root + sep) && target !== root) { res.writeHead(403).end(); return; }
    const file = existsSync(target) && extname(target) ? target : join(target, 'index.html');
    const content = await readFile(file);
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.end(content);
  } catch { res.writeHead(404).end(); }
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const port = server.address().port;
const chrome = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome');
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-service-worker'] });
try {
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>https:\/\/thesplitplate\.com([^<]*)<\/loc>/g)].map((match) => match[1] || '/').filter((path) => !process.env.PRERENDER_PATH || path === process.env.PRERENDER_PATH);
  let index = 0;
  await Promise.all(Array.from({ length: 1 }, async () => {
    const page = await browser.newPage();
    page.on('pageerror', (error) => console.error('Page error:', error.message));
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith(`http://127.0.0.1:${port}/`) || /\.(?:mp4|m4a|webp|png|jpe?g|gif)(?:\?|$)/i.test(url)) request.abort();
      else request.continue();
    });
    try {
      while (index < paths.length) {
        const path = paths[index++];
        await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        try { await page.waitForFunction(() => {
          const root = document.getElementById('root');
          return root && root.querySelectorAll('a').length >= 2 && root.textContent.trim().length > 200;
        }, { timeout: 30000 }); } catch (error) {
          console.error(`Render failed at ${path}:`, await page.$eval('#root', (node) => ({ textLength: node.textContent.trim().length, links: node.querySelectorAll('a').length, preview: node.textContent.slice(0, 250) })));
          throw error;
        }
        const content = await page.$eval('#root', (node) => node.innerHTML);
        const file = path === '/' ? join(root, 'index.html') : join(root, path, 'index.html');
        const html = await readFile(file, 'utf8');
        await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${content}</div>`));
        if (index % 20 === 0) console.log(`Rendered ${index}/${paths.length} routes`);
      }
    } finally { await page.close(); }
  }));
  console.log(`Rendered page content into ${paths.length} HTML routes.`);
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
