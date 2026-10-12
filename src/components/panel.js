// panel：場景頁的作答面板，同一份元件依寬度變成三種形態（版面全在 CSS）：
//   < 768px      bottom sheet，從下方升起，最高 70% 螢幕
//   768–1023px   從右側滑出
//   ≥ 1024px     固定在場景右側，一直顯示，沒有關閉鈕
// 面板不是 modal：開著的時候還是可以點場景裡的其他物件。

import { append, el } from "../lib/dom.js";
import { createButton } from "./button.js";
import { createHeading } from "./heading.js";
import { createPixelFrame } from "./pixel-frame.js";

let idCounter = 0;
const closeHandlers = new WeakMap();

/**
 * createPanel({ title: "Object 3 of 14", children: [...], onClose })
 */
export function createPanel({ title = "", children = [], open = false, onClose, className = "" } = {}) {
  idCounter += 1;
  const headingId = `panel-title-${idCounter}`;

  const close = createButton({
    label: "Close panel",
    variant: "ghost",
    icon: "close",
    iconOnly: true,
    className: "panel__close",
  });

  const frame = createPixelFrame({
    padding: "none",
    className: "panel__frame",
    attrs: { tabindex: "-1" },
    children: [
      el("div", { className: "panel__handle", attrs: { "aria-hidden": "true" } }),
      el("header", { className: "panel__header" }, [createHeading({ text: title, level: 2, size: "md", attrs: { id: headingId } }), close]),
      el("div", { className: "panel__body" }, children),
    ],
  });

  const panel = el(
    "aside",
    {
      className: ["panel", className].filter(Boolean).join(" "),
      attrs: { "aria-labelledby": headingId },
      dataset: { open: String(open) },
    },
    [frame],
  );

  if (onClose) closeHandlers.set(panel, onClose);
  close.addEventListener("click", () => closePanel(panel));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isPanelOpen(panel)) {
      event.stopPropagation();
      closePanel(panel);
    }
  });

  return panel;
}

export function openPanel(panel, { focus = true } = {}) {
  panel.dataset.open = "true";
  if (focus) panel.querySelector(".panel__frame").focus({ preventScroll: true });
}

export function closePanel(panel) {
  if (!isPanelOpen(panel)) return;
  panel.dataset.open = "false";
  closeHandlers.get(panel)?.();
}

export function isPanelOpen(panel) {
  return panel.dataset.open === "true";
}

/** 換面板內容（例如點了另一個物件）。只給 title 或只給 children 也可以。 */
export function setPanelContent(panel, { title, children } = {}) {
  if (title !== undefined) panel.querySelector(".panel__header .heading").textContent = title;
  if (children !== undefined) {
    const body = panel.querySelector(".panel__body");
    body.replaceChildren();
    // 跟 el() 一樣略過 null / false，方便用條件式組內容（replaceChildren 會把 null 變成文字 "null"）
    append(body, children);
    body.scrollTop = 0;
  }
}
