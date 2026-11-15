// 국단비 놀이터 앱 공통 — 저장 담당 켜기 + 앱 안에서는 '놀이터로'가 앱 첫 화면으로
(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js'); });
  }
  var inApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (!inApp) return;
  document.querySelectorAll('a[href="index.html#playground"]').forEach(function(a){ a.href = 'play.html'; });
})();
