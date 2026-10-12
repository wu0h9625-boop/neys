// button：遊戲中所有按鈕。Reveal、Hint、Check、Scene talk、Reset、關閉、發音都用它。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";

const VARIANTS = ["primary", "secondary", "ghost", "ink"];
const SIZES = ["sm", "md", "lg"];

/**
 * createButton({ label: "Reveal", variant: "secondary", icon: "bulb", onClick })
 * iconOnly: true 時只顯示圖示，label 會變成 aria-label 給螢幕閱讀器讀。
 * size：md 是 44px；sm 是 32px（icon-only 時 40px）；lg 只用在 icon-only（52px）。
 */
export function createButton({
  label,
  variant = "primary",
  icon,
  iconOnly = false,
  size = "md",
  block = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  attrs = {},
} = {}) {
  if (!label) throw new Error("createButton needs a label (also used as aria-label for icon-only buttons).");

  const v = VARIANTS.includes(variant) ? variant : "primary";
  const s = SIZES.includes(size) ? size : "md";
  const classes = [
    "button",
    `button--${v}`,
    "pixel-border",
    s === "md" ? "" : `button--${s}`,
    iconOnly ? "button--icon-only" : "",
    block ? "button--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const children = [
    icon ? createIcon(icon) : null,
    el("span", { className: iconOnly ? "visually-hidden" : "button__label", text: label }),
  ];

  return el(
    "button",
    {
      className: classes,
      attrs: { type, disabled, title: iconOnly ? label : undefined, ...attrs },
      on: onClick ? { click: onClick } : undefined,
    },
    children,
  );
}

export function setButtonLabel(button, label) {
  const target = button.querySelector(".button__label, .visually-hidden");
  if (target) target.textContent = label;
  if (button.classList.contains("button--icon-only")) button.title = label;
}

export function setButtonIcon(button, icon) {
  const current = button.querySelector(".icon");
  const next = createIcon(icon);
  if (current) current.replaceWith(next);
  else button.prepend(next);
}
