(() => {
  const COLORS = ["#F4A261", "#E9C46A", "#E76F51", "#D88C9A", "#8AB17D", "#7FB7BE"];
  const { esc, iconHTML, safeUrl } = Store;

  /* ---------- 앱 카드 ---------- */
  const gridEl = document.getElementById("grid");
  const { apps } = Store.load();

  gridEl.innerHTML = apps
    .map((a, i) => {
      const url = safeUrl(a.url);
      const style = `--c:${COLORS[i % COLORS.length]}; --d:${i * 60}ms`;
      const inner = `
        <span class="card-emoji">${iconHTML(a.icon)}</span>
        <h3 class="card-name">${esc(a.name)}</h3>
        <p class="card-desc">${esc(a.desc)}</p>
        <span class="card-open">${url ? "열어 보기 →" : "준비 중"}</span>`;
      return url
        ? `<a class="card" href="${esc(url)}" target="_blank" rel="noopener" style="${style}">${inner}</a>`
        : `<div class="card is-empty" style="${style}">${inner}</div>`;
    })
    .join("");

  /* ---------- 🌱 3초 꾹 → 관리자 ---------- */
  const sprout = document.getElementById("sprout");
  const HOLD = 3000;
  let timer = null;

  const goAdmin = () => { location.href = "admin.html"; };

  function start(e) {
    e.preventDefault();
    sprout.classList.add("is-holding");
    timer = setTimeout(() => {
      stop();
      if (PinGate.isOpen()) goAdmin();
      else PinGate.open({ onSuccess: goAdmin });
    }, HOLD);
  }
  function stop() {
    clearTimeout(timer);
    timer = null;
    sprout.classList.remove("is-holding");
  }

  sprout.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) => sprout.addEventListener(t, stop));
  sprout.addEventListener("contextmenu", (e) => e.preventDefault());
})();
