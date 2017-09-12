// A list of local resources we always want to be cached.
var CACHE_NAME = 'mapdata-cache';
const PRECACHE_URLS = [
  '../data/zonedata.json'
];

self.addEventListener('install', function(event) {
  console.log('The service worker is being installed.');
  // Ask the service worker to keep installing until the returning promise resolves.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_URLS);
      })
  );
});


// On fetch, use cache but update the entry with the latest contents from the server.
self.addEventListener('fetch', function(event) {
  console.log('The service worker is serving an asset.');
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});