const CACHE_NAME = 'trinicloud-static-v1';
const DYN = 'trinicloud-dyn-v1';
const ASSETS = [
  '/',
  '/landing-page.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

function timeoutFetch(request, ms){
  return new Promise((resolve, reject) => {
    const timer = setTimeout(()=>reject(new Error('timeout')), ms);
    fetch(request).then(res => { clearTimeout(timer); resolve(res); }).catch(err => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API / external workers: network first with timeout -> cache fallback
  if (url.pathname.startsWith('/api') || url.hostname.endsWith('workers.dev')) {
    e.respondWith(
      timeoutFetch(e.request, 10000)
        .then(res => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(DYN).then(c => c.put(e.request, resClone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }
  // static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (!e.request.url.startsWith('http')) return res;
      caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(()=>caches.match('/landing-page.html')))
  );
});
