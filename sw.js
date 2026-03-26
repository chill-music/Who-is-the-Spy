const CACHE_NAME = 'pro-spy-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './vip.css',
  './src/01-config.js',
  './src/02-audio.js',
  './src/03-data-funpass.js',
  './src/04-data-game.js',
  './src/05-translations.js',
  './src/06-components-base.js',
  './src/07-components-gifts.js',
  './src/08-components-shop.js',
  './src/09-components-user.js',
  './src/10-app.js',
  './src/11-modal-selfchat.js',
  './src/12-modal-funpass.js',
  './src/13-modal-chat.js',
  './src/14-modals-misc.js',
  './src/16-main.js',
  './src/17-vip.js',
  './src/18-admin-panel.js',
  './src/19-family.js',
  './src/20-couples.js',
  './src/21-bff.js',
  './src/features/pwa/PWAHandler.js',
  './src/features/profile/ProfileHelpers.js',
  './icos/icon-192.png',
  './icos/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
