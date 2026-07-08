// Ezra's Money Grows Dashboard — Service Worker v4.0.0
const CACHE_NAME = 'ezra-dashboard-v4';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/gold-t.svg',
  './assets/icon.svg',
  './assets/icon-512.jpg',
  './new_banner.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install: pre-cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Cache successful GET responses for future offline use
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If both cache and network fail, return a basic offline page
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
