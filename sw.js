// 最小 Service Worker：只为「离线也能打开」这一件事存在。
// 策略是网络优先 —— 有网时永远拿最新的，没网时回退到上次缓存的页面。
// 这样既不会把旧题库锁死在手机上，又保证考场断网时还能刷。
const CACHE = 'wenxue-quiz-v1';
const KEY = './index.html';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;   // 只管页面本身，其它请求不插手
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(KEY, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(KEY).then(r => r || caches.match(e.request)))
  );
});
