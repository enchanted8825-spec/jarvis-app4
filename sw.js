const CACHE_NAME = 'jarvis-shell-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Network-first for API calls and dynamic data; cache-first for the app shell itself.
  const url = new URL(req.url);
  const isShell = ASSETS.some((a) => req.url.endsWith(a.replace('./', '')));
  if (isShell) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
