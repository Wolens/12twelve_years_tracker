(function () {
  var KEY = "twelve-chunk-reload";
  var BANNER_ID = "twelve-chunk-stuck";

  function showStuckBanner() {
    if (document.getElementById(BANNER_ID)) return;
    var el = document.createElement("div");
    el.id = BANNER_ID;
    el.setAttribute("role", "alert");
    el.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:#0a0a0f;color:#a1a1aa;font:14px/1.5 system-ui,sans-serif;";
    el.innerHTML =
      "<p style='max-width:20rem;margin:0;color:#e4e4e7'>Сборка dev-сервера обновилась, а страница загрузила старые файлы.</p>" +
      "<p style='max-width:20rem;margin:0;font-size:13px'>Нажмите <strong style='color:#34d399'>Ctrl+Shift+R</strong> (жёсткое обновление).</p>" +
      "<p style='max-width:20rem;margin:0;font-size:12px;opacity:.85'>Если не помогло: остановите dev и запустите <code style='color:#c4b5fd'>npm run dev:clean</code></p>" +
      "<button type='button' style='margin-top:8px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:#fafafa;padding:10px 16px;cursor:pointer'>Обновить страницу</button>";
    el.querySelector("button").onclick = function () {
      sessionStorage.removeItem(KEY);
      location.reload();
    };
    document.body.appendChild(el);
  }

  window.addEventListener(
    "error",
    function (e) {
      var t = e.target;
      if (!t || t.tagName !== "SCRIPT") return;
      var src = t.src || "";
      if (src.indexOf("/_next/") === -1) return;

      if (sessionStorage.getItem(KEY)) {
        showStuckBanner();
        return;
      }
      sessionStorage.setItem(KEY, "1");
      location.reload();
    },
    true
  );

  window.addEventListener("load", function () {
    sessionStorage.removeItem(KEY);
    var banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
  });
})();
