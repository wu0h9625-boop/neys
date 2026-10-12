// divider：分隔線。vertical 用在頁首「Scenes ｜ Office」之間（2×28px），horizontal 用在區塊之間。

import { el } from "../lib/dom.js";

export function createDivider({ orientation = "vertical", className = "" } = {}) {
  const o = orientation === "horizontal" ? "horizontal" : "vertical";
  return el("span", {
    className: ["divider", `divider--${o}`, className].filter(Boolean).join(" "),
    attrs: { role: "separator", "aria-orientation": o },
  });
}
