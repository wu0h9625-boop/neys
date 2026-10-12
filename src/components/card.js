// card：面板裡的白底卡片，有標題列（左邊標題、右邊可放按鈕）與內容區。
// Say it to yourself、Word picture、Mini dialogue 都用它。

import { el } from "../lib/dom.js";
import { createHeading } from "./heading.js";
import { createPixelFrame } from "./pixel-frame.js";

/**
 * createCard({ title: "Mini dialogue", actions: [playAllButton], children: [list] })
 */
export function createCard({ title, actions = [], children = [], headingLevel = 3, tag = "section", className = "" } = {}) {
  const header = title
    ? el("header", { className: actions.length > 0 ? "card__header card__header--with-actions" : "card__header" }, [
        createHeading({ text: title, level: headingLevel, size: "sm", tone: "accent" }),
        actions.length > 0 ? el("div", { className: "card__actions" }, actions) : null,
      ])
    : null;

  return createPixelFrame({
    tag,
    variant: "raised",
    padding: "none",
    className: ["card", className].filter(Boolean).join(" "),
    children: [header, el("div", { className: "card__body" }, children)],
  });
}
