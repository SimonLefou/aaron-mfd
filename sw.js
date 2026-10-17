// Service Worker for AARON MFD - 100% Offline Capability (v3.0.0 Star Citizen 4.0)
const CACHE_NAME = 'aaron-mfd-v3.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './fleet-net.js',
  './peerjs.min.js',
  './i18n.js',
  './mining-data.js',
  './data/index.js',
  './data/game/ships.js',
  './data/game/lasers.js',
  './data/game/modules.js',
  './data/game/gadgets.js',
  './data/game/components.js',
  './data/game/minerals.js',
  './data/game/refining.js',
  './data/game/locations.js',
  './data/game/salvage.js',
  './data/game/trade.js',
  './modules/salvage/salvage-calc.js',
  './modules/salvage/salvage-service.js',
  './modules/starmap/aaron-halo-calc.js',
  './modules/starmap/starmap-service.js',
  './modules/starmap/starmap-canvas.js',
  './data/defaults/factory-loadouts.js',
  './data/defaults/guild-defaults.js',
  './data/defaults/changelog.js',
  './manifest.json',
  './ROADMAP.md',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[AARON Service Worker] Caching app shell v2.3.0');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[AARON Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First strategy: always fetch freshest version if online, fallback to cache if offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to offline cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

