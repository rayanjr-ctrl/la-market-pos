/* LA Market POS – keeps the app working with no internet */
const CACHE_NAME = "la-market-pos-v3";
const FILES = ["./", "index.html", "products.json", "xlsx.full.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                       // fonts etc.: browser decides
  if (url.search.includes("t=")) return;                            // explicit "update product list" bypasses the cache
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok){ const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match("index.html"))));
});
