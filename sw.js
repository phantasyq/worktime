const CACHE = 'work-time-shell-v7';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./config.js','./production-calendar.js','./manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil((async()=>{for(const key of await caches.keys()) if(key!==CACHE) await caches.delete(key); await self.clients.claim();})()));
// Network-first for first-party app files so GitHub Pages updates are not trapped in an older cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith((async()=>{
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response && response.ok) cache.put(event.request, response.clone()).catch(()=>{});
      return response;
    } catch (error) {
      return (await cache.match(event.request)) || (await cache.match('./index.html')) || Response.error();
    }
  })());
});
