// Service worker minimal : cache des ressources statiques + page hors ligne
const CACHE = "mmkids-v1";
const OFFLINE_URLS = ["/", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Images produits et assets Next : cache d'abord
  if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }
  // Pages : réseau d'abord, repli sur le cache hors connexion
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/"))));
  }
});
