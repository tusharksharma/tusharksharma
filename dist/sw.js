const CACHE_NAME = "splitplate-v2";
const OFFLINE_URL = "/";

// On install, precache the app shell. The JS/CSS hashes change per build,
// so we cache them on first fetch instead of hardcoding filenames.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        OFFLINE_URL,
        "/manifest.json",
        "/images/favicon.png",
        "/images/logo-sm.png",
      ])
    )
  );
  // Take control immediately — don't wait for existing tabs to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clean old caches and claim all open tabs
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  // Navigation requests (HTML pages) — network first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // JS/CSS bundles — cache on first fetch, serve from cache after.
  // This ensures the hashed bundle files are available offline after first visit.
  if (request.url.match(/\/assets\/index-[A-Za-z0-9_-]+\.(js|css)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Other assets (images, fonts) — cache first, update in background
  if (request.url.match(/\.(png|jpg|jpeg|webp|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
