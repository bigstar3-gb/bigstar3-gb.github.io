// 국단비 놀이터 앱 — 저장 담당(서비스 워커)
// 파일 목록을 바꾸면 아래 버전 숫자를 하나 올립니다.
const VERSION = 'gukdanbi-play-v13';
const FILES = [
  'play.html', 'game.html', 'flower.html', 'brick.html', 'omok.html', 'diag.html', 'match.html', 'number.html', 'proverb.html', 'word.html', 'idiom.html', 'cross.html', 'sudoku.html', 'hwatu.html', 'fortune.html', 'gostop.html',
  'manifest.webmanifest', 'assets/css/style.css', 'assets/js/app.js', 'assets/js/flowers.js', 'assets/js/proverbs.js', 'assets/js/words.js', 'assets/js/idioms.js', 'assets/js/crosswords.js', 'assets/js/hwatu.js',
  'assets/img/etc/heart.png', 'assets/img/etc/omok-lose.jpg', 'assets/img/etc/samgwang.png',
  'assets/img/app/icon-192.png', 'assets/img/app/icon-512.png'
];
const full = p => new URL(p, self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const path = url.origin + url.pathname;
  const appFile = FILES.some(f => full(f) === path);
  const flower = url.pathname.includes('/assets/img/flowers/') || url.pathname.includes('/assets/img/hwatu/');   // 꽃 사진·화투 그림
  if (!appFile && !flower) return;          // 홈페이지 다른 파일은 손대지 않음

  if (flower) {                              // 꽃 사진: 저장본 먼저, 없으면 받아서 저장
    e.respondWith(caches.match(req, {ignoreSearch:true}).then(hit => hit ||
      fetch(req).then(res => { const cp = res.clone();
        if (res.ok) caches.open(VERSION).then(c => c.put(path, cp)); return res; })));
    return;
  }
  // 화면·코드: 인터넷에서 새 파일 먼저, 안 되면 저장본
  e.respondWith(fetch(req).then(res => { const cp = res.clone();
      if (res.ok) caches.open(VERSION).then(c => c.put(path, cp)); return res; })
    .catch(() => caches.match(path)));
});
