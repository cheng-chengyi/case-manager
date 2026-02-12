const CACHE_NAME = 'case-mgmt-v1';
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

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
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
