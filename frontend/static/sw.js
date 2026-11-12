/* Service worker for the Katipunan Asset Management System (backend build)
   Strategy:
   - App shell is precached so the sign-in page and shell open offline.
   - Navigations are network-first (so auth/HTML changes are picked up) with a
     cached offline fallback.
   - API calls are never cached or intercepted.
   - Same-origin assets are cache-first with a background refresh.
   - Remaining CDN assets (fonts, icons, Chart.js) use stale-while-revalidate.
*/
const VERSION = 'katipunan-ams-v74.42';
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL_ASSETS = [
  './',
  './login.html',
  './index.html',
  './admin.html',
  './manifest.json',
  './static/css/app.css',
  './static/css/login.css',
  './static/css/admin.css',
  './static/js/sw-register.js',
  './static/js/bootstrap.js',
  './static/js/landing.js',
  './static/js/app.js',
  './static/js/lock-type.js',
  './static/js/lock-pin.js',
  './static/js/settings-columns.js',
  './static/js/procurement-forecast.js',
  './static/js/sync.js',
  './static/js/google-drive.js',
  './static/js/scan-sync.js',
  './static/js/notifications.js',
  './static/js/backend-integration.js',
  './static/js/login.js',
  './static/js/admin.js',
  './static/js/qrcode.min.js',
  './static/js/html5-qrcode.min.js',
  './static/images/icons/icon-192.png',
  './static/images/icons/icon-512.png',
  './static/images/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(
        SHELL_ASSETS.map((asset) => {
          // Bypass the browser HTTP cache so a new SW version installs the
          // current CSS/JS rather than an older cached copy.
          const url = new URL(asset, self.registration.scope).href;
          return fetch(new Request(url, { cache: 'reload' }))
            .then((response) => (response && response.ok ? cache.put(url, response) : null))
            .catch(() => null);
        })
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache or intercept the backend API.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // Page navigations: network first, fall back to the page or the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cross-origin CDN assets: stale-while-revalidate.
  if (url.origin !== self.location.origin) {
    if (!/^https?:$/.test(url.protocol)) return;
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && (response.ok || response.type === 'opaque')) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Same-origin assets: cache first, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
