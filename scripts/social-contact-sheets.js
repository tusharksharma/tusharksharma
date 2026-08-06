/**
 * social:contact-sheets — batch-review harness.
 *
 * Boots `vite preview` against the prebuilt dist/, visits every social
 * carousel route with puppeteer-core + the locally-installed Chrome,
 * captures each card at 540×540 (its on-screen size), and composites
 * one labeled contact-sheet PNG per recipe under dist/contact-sheets/
 * (gitignored — this is a review artifact, not a build artifact).
 *
 * The renderer stays put. This script exists so a batch of ~15 recipes
 * can be visually reviewed side-by-side after auto-classification,
 * without deploying and eyeballing 15 hosted pages one at a time.
 *
 * Usage:
 *   npm run build                    # produce dist/ + prerender routes
 *   npm run social:contact-sheets    # boot preview, capture, composite
 *
 * Flags:
 *   --slug=foo,bar    Only these recipe slugs (comma-separated).
 *   --dinners-only    Skip /social/cookbook/*.
 *   --port=4173       Override the vite-preview port.
 *   --chrome=<path>   Override the Chrome executable.
 */

import { readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const OUT = join(DIST, "contact-sheets");

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const PORT = Number(args.get("port") || 4173);
const CHROME = args.get("chrome") || findChrome();
const CARD_PX = 540;    // on-screen size per card
const GUTTER = 24;      // spacing between cards on the sheet
const COLS = 3;
const LABEL_HEIGHT = 26;
const SHEET_PAD = 40;

if (!CHROME || !existsSync(CHROME)) {
  console.error("Could not find Chrome. Pass --chrome=/path/to/Chrome or set CHROME_PATH.");
  process.exit(1);
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("dist/ not found. Run `npm run build` first.");
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const routes = collectRoutes();
  const filtered = filterRoutes(routes);
  if (!filtered.length) {
    console.error("No social routes matched the filter.");
    process.exit(1);
  }
  console.log(`[contact-sheets] ${filtered.length} route(s) queued`);

  const server = await startPreview(PORT);
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME,
      headless: "new",
      // Wide viewport so multiple cards paint in one pass; tall enough
      // to hold the longest carousel without repeated scrolling.
      defaultViewport: { width: 640, height: 1400, deviceScaleFactor: 1 },
      args: [
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-features=Translate,InstallableManifest,WebAppInstallation",
        "--disable-notifications",
      ],
    });
    const page = await browser.newPage();
    // Suppress the site's custom "Add to Home Screen" prompt so it
    // doesn't overlay whichever card is on-screen when it triggers.
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem("sp_install_dismissed", "1"); } catch { /* ignored */ }
    });

    for (const route of filtered) {
      const start = Date.now();
      try {
        await renderSheet(page, route, browser);
        console.log(`  ✓ ${route.slug} (${Date.now() - start}ms)`);
      } catch (err) {
        console.error(`  ✗ ${route.slug} — ${err.message}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  console.log(`[contact-sheets] wrote to ${OUT}`);
}

/**
 * Load /social/{slug}, wait for fonts + images, capture each card into
 * a PNG buffer, then hand the buffers off to buildContactSheet().
 */
async function renderSheet(page, route, browser) {
  const url = `http://localhost:${PORT}${route.path}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  // React hydrates client-side; wait for the first card wrapper to exist.
  await page.waitForSelector("[data-card-id]", { timeout: 15000 });

  // Fonts + every <img> inside a card must be settled before capture.
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const imgs = [...document.querySelectorAll("[data-card-id] img")];
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });

  const cards = await page.$$eval("[data-card-id]", (nodes) =>
    nodes.map((n) => {
      // Label span lives INSIDE the [data-card-id] wrapper (inside
      // DownloadableCard). Use scoped query, not parentElement — the
      // parent's first span is always card 1's label.
      const label = n.querySelector("span")?.textContent?.trim() || n.getAttribute("data-card-id") || "";
      return { id: n.getAttribute("data-card-id"), label };
    }),
  );

  if (!cards.length) throw new Error("no cards found in DOM");

  const shots = [];
  for (const card of cards) {
    const handle = await page.$(`[data-card-id="${cssEscape(card.id)}"] .aspect-square`);
    if (!handle) continue;
    // Scroll into view so image lazy-loading and layout settle before capture.
    await handle.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await sleep(80);
    const raw = await handle.screenshot({ type: "png", omitBackground: false });
    // Puppeteer 24 returns Uint8Array; Buffer.toString("base64") on a
    // raw Uint8Array produces garbage. Wrap explicitly.
    const b64 = Buffer.from(raw).toString("base64");
    shots.push({ id: card.id, label: card.label, png: b64 });
  }

  const sheetPage = await browser.newPage();
  try {
    const html = buildContactSheetHTML(route.slug, shots);
    await sheetPage.setContent(html, { waitUntil: "networkidle0" });
    await sheetPage.waitForSelector(".ready");
    const container = await sheetPage.$(".sheet");
    if (!container) throw new Error("sheet container missing");
    await container.screenshot({
      path: join(OUT, `${route.slug}.png`),
      type: "png",
      omitBackground: false,
    });
  } finally {
    await sheetPage.close();
  }
}

