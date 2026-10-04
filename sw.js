// When editing a local asset, update its ?v=content-hash in index.html and this list.
const STATIC_ASSETS = [
    "assets/site.css?v=a5535994ad1a",
    "assets/scroll-video.css?v=786d0be9c0db",
    "assets/site.js?v=f269e5b29d4d",
    "assets/scroll-video.js?v=f8db10d41f0d",
    "assets/kite-poster.jpg?v=9906cd44fa39",
    "https://avatars.githubusercontent.com/u/49832869?s=400",
    "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/linkedin.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/youtube.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/github.svg",
    "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/instagram.svg",
    "https://www.icreatemagazine.nl/app/uploads/2023/08/Procreate.png",
    "https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/telegram.svg",
    "assets/favicon.svg?v=4f9a4121969a"
];
const CACHE_PREFIX = 'irusland-static-';
const CACHE_NAME = CACHE_PREFIX + "ac0c93036c05";
const allowed = new Set(STATIC_ASSETS.map(path => new URL(path, self.location.href).href));
const pending = new Map();

async function cacheFirst(request) {
    let cache;
    try {
        cache = await caches.open(CACHE_NAME);
        const hit = await cache.match(request);
        if (hit) return hit;
    } catch { /* Fall through to the network when browser storage is unavailable. */ }
    const key = request.url;
    if (!pending.has(key)) {
        const task = (async () => {
            const response = await fetch(request);
            // External <img> requests can be opaque (no CORS). Cache.put supports those.
            if (cache && (response.status === 200 || response.type === 'opaque')) {
                try { await cache.put(request, response.clone()); } catch { /* Quota exceeded. */ }
            }
            return response;
        })();
        pending.set(key, task);
        task.finally(() => pending.delete(key)).catch(() => {});
    }
    return (await pending.get(key)).clone();
}

self.addEventListener('install', event => {
    // Best effort: one unavailable logo must not block installation.
    event.waitUntil((async () => {
        await Promise.allSettled([...allowed].map(url => cacheFirst(new Request(url, {
            mode: new URL(url).origin === self.location.origin ? 'same-origin' : 'no-cors',
            credentials: 'omit',
        }))));
        await self.skipWaiting();
    })());
});
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        try {
            const names = await caches.keys();
            await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
                .map(name => caches.delete(name)));
        } catch { /* Storage is optional. */ }
        await self.clients.claim();
    })());
});
self.addEventListener('fetch', event => {
    // HTML stays fresh; video has its own complete-file cache. Never intercept embeds/ranges.
    if (event.request.method !== 'GET' || event.request.headers.has('Range') || !allowed.has(event.request.url)) return;
    event.respondWith(cacheFirst(event.request));
});
