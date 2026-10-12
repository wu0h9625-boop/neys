// pixel-frame：2px 平面框線容器（名稱沿用早期的像素框）。面板、卡片、對話框的框線都用它。
// 同一支 CSS 也提供 .pixel-border，給按鈕、輸入框這類只需要框線的元件用。

import { el } from "../lib/dom.js";

const VARIANTS = ["default", "muted", "accent", "raised"];
const PADDINGS = ["none", "sm", "md", "lg"];

export function createPixelFrame({ children = [], variant = "default", padding = "md", tag = "div", className = "", attrs } = {}) {
  const v = VARIANTS.includes(variant) ? variant : "default";
  const p = PADDINGS.includes(padding) ? padding : "md";
  const classes = ["pixel-border", "pixel-frame", `pixel-frame--${v}`, `pixel-frame--pad-${p}`, className].filter(Boolean).join(" ");
  return el(tag, { className: classes, attrs }, children);
}
