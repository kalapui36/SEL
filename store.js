/* 대문·관리자 페이지가 함께 쓰는 데이터 도우미 */
const Store = (() => {
  const KEY = "sel-garden-data";
  const file = window.SITE_DATA;

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function readLocal() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /* 이 기기에서 고친 내용이 있으면 그걸 쓰고,
     그 사이 apps.js가 새로 올라왔다면(updated 다름) 파일 쪽을 씁니다. */
  function load() {
    const local = readLocal();
    if (local && local.base === file.updated && Array.isArray(local.data?.apps)) {
      return local.data;
    }
    return clone(file);
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ base: file.updated, data }));
      return true;
    } catch {
      return false;
    }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch {}
    return clone(file);
  }

  function exportFile(data) {
    const out = { ...data, updated: new Date().toISOString() };
    const body =
`/* ==========================================================
   앱 목록 데이터
   - 관리자 페이지(왼쪽 위 🌱 3초 꾹)에서 수정 후
     "배포 파일 내려받기"로 받은 파일로 이 파일을 교체하면 됩니다.
   - icon : 이모지 한 글자, 또는 이미지(data:image… / 파일 경로)
   - url  : 같은 저장소 apps 폴더에 넣었다면 "apps/파일이름.html"
            다른 곳에 올린 앱이면 "https://…" 전체 주소
   - pin  : 관리자 암호 (화면에서 가려 두는 정도의 가벼운 잠금입니다)
   ========================================================== */
window.SITE_DATA = ${JSON.stringify(out, null, 2)};
`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/javascript" }));
    a.download = "apps.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const isImage = (icon) => /^data:image\//.test(icon) || /\.(png|jpe?g|gif|webp|svg)$/i.test(icon);

  function iconHTML(icon) {
    return isImage(icon) ? `<img src="${esc(icon)}" alt="">` : esc(icon || "🌱");
  }

  /* javascript: 같은 주소는 막고 http(s)·상대경로만 허용 */
  function safeUrl(url) {
    const u = String(url || "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "";
    return u;
  }

  return { load, save, reset, exportFile, esc, iconHTML, safeUrl };
})();
