// heading：像素字體標題。所有元件與頁面的標題都用它。
// level 決定語意層級（h1–h4），size 決定外觀大小，兩者分開設定。

import { el } from "../lib/dom.js";

const SIZES = ["sm", "md", "lg", "xl"];
const TONES = ["default", "accent", "muted"];

export function createHeading({ text, level = 2, size = "md", tone = "default", className = "", attrs } = {}) {
  const tag = `h${Math.min(Math.max(level, 1), 4)}`;
  const s = SIZES.includes(size) ? size : "md";
  const t = TONES.includes(tone) ? tone : "default";
  const classes = ["heading", `heading--${s}`, t === "default" ? "" : `heading--${t}`, className].filter(Boolean).join(" ");
  return el(tag, { className: classes, text, attrs });
}
