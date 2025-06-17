const CACHE_NAME = 'timbrature-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(cacheRes => {
        return cacheRes || fetch(evt.request)
          .then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(evt.request, fetchRes.clone());
              return fetchRes;
            });
          });
      }).catch(() => {
        // fallback se vuoi (es. pagina offline)
      })
  );
});
