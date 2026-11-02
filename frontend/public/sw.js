// Hawi Pictures & Bridal Zone - Progressive Web App Service Worker
// Version: 1.1.0

const CACHE_VERSION = 'hawi-v1.1.0';
const STATIC_CACHE = `hawi-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `hawi-images-${CACHE_VERSION}`;
const PAGE_CACHE = `hawi-pages-${CACHE_VERSION}`;

const MAX_IMAGE_CACHE_ENTRIES = 60;

// Static assets precached on install (only core design, fonts, icons, offline fallbacks)
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/admin-icon-192.png',
  '/shortcut-booking.png',
  '/shortcut-packages.png',
  '/shortcut-admin.png',
  '/placeholder-offline.png',
  '/placeholder-offline.svg'
];

/**
 * Strict Privacy & Security Blacklist:
 * NEVER cache admin pages, bookings, payment screenshots, customer personal data,
 * or API routes with sensitive responses.
 */
function isBlacklisted(url, request) {
  if (request.method !== 'GET') return true;

  const pathname = url.pathname.toLowerCase();

  // Strict exclusions
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.includes('receipt') ||
    pathname.includes('payment') ||
    pathname.includes('booking') ||
    pathname.includes('customer') ||
    pathname.includes('client') ||
    pathname.includes('telegram') ||
    pathname.includes('secret')
  ) {
    return true;
  }

  // Exclude non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return true;
  }

  // Exclude requests with Authorization header
  if (request.headers && request.headers.has('Authorization')) {
    return true;
  }

  return false;
}

/**
 * Cache LRU trimmer to enforce size limits (e.g. max 60 images)
 */
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      return trimCache(cacheName, maxItems);
    }
  } catch (err) {
    console.warn('[Hawi SW] Trim cache error:', err);
  }
}

// Installation event: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_ASSETS.map((asset) =>
            cache.add(asset).catch((err) => {
              console.warn(`[Hawi SW] Precache omitted for ${asset}:`, err);
            })
          )
        );
      })
  );
});

// Activation event: delete all legacy version caches and claim clients
self.addEventListener('activate', (event) => {
  const activeCaches = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name.startsWith('hawi-') && !activeCaches.includes(name)) {
              console.log(`[Hawi SW] Purging old cache version: ${name}`);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Client communication listener
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Manual skip-waiting trigger
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Clear private caches on user logout
  if (event.data.type === 'CLEAR_USER_DATA') {
    caches.delete(PAGE_CACHE);
    caches.delete(IMAGE_CACHE);
  }
});

// Fetch event: Apply tailored caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Directly pass through blacklisted requests without touching cache
  if (isBlacklisted(url, request)) {
    return;
  }

  // 1. NAVIGATION REQUESTS (Pages): Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, check if page was previously viewed
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          // Fallback to offline page
          const offlineFallback = await caches.match('/offline');
          if (offlineFallback) {
            return offlineFallback;
          }

          const rootFallback = await caches.match('/');
          if (rootFallback) {
            return rootFallback;
          }

          return new Response(
            '<!DOCTYPE html><html><head><title>Offline - Hawi Pictures</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#FAF7F2;color:#14110E"><h1>Hawi Pictures & Bridal Zone</h1><p>You are offline. Please reconnect to access this page.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. IMAGE ASSETS: Stale-While-Revalidate with size limit & offline placeholder
  const isImage =
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|avif|ico)$/i);

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
              // Enforce maximum cache size
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES);
            }
            return networkResponse;
          })
          .catch(() => null);

        // If cached, return immediately while revalidating
        if (cachedResponse) {
          return cachedResponse;
        }

        // Wait for network response if not cached
        const netRes = await fetchPromise;
        if (netRes) {
          return netRes;
        }

        // Uncached image requested while offline: return elegant offline placeholder
        const placeholder = await caches.match('/placeholder-offline.png');
        if (placeholder) {
          return placeholder;
        }

        const svgPlaceholder = await caches.match('/placeholder-offline.svg');
        if (svgPlaceholder) {
          return svgPlaceholder;
        }

        return new Response('', { status: 408, headers: { 'Content-Type': 'image/png' } });
      })
    );
    return;
  }

  // 3. STATIC NEXT.JS CHUNKS & GOOGLE FONTS: Cache-First
  const isStaticChunk =
    url.pathname.startsWith('/_next/static/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isStaticChunk) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }
});

// ==========================================
// PUSH NOTIFICATIONS (PREPARATION & HANDLERS)
// ==========================================
self.addEventListener('push', (event) => {
  /**
   * PLACEHOLDER: Server-Side Web Push Notification Payload
   * When the backend server (Node.js/Next API/Firebase) issues a push:
   * webpush.sendNotification(subscription, JSON.stringify({
   *   title: "New Booking Received",
   *   body: "Bride: Bethlehem - Special Package on Nov 14",
   *   url: "/admin"
   * }))
   */
  let title = 'Hawi Pictures & Bridal Zone';
  let options = {
    body: 'A new wedding or bridal booking has been submitted!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/admin',
      receivedAt: Date.now()
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.title) title = payload.title;
      if (payload.body) options.body = payload.body;
      if (payload.url) options.data.url = payload.url;
    } catch {
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler: navigates directly to Admin Dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
