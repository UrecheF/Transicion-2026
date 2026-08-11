/* Service Worker — Transición 2026
   Cachea el "app shell" para que la página cargue instantáneamente
   y funcione, en gran parte, sin conexión. */

const CACHE_NAME = 'transicion-2026-v3';
// Solo el "app shell" que siempre existe. El audio y otros archivos opcionales
// NO van aquí: cache.addAll() falla en bloque si un solo recurso da 404, lo
// que dejaba la app completa sin caché offline si aún no se había subido la
// música. Esos recursos opcionales se cachean solos en el fetch handler.
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './config.json',
  './manifest.json',
  './assets/images/bg-full.jpg',
  './assets/images/logo-crop.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
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
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
