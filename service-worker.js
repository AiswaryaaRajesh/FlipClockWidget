const CACHE_NAME = 'flip-clock-cache-v2'; // Increment v to force-update

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon192x192.png',
  './icon512x512.png',
  './screenshot-mobile.png',
  './screenshot-desktop.png',
];

// Install — cache app shell
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new service worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim(); // Become active SW for all clients immediately
});

// Fetch — serve from cache first, then update in background
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchAndUpdate = fetch(event.request)
        .then(networkResponse => {
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // fallback to cache if offline

      return cachedResponse || fetchAndUpdate;
    })
  );
});
