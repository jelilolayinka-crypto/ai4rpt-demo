const CACHE_NAME = "ai4rpt-cache-v7";
const PRECACHE_URLS = [
  "/ai4rpt-demo/",
  "/ai4rpt-demo/index.html",
  "/ai4rpt-demo/v2/",
  "/ai4rpt-demo/v2/index.html",
  "/ai4rpt-demo/v3/",
  "/ai4rpt-demo/v3/index.html",
  "/ai4rpt-demo/offline.html",
  "/ai4rpt-demo/manifest.json"
];

// Install: cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for same-origin; fallback to offline page
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // Cache new GET responses
          if (req.method === "GET" && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() => caches.match("/ai4rpt-demo/offline.html"));
    })
  );
});
