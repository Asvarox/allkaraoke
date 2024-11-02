 

const CACHE_NAME = 'allkaraoke-party-app-cache-v1';

// Use the 'install' event to pre-cache all initial resources.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(['/']);
    })(),
  );
});

const swOrigin = self.location.origin;

self.addEventListener('fetch', (event) => {
  // Only cache local resources
  if (new URL(event.request.url).origin === swOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          // Try to fetch the resource from the network.
          const fetchResponse = await fetch(event.request);

          // Save the resource in the cache.
          cache.put(event.request, fetchResponse.clone());

          // And return it.
          return fetchResponse;
        } catch (e) {
          // Fetching didn't work get the resource from the cache.
          const cachedResponse = await cache.match(event.request);

          // And return it.
          return cachedResponse;
        }
      })(),
    );
  } else {
    return;
  }
});
