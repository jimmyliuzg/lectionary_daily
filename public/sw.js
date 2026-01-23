const CACHE_NAME = 'rcl-daily-v1';
const ASSETS_TO_CACHE = [
    '/rcl/',
    '/rcl-manifest.json',
    '/rcl-icon-192.png',
    '/rcl-icon-512.png',
    'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Use a cache-first strategy for static assets
    // and network-first for potential API/data calls
    const url = new URL(event.request.url);

    // Cache-first for images and fonts
    if (url.origin !== self.location.origin || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((fetchRes) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, fetchRes.clone());
                        return fetchRes;
                    });
                });
            })
        );
        return;
    }

    // Network-first for the shell and manifest
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
