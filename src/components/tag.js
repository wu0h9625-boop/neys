// tag：小標籤。對話的說話者、例句類型、進度計數都用它。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";

const TONES = ["default", "accent", "info", "success", "danger"];

export function createTag({ text, tone = "default", icon, className = "", attrs } = {}) {
  const t = TONES.includes(tone) ? tone : "default";
  const classes = ["tag", `tag--${t}`, className].filter(Boolean).join(" ");
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
