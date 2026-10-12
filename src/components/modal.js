// modal：蓋住整個畫面的對話框，用在 Scene talk 與 Scene complete。
// 用原生 <dialog>：showModal() 自帶焦點鎖定、Esc 關閉、背景不能操作。

import { el } from "../lib/dom.js";
import { createButton } from "./button.js";
import { createHeading } from "./heading.js";
import { createPixelFrame } from "./pixel-frame.js";

const SIZES = ["sm", "md", "lg"];
let idCounter = 0;

/**
 * createModal({ title: "Scene talk", children: [...], actions: [button], onClose })
 * dismissible：false 時不能用 Esc、點背景或關閉鈕關掉，只能按 actions 裡的按鈕。
 */
export function createModal({ title, children = [], actions = [], size = "md", dismissible = true, onClose, className = "" } = {}) {
  idCounter += 1;
  const headingId = `modal-title-${idCounter}`;
  const s = SIZES.includes(size) ? size : "md";

  const close = dismissible
    ? createButton({ label: "Close", variant: "ghost", icon: "close", iconOnly: true, className: "modal__close" })
    : null;

  const frame = createPixelFrame({
    variant: "accent",
    padding: "none",
    className: "modal__frame",
    children: [
      el("header", { className: "modal__header" }, [createHeading({ text: title, level: 2, size: "lg", attrs: { id: headingId } }), close]),
      el("div", { className: "modal__body" }, children),
      actions.length > 0 ? el("footer", { className: "modal__actions" }, actions) : null,
    ],
  });

  const dialog = el("dialog", { className: ["modal", `modal--${s}`, className].filter(Boolean).join(" "), attrs: { "aria-labelledby": headingId } }, [frame]);

  close?.addEventListener("click", () => closeModal(dialog));

  // 點背景（dialog 本身，不是裡面的框）關閉
  dialog.addEventListener("click", (event) => {
    if (dismissible && event.target === dialog) closeModal(dialog);
  });

  // Esc 觸發 cancel；不可關閉時擋掉
  dialog.addEventListener("cancel", (event) => {
    if (!dismissible) event.preventDefault();
  });

  if (onClose) dialog.addEventListener("close", onClose);
  return dialog;
}

export function openModal(dialog) {
  if (!dialog.isConnected) document.body.append(dialog);
  if (!dialog.open) dialog.showModal();
}

export function closeModal(dialog) {
  if (dialog.open) dialog.close();
}
