const CACHE_VERSION = 'v2';
const CACHE_NAME = `off-point-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './lib/leaflet.js',
  './lib/leaflet.css',
  './lib/pmtiles.js',
  './lib/protomaps-leaflet.js',
  './lib/idb-keyval.js',
  './lib/images/layers.png',
  './lib/images/layers-2x.png',
  './lib/images/marker-icon.png',
  './lib/images/marker-icon-2x.png',
  './lib/images/marker-shadow.png',
  './js/app.js',
  './js/map.js',
  './js/pmtiles-source.js',
  './js/waypoints.js',
  './js/icons.js',
  './js/storage.js',
  './js/sidebar.js',
  './js/openmaptiles-theme.js',
  './js/export.js',
  './data/world_z5.pmtiles',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const base = self.registration.scope;
        const urls = PRECACHE_URLS.map(u => new URL(u, base).href);
        return cache.addAll(urls);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
