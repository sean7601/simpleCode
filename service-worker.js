importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js"
);

workbox.setConfig({
  debug: true,
});

// Cache all files using stale-while-revalidate strategy
workbox.routing.registerRoute(
  ({ url }) => true,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "simpleCodeCache-v0.0.1",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 31560000, // 12 months
      }),
    ],
  })
);

// Ensure the app will be able to run even if offline
workbox.routing.setDefaultHandler(
  new workbox.strategies.StaleWhileRevalidate()
);

// Periodic background sync to update cache
workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(
  new RegExp("/"),
  new workbox.strategies.NetworkFirst({
    cacheName: "simpleCodeCache-v0.0.1",
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin("cache-update", {
        maxRetentionTime: 24 * 60, // Retry for max of 24 hours
      }),
    ],
  }),
  "GET"
);
