/* 관리자 페이지 → GitHub 저장소의 apps.js를 직접 읽고 고치기
   토큰은 이 기기 브라우저에만 저장되고, 저장소 파일에는 절대 들어가지 않습니다. */
const GitHub = (() => {
  const KEY = "sel-github";
  const DEFAULTS = { owner: "kalapui36", repo: "SEL", branch: "main", path: "apps.js", token: "" };

  function config() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch {
      return { ...DEFAULTS };
    }
  }
  function setConfig(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ ...config(), ...c })); } catch {}
  }
  const hasToken = () => !!config().token;

  /* UTF-8 ↔ base64 (한글·이모지가 깨지지 않게) */
  const toB64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const fromB64 = (b64) =>
    new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

  async function api(method, body) {
    const c = config();
    const url = `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${c.path
      .split("/").map(encodeURIComponent).join("/")}` + (method === "GET" ? `?ref=${encodeURIComponent(c.branch)}&t=${Date.now()}` : "");
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${c.token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });
    } catch {
      throw new Error("인터넷 연결을 확인해 주세요.");
    }
    if (res.ok) return res.json();
    const msg = {
      401: "토큰이 틀렸거나 기간이 끝났어요. 새 토큰을 넣어 주세요.",
      403: "토큰에 이 저장소 파일 수정 권한(Contents: Read and write)이 없어요.",
      404: "저장소나 브랜치를 찾을 수 없어요. 토큰이 SEL 저장소를 선택했는지, 저장소 이름·브랜치가 맞는지 확인해 주세요.",
      409: "그 사이 다른 곳에서 파일이 바뀌었어요. 다시 저장을 눌러 주세요.",
      422: "저장 형식이 맞지 않아요. 잠시 후 다시 시도해 주세요.",
    }[res.status];
    throw new Error(msg || `GitHub 오류 (${res.status})`);
  }

  /* 저장소에 있는 최신 apps.js 읽기 → { data, sha } */
  async function load() {
    const json = await api("GET");
    return { data: Store.parseFile(fromB64(json.content)), sha: json.sha };
  }

  /* data를 apps.js로 만들어 저장소에 올리기 (커밋 1개) */
  async function save(data) {
    let sha;
    try {
      sha = (await api("GET")).sha;
    } catch (e) {
      if (!/찾을 수 없어요/.test(e.message)) throw e;   // 파일이 아직 없으면 새로 만듦
    }
    const built = Store.buildFile(data);
    await api("PUT", {
      message: "관리자 페이지에서 앱 목록 수정",
      content: toB64(built.text),
      branch: config().branch,
      ...(sha ? { sha } : {}),
    });
    return built.data;
  }

  return { config, setConfig, hasToken, load, save };
})();
