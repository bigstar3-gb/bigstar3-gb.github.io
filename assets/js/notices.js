// ===== 국단비 공지사항 =====
// 공지는 구글 시트 "국단비 홈페이지 공지사항"에 적으면 홈페이지에 자동으로 나옵니다.
// 시트 칸: 날짜 | 제목 | 내용 | 보이기  (보이기 칸에 X를 적으면 숨김)
// 이 파일은 고칠 필요가 없습니다.

const NOTICE_SHEET_ID = "1If3aY2x8hOBiKw2AaDfZa0MS8TBACraZZDi25X3w48c";
const NOTICE_MAX = 5;   // 펼쳤을 때 보여 줄 공지 개수

(function () {
  const box = document.getElementById('notice');
  if (!box) return;

  // CSV 한 줄씩 나누기 (따옴표 안의 쉼표·줄바꿈 처리)
  function parseCSV(t) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) {
        if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  fetch(`https://docs.google.com/spreadsheets/d/${NOTICE_SHEET_ID}/gviz/tq?tqx=out:csv`)
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(text => {
      const rows = parseCSV(text).slice(1)                      // 첫 줄(칸 이름) 빼기
        .map(r => ({ date: (r[0] || '').trim(), title: (r[1] || '').trim(), text: (r[2] || '').trim(), show: (r[3] || '').trim().toUpperCase() }))
        .filter(n => n.title && n.show !== 'X')
        .reverse()                                              // 시트 맨 아래(새로 추가한) 줄이 위로
        .slice(0, NOTICE_MAX);
      if (!rows.length) return;                                  // 공지가 없으면 띠를 숨긴 채로 둠
      box.innerHTML = `
        <details class="notice-box">
          <summary><span class="n-tag">📢 알림</span><span class="n-latest">${esc(rows[0].title)}</span><span class="n-date">${esc(rows[0].date)}</span><span class="n-arrow">▼</span></summary>
          <ul>${rows.map(n => `<li><div class="n-head"><b>${esc(n.title)}</b><span>${esc(n.date)}</span></div>${n.text ? `<p>${esc(n.text)}</p>` : ''}</li>`).join('')}</ul>
        </details>`;
      box.hidden = false;
    })
    .catch(() => { /* 시트를 못 읽으면 조용히 숨김 */ });
})();
