(() => {
  const { esc, iconHTML } = Store;
  const $ = (id) => document.getElementById(id);
  const EMOJIS = ["🌱", "🌿", "🍀", "🌼", "🌷", "🌻", "🌸", "🌳", "☀️", "🌈", "☁️", "🫧",
                  "💛", "💌", "💬", "📮", "📖", "✏️", "🎨", "🎵", "🔍", "🧩", "🎲", "🪞",
                  "🤝", "🙌", "😊", "🥰", "🐣", "🐻", "🦋", "⭐"];

  let data = Store.load();

  /* 사이트(GitHub)에 저장된 상태와 비교해서 '저장 전' 여부를 표시 */
  const sig = (d) => JSON.stringify({ pin: d.pin, apps: d.apps });
  const fileSig = sig(window.SITE_DATA);
  const SYNC_KEY = "sel-garden-synced";
  const lastSynced = () => { try { return localStorage.getItem(SYNC_KEY) || fileSig; } catch { return fileSig; } };
  let synced = lastSynced();
  const dirty = () => sig(data) !== synced;
  function markSynced(d) {
    synced = sig(d);
    try { localStorage.setItem(SYNC_KEY, synced); } catch {}
  }

  /* ---------- 들어오기 ---------- */
  async function enter() {
    $("admin").hidden = false;
    $("bar").hidden = false;
    render();
    refreshGitHub();
    if (GitHub.hasToken()) await pullLatest();
    updateStatus();
  }

  /* 다른 기기에서 저장한 최신본이 있으면 가져오기 */
  async function pullLatest() {
    try {
      $("status").textContent = "사이트 최신 내용 확인 중…";
      const remote = (await GitHub.load()).data;
      const editedHere = sig(data) !== lastSynced();
      markSynced(remote);
      if (sig(remote) !== sig(data) &&
          (!editedHere || confirm("사이트에 더 최신 내용이 있어요. 불러올까요?\n(취소하면 이 기기에서 고친 내용을 그대로 둡니다)"))) {
        data = remote;
        Store.save(data);
        render();
      }
    } catch (e) {
      $("ghMsg").textContent = "⚠️ " + e.message;
    }
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
      if (Store.save(data)) updateStatus();
      else {
        $("status").textContent = "저장 실패 — 사진 용량이 너무 커요";
        $("status").classList.add("warn");
      }
    }, 300);
  }

  function updateStatus(text) {
    const d = dirty();
    $("status").textContent = text || (d
      ? (GitHub.hasToken() ? "✏️ 고친 내용이 있어요 — '사이트에 저장'을 눌러 주세요" : "✏️ 이 기기에만 저장됨")
      : "사이트와 같아요 ✓");
    $("status").classList.toggle("warn", d && !text);
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
    $("pinMsg").textContent = "바뀌었어요. '사이트에 저장'을 눌러야 모든 기기에 적용돼요.";
    save();
  });

  /* ---------- GitHub 연결 ---------- */
  function refreshGitHub() {
    const c = GitHub.config();
    const on = GitHub.hasToken();
    $("ghState").textContent = on ? `✅ 연결됨 · ${c.owner}/${c.repo} (${c.branch})` : "⚪ 아직 연결 안 됨";
    $("ghState").classList.toggle("ok", on);
    $("ghToken").value = "";
    $("ghToken").placeholder = on ? "토큰 저장됨 (바꾸려면 새 토큰 입력)" : "github_pat_로 시작하는 긴 글자";
    $("ghOwner").value = c.owner;
    $("ghRepo").value = c.repo;
    $("ghBranch").value = c.branch;
    $("ghForget").hidden = !on;
    $("notice").innerHTML = on
      ? "<strong>🌐 GitHub에 연결되어 있어요.</strong>고친 뒤 맨 아래 <b>사이트에 저장</b>을 누르면 1~2분 뒤 모든 기기의 대문에 반영돼요. 누르기 전까지는 이 기기에만 저장돼요."
      : "<strong>💾 지금은 이 기기에만 저장돼요.</strong>맨 아래 <b>GitHub 연결</b>을 한 번 해 두면, <b>사이트에 저장</b> 버튼으로 모든 기기에 바로 반영할 수 있어요.";
  }

  $("ghConnect").addEventListener("click", async () => {
    const prev = GitHub.config();
    const token = $("ghToken").value.trim() || prev.token;
    if (!token) { $("ghMsg").textContent = "토큰을 붙여 넣어 주세요."; return; }
    GitHub.setConfig({
      token,
      owner: $("ghOwner").value.trim() || prev.owner,
      repo: $("ghRepo").value.trim() || prev.repo,
      branch: $("ghBranch").value.trim() || prev.branch,
    });
    $("ghMsg").textContent = "연결 확인 중…";
    try {
      await GitHub.load();
      $("ghMsg").textContent = "연결됐어요 ✓ 이제 '사이트에 저장'을 쓸 수 있어요.";
      refreshGitHub();
      await pullLatest();
      updateStatus();
    } catch (e) {
      GitHub.setConfig(prev);
      $("ghMsg").textContent = "⚠️ " + e.message;
    }
  });

  $("ghForget").addEventListener("click", () => {
    if (!confirm("이 기기에 저장된 토큰을 지울까요?")) return;
    GitHub.setConfig({ token: "" });
    $("ghMsg").textContent = "토큰을 지웠어요.";
    refreshGitHub();
    updateStatus();
  });

  /* ---------- 하단 버튼 ---------- */
  $("publish").addEventListener("click", async () => {
    if (!GitHub.hasToken()) {
      alert("먼저 아래 'GitHub 연결'에서 토큰을 넣어 주세요.");
      $("ghToken").scrollIntoView({ behavior: "smooth", block: "center" });
      $("ghToken").focus();
      return;
    }
    const btn = $("publish");
    btn.disabled = true;
    updateStatus("사이트에 저장 중…");
    try {
      data = await GitHub.save(data);
      Store.save(data);
      markSynced(data);
      updateStatus("🌐 사이트에 저장됐어요 ✓ 1~2분 뒤 모든 기기에 보여요");
    } catch (e) {
      updateStatus();
      alert("저장하지 못했어요.\n" + e.message);
    } finally {
      btn.disabled = false;
    }
  });

  $("export").addEventListener("click", () => Store.exportFile(data));

  $("reset").addEventListener("click", async () => {
    if (!confirm("이 기기에서 고친 내용을 버리고 사이트에 저장된 상태로 되돌릴까요?")) return;
    data = Store.reset();
    markSynced(data);
    if (GitHub.hasToken()) {
      try {
        const remote = (await GitHub.load()).data;
        data = remote;
        markSynced(remote);
        if (sig(remote) !== fileSig) Store.save(data);
      } catch (e) {
        $("ghMsg").textContent = "⚠️ " + e.message;
      }
    }
    render();
    updateStatus("되돌렸어요");
  });

  window.addEventListener("beforeunload", (e) => {
    if (GitHub.hasToken() && dirty()) e.preventDefault();
  });

  if (PinGate.isOpen()) enter();
  else PinGate.open({ onSuccess: enter, closable: false });
})();
