// 국단비 놀이터 앱 — 저장 담당(서비스 워커)
// 파일 목록을 바꾸면 아래 버전 숫자를 하나 올립니다.
const VERSION = 'gukdanbi-play-v19';
const FILES = [
  'play.html', 'game.html', 'flower.html', 'brick.html', 'omok.html', 'diag.html', 'match.html', 'number.html', 'proverb.html', 'word.html', 'idiom.html', 'cross.html', 'sudoku.html', 'hwatu.html', 'fortune.html', 'gostop.html', 'chunja.html', 'chess.html', 'janggi.html', 'baduk.html',
  'manifest.webmanifest', 'assets/css/style.css', 'assets/js/app.js', 'assets/js/flowers.js', 'assets/js/proverbs.js', 'assets/js/words.js', 'assets/js/idioms.js', 'assets/js/crosswords.js', 'assets/js/hwatu.js', 'assets/js/chunja.js',
  'assets/img/etc/heart.png', 'assets/img/etc/omok-lose.jpg', 'assets/img/etc/samgwang.png', 'assets/img/etc/janggi-han.png', 'assets/img/etc/baduk-icon.png',
  'assets/img/app/icon-192.png', 'assets/img/app/icon-512.png',
  'assets/engine/chess.js', 'assets/engine/stockfish-19-lite-single.js', 'assets/engine/stockfish-19-lite-single.wasm',
  'assets/img/chess/wK.svg', 'assets/img/chess/wQ.svg', 'assets/img/chess/wR.svg', 'assets/img/chess/wB.svg', 'assets/img/chess/wN.svg', 'assets/img/chess/wP.svg', 'assets/img/chess/bK.svg', 'assets/img/chess/bQ.svg', 'assets/img/chess/bR.svg', 'assets/img/chess/bB.svg', 'assets/img/chess/bN.svg', 'assets/img/chess/bP.svg',
  'assets/engine/ffish/ffish.js', 'assets/engine/fairy/stockfish.js', 'assets/engine/fairy/stockfish.wasm', 'assets/engine/fairy/stockfish.worker.js',
  'assets/engine/katago/katago-worker.js', 'assets/engine/katago/g170-b6c96.bin.gz', 'assets/engine/katago/tfjs/tfjs-backend-wasm.wasm', 'assets/engine/katago/tfjs/tfjs-backend-wasm-simd.wasm', 'assets/engine/katago/tfjs/tfjs-backend-wasm-threaded-simd.wasm'
];
const full = p => new URL(p, self.registration.scope).href;
// 장기처럼 '격리 모드'가 필요한 화면(컴퓨터 두뇌가 여러 일꾼을 씀): 응답에 격리 표시 두 줄을 붙임
const COI = ['janggi.html', 'assets/engine/fairy/'];
const needCoi = path => COI.some(f => path.startsWith(full(f)));
function coi(res) {
  if (!res || res.type === 'opaque') return res;
  const h = new Headers(res.headers);
  h.set('Cross-Origin-Embedder-Policy', 'require-corp');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  const wrap = needCoi(path) ? coi : (r => r);
  // cache:'no-cache' = 브라우저 저장본(10분)을 그냥 쓰지 말고 홈페이지에 새 파일이 있는지 꼭 확인
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { const cp = res.clone();
      if (res.ok) caches.open(VERSION).then(c => c.put(path, cp)); return wrap(res); })
    .catch(() => caches.match(path).then(wrap)));
});
