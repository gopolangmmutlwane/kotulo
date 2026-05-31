const CACHE_NAME = 'kotulo-v1';
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page for navigation requests
          if (event.request.destination === 'document') {
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Kotulo - Offline</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      font-family: Arial, sans-serif; 
                      text-align: center; 
                      padding: 50px;
                      background: #F4EFD9;
                    }
                    .container {
                      max-width: 420px;
                      margin: 0 auto;
                      background: #FFFFFF;
                      padding: 36px;
                      border-radius: 12px;
                      box-shadow: 0 6px 30px rgba(16,32,16,0.08);
                    }
                   h1 { color: #1E5832; margin-bottom: 16px; } 
                   h2 { color: #4F8F2F; margin-bottom: 12px; } 
                   p { color: #55614F; line-height: 1.5; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>🌱 Kotulo</h1>
                    <h2>You're offline</h2>
                    <p>Please check your internet connection and try again.</p>
                  </div>
                </body>
              </html>
              `,
              { 
                headers: { 'Content-Type': 'text/html' } 
              }
            );
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for offline orders (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
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
