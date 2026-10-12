// scene-card：首頁的場景卡片。整張卡是一個連結，包含縮圖、標題、說明與進度。

import { el } from "../lib/dom.js";
import { createHeading } from "./heading.js";
import { createPixelFrame } from "./pixel-frame.js";
import { createProgressBadge } from "./progress-badge.js";

/**
 * createSceneCard({ title: "Office", description: "...", href: "#/scene/office", thumbnail: svgElement, found: 4, total: 14 })
 * thumbnail 可省略，會顯示棋盤格佔位圖。
 */
export function createSceneCard({ title, description = "", href = "#", thumbnail, found = 0, total = 0, headingLevel = 2, className = "" } = {}) {
  const thumb = el("div", { className: thumbnail ? "scene-card__thumb" : "scene-card__thumb scene-card__thumb--placeholder" }, [thumbnail || null]);

  const frame = createPixelFrame({
    variant: "muted",
    padding: "none",
    className: "scene-card__frame",
    children: [
      thumb,
      el("div", { className: "scene-card__body" }, [
        createHeading({ text: title, level: headingLevel, size: "md" }),
        description ? el("p", { className: "scene-card__description", text: description }) : null,
        createProgressBadge({ found, total }),
      ]),
    ],
  });

  return el("a", { className: ["scene-card", className].filter(Boolean).join(" "), attrs: { href } }, [frame]);
}
