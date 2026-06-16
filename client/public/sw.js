const CACHE_NAME = 'kotulo-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add other static assets as needed
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always go to network for JS/CSS assets (Vite hashed bundles)
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Cache-first for static assets (icons, manifest)
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        if (request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

async function doBackgroundSync() {
  // Handle background sync for offline orders
  // This would sync any pending orders when connection is restored
  console.log('Background sync triggered');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'View',
          icon: '/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});
