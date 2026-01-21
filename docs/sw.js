const CACHE_NAME = 'carerisk-v1.0.3'; // Incrémentez la version
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://kit.fontawesome.com/a076d05399.js'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch : network-first pour Firebase et navigation (HTML), cache-first pour les assets
self.addEventListener('fetch', function(event) {
  const req = event.request;
  const url = new URL(req.url);

  // Ne pas servir depuis le cache les requêtes vers Firebase/Google : network-first
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('firebasedatabase') ||
      url.hostname.includes('gstatic') ||
      url.hostname.includes('googleapis') ||
      url.pathname.includes('/__/firebase')
     ) {
    event.respondWith(
      fetch(req).then(function(response) {
        return response;
      }).catch(function() {
        return caches.match(req);
      })
    );
    return;
  }

  // Navigation (documents) : network-first pour s'assurer d'avoir la dernière version de l'HTML
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then(function(response) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return response;
      }).catch(function() {
        return caches.match(req);
      })
    );
    return;
  }

  // Autres requêtes (assets) : cache-first
  event.respondWith(
    caches.match(req).then(function(response) {
      return response || fetch(req).then(function(networkResponse) {
        // Optionnel : mettre en cache les assets
        // caches.open(CACHE_NAME).then(cache => cache.put(req, networkResponse.clone()));
        return networkResponse;
      }).catch(function() {
        return response;
      });
    })
  );
});
