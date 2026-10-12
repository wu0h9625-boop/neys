// 元件展示清單。每完成一個元件，就在這裡加一筆，components.html 會自動列出。
//
// 格式：
// {
//   name: "button",                       // 與 src/components/<name>.js 同名
//   description: "All buttons in the game.",
//   variants: [
//     { label: "Primary", render: () => createButton({ label: "Reveal", variant: "primary" }) },
//   ],
// }
//
// render() 回傳一個 DOM 元素。依字母排序加入。
// variant 可加 wide: true 佔滿一整列；viewport: true 會放進一個 480px 高的模擬螢幕框，
// 給 panel 這類 position: fixed 的元件用。

import { el } from "../lib/dom.js";
import { createHeading } from "../components/heading.js";
import { createIcon, ICON_NAMES } from "../components/icon.js";
import { createPixelFrame } from "../components/pixel-frame.js";
import { createTag } from "../components/tag.js";

const sampleText = (text = "There's a stapler on my desk.") => el("p", { text });

export const demos = [
  {
    name: "heading",
    description: "Pixel-font titles. level sets the HTML tag (h1–h4); size sets the look.",
    variants: [
      { label: "xl (24px on mobile, 32px from 768px)", wide: true, render: () => createHeading({ text: "Office", level: 1, size: "xl" }) },
      { label: "lg", render: () => createHeading({ text: "Scene complete!", size: "lg" }) },
      { label: "md", render: () => createHeading({ text: "Stapler", size: "md" }) },
      { label: "sm · accent", render: () => createHeading({ text: "Say it to yourself", size: "sm", tone: "accent" }) },
      { label: "sm · muted", render: () => createHeading({ text: "Mini dialogue", size: "sm", tone: "muted" }) },
      { label: "long title wraps", render: () => el("div", { attrs: { style: "max-width: 240px" } }, [createHeading({ text: "Convenience store sign", size: "lg" })]) },
    ],
  },
  {
    name: "icon",
    description: "Pixel icons drawn from character grids. Colour follows the text colour; size is grid × scale.",
    variants: [
      ...ICON_NAMES.map((name) => ({ label: name, render: () => createIcon(name) })),
      { label: "speaker · scale 3", render: () => createIcon("speaker", { scale: 3 }) },
      { label: "star · accent colour", render: () => el("span", { attrs: { style: "color: var(--color-accent)" } }, [createIcon("star", { scale: 3 })]) },
    ],
  },
  {
    name: "pixel-frame",
    description: "Notched pixel border box. Panels, cards and dialogs are built on it. Also provides the .pixel-border class.",
    variants: [
      { label: "default", render: () => createPixelFrame({ children: [sampleText()] }) },
      { label: "muted", render: () => createPixelFrame({ variant: "muted", children: [sampleText()] }) },
      { label: "accent", render: () => createPixelFrame({ variant: "accent", children: [sampleText()] }) },
      { label: "raised", render: () => createPixelFrame({ variant: "raised", children: [sampleText()] }) },
      { label: "padding sm", render: () => createPixelFrame({ padding: "sm", children: [sampleText("Small padding")] }) },
      { label: "padding lg", render: () => createPixelFrame({ padding: "lg", children: [sampleText("Large padding")] }) },
    ],
  },
  {
    name: "tag",
    description: "Small label. Used for dialogue speakers, sentence types and progress counts.",
    variants: [
      { label: "default", render: () => createTag({ text: "Describe" }) },
      { label: "accent", render: () => createTag({ text: "B", tone: "accent" }) },
      { label: "info", render: () => createTag({ text: "A", tone: "info" }) },
      { label: "success", render: () => createTag({ text: "14/14", tone: "success", icon: "star" }) },
      { label: "danger", render: () => createTag({ text: "Missed", tone: "danger" }) },
      { label: "with icon", render: () => createTag({ text: "Found 4/14", icon: "star" }) },
    ],
  },
];
