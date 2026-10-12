// text：一般段落文字。頁面上的說明、副標、灰色補充文字都用它，頁面 CSS 不另外設定字色與字級。

import { el } from "../lib/dom.js";

const TONES = ["default", "muted", "accent"];
const SIZES = ["sm", "md", "lg"];

export function createText({ text, tone = "default", size = "md", tag = "p", className = "", children } = {}) {
  const t = TONES.includes(tone) ? tone : "default";
  const s = SIZES.includes(size) ? size : "md";
  const classes = ["text", `text--${s}`, t === "default" ? "" : `text--${t}`, className].filter(Boolean).join(" ");
  return el(tag, { className: classes, text: children ? undefined : text }, children ?? []);
}
