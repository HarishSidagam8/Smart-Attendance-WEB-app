const CACHE_NAME = "attendance-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/style.css",        // if you have one
  "/script.js",        // your JS logic file
  "/icons/icon-192.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
