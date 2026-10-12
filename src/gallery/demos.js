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
import { createButton } from "../components/button.js";
import { createDialogue } from "../components/dialogue.js";
import { createFeedback } from "../components/feedback.js";
import { createHeading } from "../components/heading.js";
import { createIcon, ICON_NAMES } from "../components/icon.js";
import { createPixelFrame } from "../components/pixel-frame.js";
import { createProgressBadge, setProgress } from "../components/progress-badge.js";
import { createSentenceList } from "../components/sentence-list.js";
import { createSpeakButton } from "../components/speak-button.js";
import { createTag } from "../components/tag.js";
import { createTextInput, setTextInputState, setTextInputReadOnly } from "../components/text-input.js";

const sampleText = (text = "There's a stapler on my desk.") => el("p", { text });

const withState = (state, value) => {
  const input = createTextInput({ value });
  setTextInputState(input, state);
  return input;
};

export const demos = [
  {
    name: "button",
    description: "Every button in the game. Press it to see the 4px push-down. Ghost has no frame.",
    variants: [
      { label: "primary", render: () => createButton({ label: "Check" }) },
      { label: "secondary", render: () => createButton({ label: "Reveal", variant: "secondary" }) },
      { label: "ghost", render: () => createButton({ label: "Reset progress", variant: "ghost" }) },
      { label: "with icon", render: () => createButton({ label: "Hint", variant: "secondary", icon: "bulb" }) },
      { label: "icon-only", render: () => createButton({ label: "Close", variant: "secondary", icon: "close", iconOnly: true }) },
      { label: "icon-only ghost", render: () => createButton({ label: "Play pronunciation", variant: "ghost", icon: "speaker", iconOnly: true }) },
      { label: "disabled", render: () => createButton({ label: "Check", disabled: true }) },
      { label: "block (full width)", wide: true, render: () => el("div", { attrs: { style: "width: 100%; max-width: 360px" } }, [createButton({ label: "Scene talk", icon: "chat", block: true })]) },
    ],
  },
  {
    name: "dialogue",
    description: "Two-person dialogue. Each line has a speak button; Play all reads every line with two voices and marks the current line.",
    variants: [
      {
        label: "default speakers A / B",
        wide: true,
        render: () =>
          createDialogue({
            highlight: ["stapler"],
            lines: [
              { speaker: "A", text: "Hey, do you have a stapler I could borrow?" },
              { speaker: "B", text: "Sure, it's in the top drawer." },
              { speaker: "A", text: "Thanks! Mine keeps jamming." },
              { speaker: "B", text: "Just bring it back when you're done." },
            ],
          }),
      },
      {
        label: "named speakers (different widths stay aligned)",
        wide: true,
        render: () =>
          createDialogue({
            title: "At the crosswalk",
            speakers: { A: "You", B: "Stranger" },
            highlight: ["crosswalk"],
            lines: [
              { speaker: "A", text: "Excuse me, is this crosswalk safe to use?" },
              { speaker: "B", text: "Yes, just wait for the green light." },
            ],
          }),
      },
    ],
  },
  {
    name: "feedback",
    description: "Result message under the answer field. It is an aria-live region: create once, then update with setFeedback.",
    variants: [
      { label: "success", render: () => createFeedback({ tone: "success", message: "Nice! That's right." }) },
      { label: "almost", render: () => createFeedback({ tone: "almost", message: "Almost!", detail: "It's spelled refrigerator." }) },
      { label: "error", render: () => createFeedback({ tone: "error", message: "Not quite. Try again." }) },
      { label: "hint", render: () => createFeedback({ tone: "hint", message: "s _ _ _ _ _ _ (7)" }) },
      { label: "info", render: () => createFeedback({ tone: "info", message: "Type what you think it is." }) },
      { label: "long message wraps", render: () => el("div", { attrs: { style: "max-width: 260px" } }, [createFeedback({ tone: "almost", message: "Almost!", detail: "Fridge and refrigerator are both correct. You typed refrigerater." })]) },
    ],
  },
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
    name: "progress-badge",
    description: "Found-count for a scene. Turns green when every object is found. Use +1 to count up.",
    variants: [
      { label: "none found", render: () => createProgressBadge({ found: 0, total: 14 }) },
      { label: "in progress", render: () => createProgressBadge({ found: 4, total: 14 }) },
      { label: "complete", render: () => createProgressBadge({ found: 14, total: 14 }) },
      {
        label: "setProgress()",
        render: () => {
          let found = 12;
          const badge = createProgressBadge({ found, total: 14 });
          const next = createButton({ label: "+1", variant: "secondary", onClick: () => setProgress(badge, { found: (found = found >= 14 ? 0 : found + 1), total: 14 }) });
          return el("div", { attrs: { style: "display: flex; align-items: center; gap: 12px" } }, [badge, next]);
        },
      },
    ],
  },
  {
    name: "sentence-list",
    description: "Self-talk sentences with a speak button each. The target word is highlighted.",
    variants: [
      {
        label: "with type tags",
        wide: true,
        render: () =>
          createSentenceList({
            highlight: ["stapler", "staple"],
            sentences: [
              { tag: "Describe", text: "There's a stapler on the edge of my desk." },
              { tag: "Act", text: "Let me staple these pages together." },
              { tag: "Feel", text: "I should get a new stapler; this one keeps jamming." },
            ],
          }),
      },
      {
        label: "plain strings, no title",
        wide: true,
        render: () => createSentenceList({ title: "", highlight: ["crosswalk"], sentences: ["I'm waiting at the crosswalk.", "The crosswalks here are really wide."] }),
      },
    ],
  },
  {
    name: "speak-button",
    description: "Plays the text with the browser voice (en-US). Hidden when the browser cannot speak. Click to hear it.",
    variants: [
      { label: "icon-only ghost (default)", render: () => createSpeakButton({ text: "stapler" }) },
      { label: "secondary", render: () => createSpeakButton({ text: "refrigerator", variant: "secondary" }) },
      { label: "with label", render: () => createSpeakButton({ text: "There's a stapler on my desk.", label: "Listen", showLabel: true, variant: "secondary" }) },
      { label: "voice B", render: () => createSpeakButton({ text: "Sure, here you go.", voice: 1 }) },
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
  {
    name: "text-input",
    description: "Answer field. Press Enter to submit. Wrong answers shake the field.",
    variants: [
      { label: "default (focus it)", render: () => createTextInput({ onSubmit: (value) => console.log("submit", value) }) },
      { label: "almost", render: () => withState("almost", "refrigerater") },
      { label: "wrong (shakes when set)", render: () => withState("wrong", "freezer") },
      { label: "correct + read-only", render: () => { const input = withState("correct", "fridge"); setTextInputReadOnly(input, true); return input; } },
      { label: "hidden label", render: () => createTextInput({ hideLabel: true }) },
    ],
  },
];
