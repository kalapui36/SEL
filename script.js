(() => {
  const heartsEl = document.getElementById("hearts");
  const gridEl = document.getElementById("grid");
  const labelEl = document.getElementById("filter-label");
  const defaultLabel = labelEl.textContent;
  let active = null;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderHearts() {
    heartsEl.innerHTML = Object.entries(HEARTS)
      .map(([key, h]) => {
        const count = APPS.filter((a) => a.heart.includes(key)).length;
        return `
          <button class="heart ${active === key ? "is-active" : ""}" data-key="${key}" style="--c:${h.color}">
            <span class="heart-emoji">${h.emoji}</span>
            <span class="heart-label">${esc(h.label)}</span>
            <span class="heart-full">${esc(h.full)} · ${count}개</span>
          </button>`;
      })
      .join("");
  }

  function renderGrid() {
    const list = active ? APPS.filter((a) => a.heart.includes(active)) : APPS;
    labelEl.textContent = active
      ? `${HEARTS[active].emoji} '${HEARTS[active].label}' 마음을 키우는 앱이에요. 꽃을 한 번 더 누르면 전체가 보여요.`
      : defaultLabel;

    gridEl.innerHTML = list
      .map((a, i) => {
        const main = HEARTS[a.heart[0]];
        const tags = a.heart
          .map((k) => `<span class="tag" style="--c:${HEARTS[k].color}">${HEARTS[k].emoji} ${esc(HEARTS[k].label)}</span>`)
          .join("");
        return `
          <a class="card" href="${esc(a.url)}" target="_blank" rel="noopener" style="--c:${main.color}; --d:${i * 60}ms">
            <span class="card-emoji">${esc(a.emoji)}</span>
            <h3 class="card-name">${esc(a.name)}</h3>
            <p class="card-desc">${esc(a.desc)}</p>
            <div class="card-tags">${tags}</div>
            <dl class="card-meta">
              ${a.grade ? `<div><dt>대상</dt><dd>${esc(a.grade)}</dd></div>` : ""}
              ${a.scene ? `<div><dt>장면</dt><dd>${esc(a.scene)}</dd></div>` : ""}
              ${a.maker ? `<div><dt>제작</dt><dd>${esc(a.maker)}</dd></div>` : ""}
            </dl>
            <span class="card-open">열어 보기 →</span>
          </a>`;
      })
      .join("");
  }

  heartsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".heart");
    if (!btn) return;
    active = active === btn.dataset.key ? null : btn.dataset.key;
    renderHearts();
    renderGrid();
    document.getElementById("apps").scrollIntoView({ behavior: "smooth" });
  });

  renderHearts();
  renderGrid();
})();
