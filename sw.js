const CACHE_NAME = 'mamani-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './img/app_icon.webp'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Obliga al nuevo Service Worker a activarse de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // Toma control de las pestañas abiertas inmediatamente
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
