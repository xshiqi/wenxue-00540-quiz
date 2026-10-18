// 最小 Service Worker：只为「离线也能打开」这一件事存在。
// 策略是网络优先 —— 有网时永远拿最新的，没网时回退到上次缓存的页面。
// 这样既不会把旧题库锁死在手机上，又保证考场断网时还能刷。
const CACHE = 'wenxue-quiz-v1';
const KEY = './index.html';

self.addEventListener('install', (e) => {
  // 首次访问就先把页面存下来：否则要等 SW 接管后第二次访问才缓存，
  // 而「考场里第一次打开就没网」正是最需要它的时候
  e.waitUntil(
    caches.open(CACHE).then(c => c.add(KEY)).catch(() => {}).then(() => self.skipWaiting())
  );
});

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
