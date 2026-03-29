const CACHE_NAME = 'case-mgmt-v2';
const URLS_TO_CACHE = ['./index.html', './manifest.json'];

// Install - cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - cache same-origin GET requests only (avoid caching credentialed API calls)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Listen for messages from main page (reminder notifications)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification('待辦提醒 🔔', {
      body: event.data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'todo-reminder',
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'view', title: '查看待辦' },
        { action: 'dismiss', title: '稍後' }
      ]
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({ type: 'OPEN_TODOS' });
      } else {
        self.clients.openWindow('./index.html');
      }
    })
  );
});
