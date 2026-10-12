// 首頁：場景卡片列表與進度。

import { el } from "../lib/dom.js";
import { countFound, isPersistent } from "../lib/progress.js";
import { loadScene, loadSceneIds, parseSvg } from "../lib/scenes.js";
import { createHeading } from "../components/heading.js";
import { createSceneCard } from "../components/scene-card.js";
import { createText } from "../components/text.js";

export async function renderHome(root) {
  document.title = "Name It";

  const ids = await loadSceneIds();
  const scenes = await Promise.all(ids.map((id) => loadScene(id).then((scene) => ({ id, ...scene }))));

  const cards = scenes.map(({ id, data, svgText }) => {
    const objectIds = data.objects.map((object) => object.id);
    const thumbnail = parseSvg(svgText);
    thumbnail.setAttribute("aria-hidden", "true");
    return el("li", {}, [
      createSceneCard({
        title: data.title,
        description: data.description,
        href: `#/scene/${encodeURIComponent(id)}`,
        thumbnail,
        found: countFound(id, objectIds),
        total: objectIds.length,
      }),
    ]);
  });

  root.replaceChildren(
    el("section", { className: "home" }, [
      el("header", { className: "home__intro" }, [
        createHeading({ text: "Name It", level: 1, size: "xl" }),
        createText({ text: "Look around. Name everything you see in English, out loud, then learn how to talk about it.", size: "lg", tone: "muted" }),
      ]),
      el("ul", { className: "home__grid", attrs: { "aria-label": "Scenes" } }, cards),
      isPersistent()
        ? null
        : createText({ text: "This browser can't save your progress (private mode?). It will reset when you reload.", size: "sm", tone: "muted" }),
    ]),
  );
}
