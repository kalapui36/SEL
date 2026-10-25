/* 관리자 암호 팝업 */
const PinGate = (() => {
  const SESSION = "sel-admin-ok";

  const isOpen = () => {
    try { return sessionStorage.getItem(SESSION) === "1"; } catch { return false; }
  };

  function open({ onSuccess, onCancel, closable = true } = {}) {
    const pin = String(Store.load().pin || "4021");
    const wrap = document.createElement("div");
    wrap.className = "pin-backdrop";
    wrap.innerHTML = `
      <form class="pin-box" autocomplete="off">
        <div class="pin-emoji">🔒</div>
        <h2>관리자 확인</h2>
        <p>암호 4자리를 입력해 주세요.</p>
        <input class="pin-input" type="password" inputmode="numeric" maxlength="4" aria-label="암호" />
        <p class="pin-msg" aria-live="polite"></p>
        <div class="pin-actions">
          ${closable ? `<button type="button" class="btn-ghost" data-cancel>취소</button>` : ""}
          <button type="submit" class="btn-main">확인</button>
        </div>
      </form>`;
    document.body.appendChild(wrap);

    const form = wrap.querySelector("form");
    const input = wrap.querySelector("input");
    const msg = wrap.querySelector(".pin-msg");
    setTimeout(() => input.focus(), 50);

    const close = () => wrap.remove();
    const cancel = () => { close(); onCancel && onCancel(); };

    function check() {
      if (input.value === pin) {
        try { sessionStorage.setItem(SESSION, "1"); } catch {}
        close();
        onSuccess && onSuccess();
      } else {
        msg.textContent = "암호가 달라요. 다시 입력해 주세요.";
        form.classList.remove("shake");
        void form.offsetWidth;
        form.classList.add("shake");
        input.value = "";
        input.focus();
      }
    }

    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      if (input.value.length === 4) check();
    });
    form.addEventListener("submit", (e) => { e.preventDefault(); check(); });
    if (closable) {
      wrap.querySelector("[data-cancel]").addEventListener("click", cancel);
      wrap.addEventListener("click", (e) => { if (e.target === wrap) cancel(); });
      wrap.addEventListener("keydown", (e) => { if (e.key === "Escape") cancel(); });
    }
  }

  return { open, isOpen };
})();
