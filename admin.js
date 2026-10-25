(() => {
  const { esc, iconHTML } = Store;
  const $ = (id) => document.getElementById(id);
  const EMOJIS = ["🌱", "🌿", "🍀", "🌼", "🌷", "🌻", "🌸", "🌳", "☀️", "🌈", "☁️", "🫧",
                  "💛", "💌", "💬", "📮", "📖", "✏️", "🎨", "🎵", "🔍", "🧩", "🎲", "🪞",
                  "🤝", "🙌", "😊", "🥰", "🐣", "🐻", "🦋", "⭐"];

  let data = Store.load();

  /* ---------- 들어오기 ---------- */
  function enter() {
    $("admin").hidden = false;
    $("bar").hidden = false;
    render();
  }
  $("logout").addEventListener("click", () => {
    try { sessionStorage.removeItem("sel-admin-ok"); } catch {}
    location.href = "index.html";
  });

  /* ---------- 저장 ---------- */
  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    $("status").textContent = "저장 중…";
    $("status").classList.remove("warn");
    saveTimer = setTimeout(() => {
      const ok = Store.save(data);
      $("status").textContent = ok ? "이 기기에 저장됨 ✓" : "저장 실패 — 사진 용량이 너무 커요";
      $("status").classList.toggle("warn", !ok);
    }, 300);
  }

  /* ---------- 목록 그리기 ---------- */
  const rowsEl = $("rows");

  function render() {
    const n = data.apps.length;
    rowsEl.innerHTML = data.apps
      .map((a, i) => `
        <li class="row" data-i="${i}">
          <div class="order">
            <span class="handle" title="끌어서 순서 바꾸기">⠿</span>
            <button data-act="up" ${i === 0 ? "disabled" : ""} aria-label="위로">▲</button>
            <span class="num">${i + 1}</span>
            <button data-act="down" ${i === n - 1 ? "disabled" : ""} aria-label="아래로">▼</button>
          </div>
          <button class="icon-btn" data-act="icon" aria-label="아이콘 바꾸기">${iconHTML(a.icon)}</button>
          <div class="fields">
            <label>이름<input class="name" data-k="name" value="${esc(a.name)}" /></label>
            <label>설명<textarea data-k="desc" rows="2">${esc(a.desc)}</textarea></label>
            <label>주소<input data-k="url" value="${esc(a.url)}" placeholder="apps/파일이름.html 또는 https://…" /></label>
          </div>
          <button class="del" data-act="del" title="삭제">🗑️</button>
        </li>`)
      .join("");
  }

  rowsEl.addEventListener("input", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    data.apps[+e.target.closest(".row").dataset.i][k] = e.target.value;
    save();
  });

  rowsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const i = +btn.closest(".row").dataset.i;
    const act = btn.dataset.act;
    if (act === "up") move(i, i - 1);
    else if (act === "down") move(i, i + 1);
    else if (act === "del") {
      if (confirm(`'${data.apps[i].name}' 카드를 지울까요?`)) {
        data.apps.splice(i, 1);
        render(); save();
      }
    } else if (act === "icon") pickIcon(i);
  });

  function move(from, to) {
    if (to < 0 || to >= data.apps.length || from === to) return;
    const [item] = data.apps.splice(from, 1);
    data.apps.splice(to, 0, item);
    render(); save();
  }

  $("add").addEventListener("click", () => {
    data.apps.push({ id: "app" + Date.now(), name: "새 웹앱", icon: "🌱", desc: "", url: "" });
    render(); save();
    rowsEl.lastElementChild.querySelector(".name").select();
  });

  /* ---------- 끌어서 순서 바꾸기 (마우스·터치 공통) ---------- */
  let drag = null;

  const clearMarks = () =>
    rowsEl.querySelectorAll(".row").forEach((r) => r.classList.remove("dragging", "drop-before", "drop-after"));

  rowsEl.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".handle");
    if (!handle) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const row = handle.closest(".row");
    row.classList.add("dragging");
    drag = { from: +row.dataset.i, to: null };
  });

  rowsEl.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const rows = [...rowsEl.querySelectorAll(".row")];
    let to = rows.length;
    for (const r of rows) {
      const box = r.getBoundingClientRect();
      if (e.clientY < box.top + box.height / 2) { to = +r.dataset.i; break; }
    }
    drag.to = to;
    rows.forEach((r) => r.classList.remove("drop-before", "drop-after"));
    if (to < rows.length) rows[to].classList.add("drop-before");
    else rows[rows.length - 1].classList.add("drop-after");
  });

  function endDrag() {
    if (!drag) return;
    const { from, to } = drag;
    drag = null;
    clearMarks();
    if (to !== null) move(from, to > from ? to - 1 : to);
  }
  rowsEl.addEventListener("pointerup", endDrag);
  rowsEl.addEventListener("pointercancel", () => { drag = null; clearMarks(); });

  /* ---------- 아이콘 고르기 ---------- */
  function pickIcon(i) {
    const wrap = document.createElement("div");
    wrap.className = "pin-backdrop";
    wrap.innerHTML = `
      <div class="pin-box icon-box">
        <h2>아이콘 바꾸기</h2>
        <p class="sub">이모지 고르기</p>
        <div class="emoji-grid">${EMOJIS.map((e) => `<button data-e="${e}">${e}</button>`).join("")}</div>
        <p class="sub">직접 입력 (윈도우 <b>Win + .</b> / 맥 <b>Ctrl + Cmd + Space</b>)</p>
        <div class="emoji-own">
          <input maxlength="8" placeholder="🙂" />
          <button class="btn-ghost" data-own>적용</button>
        </div>
        <p class="sub">또는 사진 올리기</p>
        <label class="upload">🖼️ 사진 파일 고르기<input type="file" accept="image/*" /></label>
        <div class="pin-actions" style="margin-top:16px"><button class="btn-ghost" data-close>닫기</button></div>
      </div>`;
    document.body.appendChild(wrap);

    const close = () => wrap.remove();
    const apply = (icon) => { data.apps[i].icon = icon; render(); save(); close(); };

    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest("[data-close]")) close();
      const em = e.target.closest("[data-e]");
      if (em) apply(em.dataset.e);
      if (e.target.closest("[data-own]")) {
        const v = wrap.querySelector(".emoji-own input").value.trim();
        if (v) apply(v);
      }
    });
    wrap.querySelector("input[type=file]").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (f) apply(await shrink(f));
    });
  }

  /* 사진은 192px 정사각형으로 줄여서 저장 (파일이 너무 커지지 않게) */
  function shrink(file, size = 192) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const s = Math.min(img.width, img.height);
        c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- 암호 ---------- */
  $("savePin").addEventListener("click", () => {
    const v = $("newPin").value.trim();
    if (!/^\d{4}$/.test(v)) {
      $("pinMsg").textContent = "숫자 4자리로 입력해 주세요.";
      return;
    }
    data.pin = v;
    $("newPin").value = "";
    $("pinMsg").textContent = "바뀌었어요. 다른 기기에도 쓰려면 배포 파일에 함께 담겨요.";
    save();
  });

  /* ---------- 하단 버튼 ---------- */
  $("export").addEventListener("click", () => Store.exportFile(data));
  $("reset").addEventListener("click", () => {
    if (confirm("이 기기에서 고친 내용을 모두 버리고 저장소의 apps.js 상태로 돌아갈까요?")) {
      data = Store.reset();
      render();
      $("status").textContent = "처음 상태로 돌아갔어요";
    }
  });

  if (PinGate.isOpen()) enter();
  else PinGate.open({ onSuccess: enter, closable: false });
})();
