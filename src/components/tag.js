// tag：小標籤。替代答案（Also OK）、場景步驟、例句類型、對話說話者都用它。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";

const KINDS = ["chip", "pixel", "label"];
const TONES = ["default", "ink", "ink-accent", "accent", "teal", "orange", "success", "danger"];

/**
 * createTag({ text: "water cooler", kind: "chip", tone: "ink-accent" })
 * kind：chip（一般字體）、pixel（Silkscreen 小方塊）、label（Silkscreen 文字，沒有底色）
 */
export function createTag({ text, kind = "chip", tone = "default", icon, className = "", attrs } = {}) {
  const k = KINDS.includes(kind) ? kind : "chip";
  const t = TONES.includes(tone) ? tone : "default";
  const classes = ["tag", k === "chip" ? "" : `tag--${k}`, `tag--${t}`, className].filter(Boolean).join(" ");
  return el("span", { className: classes, attrs }, [
    icon ? createIcon(icon) : null,
    el("span", { className: "tag__text", text }),
  ]);
}

export function setTagTone(tag, tone) {
  for (const t of TONES) tag.classList.toggle(`tag--${t}`, t === tone);
}

export function setTagText(tag, text) {
  tag.querySelector(".tag__text").textContent = text;
}
