// 遊戲入口：用網址的 hash 切換頁面。GitHub Pages 是靜態主機，hash 路由不需要伺服器設定。
//   #/              首頁（場景列表）
//   #/scene/<id>    場景頁

import { stopSpeaking } from "./lib/speech.js";
import { renderError } from "./views/error.js";
import { renderHome } from "./views/home.js";
import { renderScene } from "./views/scene.js";

const root = document.getElementById("app");
let cleanup = null;
let navigation = 0;

function parseRoute() {
  const [page, id] = location.hash.replace(/^#\/?/, "").split("/");
  if (page === "scene" && id) return { view: "scene", id: decodeURIComponent(id) };
  return { view: "home" };
}

async function route() {
  const current = ++navigation;
  cleanup?.();
  cleanup = null;
  stopSpeaking();

  const { view, id } = parseRoute();
  root.dataset.view = view;
  root.setAttribute("aria-busy", "true");

  try {
    const dispose = view === "scene" ? await renderScene(root, id) : await renderHome(root);
    // 載入期間使用者又切換頁面：丟掉這次的結果
    if (current !== navigation) {
      dispose?.();
      return;
    }
    cleanup = dispose ?? null;
  } catch (error) {
    console.error(error);
    if (current === navigation) renderError(root, error);
  } finally {
    if (current === navigation) {
      root.removeAttribute("aria-busy");
      window.scrollTo(0, 0);
    }
  }
}

window.addEventListener("hashchange", route);
route();