function buildContactSheetHTML(slug, shots) {
  const width = SHEET_PAD * 2 + COLS * CARD_PX + (COLS - 1) * GUTTER;

  const cells = shots
    .map(
      (s, i) => `
      <figure style="margin:0">
        <img src="data:image/png;base64,${s.png}" width="${CARD_PX}" height="${CARD_PX}"
             style="display:block;border-radius:6px;background:#000" />
        <figcaption style="font:600 12px/1.4 -apple-system,BlinkMacSystemFont,Inter,sans-serif;
                     color:#a3a39c;margin-top:8px;letter-spacing:0.5px">
          ${escapeHtml(String(i + 1).padStart(2, "0"))}  ${escapeHtml(s.label)}
        </figcaption>
      </figure>`,
    )
    .join("\n");

  // Wait a frame after decoding all images before adding .ready so the
  // sheet screenshot always captures fully-painted content.
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body { margin: 0; background: #0b0b0a; }
    .sheet {
      width: ${width}px;
      padding: ${SHEET_PAD}px;
      background: #0b0b0a;
      color: #F7F7F4;
      box-sizing: border-box;
    }
    .title {
      font: 800 20px/1.2 -apple-system,BlinkMacSystemFont,Inter,sans-serif;
      color: #F5A300;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .meta {
      font: 500 12px/1.4 -apple-system,BlinkMacSystemFont,Inter,sans-serif;
      color: #A3A39C;
      margin-bottom: 32px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${COLS}, ${CARD_PX}px);
      column-gap: ${GUTTER}px;
      row-gap: ${GUTTER}px;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="title">${escapeHtml(slug)}</div>
    <div class="meta">${shots.length} card${shots.length === 1 ? "" : "s"} · contact sheet</div>
    <div class="grid">${cells}</div>
  </div>
  <script>
    (async () => {
      const imgs = [...document.querySelectorAll("img")];
      await Promise.all(imgs.map((i) => i.decode().catch(() => null)));
      requestAnimationFrame(() => document.querySelector(".sheet").classList.add("ready"));
    })();
  </script>
</body>
</html>`;
}

function collectRoutes() {
  const socialDir = join(DIST, "social");
  const routes = [];
  if (!existsSync(socialDir)) return routes;
  for (const entry of readdirSync(socialDir)) {
    const p = join(socialDir, entry);
    if (!statSync(p).isDirectory()) continue;
    if (entry === "cookbook") {
      for (const c of readdirSync(p)) {
        const cp = join(p, c);
        if (statSync(cp).isDirectory()) {
          routes.push({ slug: `cookbook-${c}`, path: `/social/cookbook/${c}` });
        }
      }
    } else {
      routes.push({ slug: entry, path: `/social/${entry}` });
    }
  }
  return routes.sort((a, b) => a.slug.localeCompare(b.slug));
}

function filterRoutes(routes) {
  let out = routes;
  const slug = args.get("slug");
  if (slug && typeof slug === "string") {
    const set = new Set(slug.split(",").map((s) => s.trim()).filter(Boolean));
    out = out.filter(
      (r) => set.has(r.slug) || set.has(r.slug.replace(/^cookbook-/, "")),
    );
  }
  if (args.get("dinners-only")) {
    out = out.filter((r) => !r.slug.startsWith("cookbook-"));
  }
  return out;
}

async function startPreview(port) {
  console.log(`[contact-sheets] booting vite preview on :${port}…`);
  // --host 127.0.0.1 binds v4 explicitly. Some vite versions bind IPv6
  // by default, which makes a plain 127.0.0.1 connection attempt fail.
  const proc = spawn(
    "npx",
    ["vite", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );

  let exited = false;
  proc.on("exit", (code) => { exited = true; console.error(`[contact-sheets] vite exited early (code ${code})`); });
  proc.stdout.on("data", (buf) => {
    if (process.env.DEBUG_CONTACT_SHEETS) process.stderr.write(`[vite] ${buf}`);
  });
  proc.stderr.on("data", (buf) => {
    const s = buf.toString();
    if (/error/i.test(s)) console.error(s);
    if (process.env.DEBUG_CONTACT_SHEETS) process.stderr.write(`[vite:err] ${s}`);
  });

  // Poll the port instead of parsing stdout — more robust across vite versions.
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (exited) throw new Error("vite preview exited before port opened");
    if (await portOpen(port)) return proc;
    await sleep(150);
  }
  proc.kill();
  throw new Error("vite preview boot timeout");
}

function portOpen(port) {
  return new Promise((resolve) => {
    const sock = createConnection({ host: "127.0.0.1", port }, () => {
      sock.end();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
    sock.setTimeout(500, () => { sock.destroy(); resolve(false); });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

function cssEscape(v) {
  return String(v).replace(/["\\]/g, "\\$&");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
