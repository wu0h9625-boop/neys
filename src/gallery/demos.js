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

import { el, highlightWords } from "../lib/dom.js";
import { createButton } from "../components/button.js";
import { createDialogue } from "../components/dialogue.js";
import { createFeedback } from "../components/feedback.js";
import { createHeading } from "../components/heading.js";
import { createIcon, ICON_NAMES } from "../components/icon.js";
import { createModal, openModal, closeModal } from "../components/modal.js";
import { createPanel, openPanel } from "../components/panel.js";
import { createPixelFrame } from "../components/pixel-frame.js";
import { createProgressBadge, setProgress } from "../components/progress-badge.js";
import { createSceneCard } from "../components/scene-card.js";
import { createSceneStage, setStageFound, setStageSelected } from "../components/scene-stage.js";
import { loadScene, parseSvg } from "../lib/scenes.js";
import { createSentenceList } from "../components/sentence-list.js";
import { createSpeakButton } from "../components/speak-button.js";
import { createTag } from "../components/tag.js";
import { createText } from "../components/text.js";
import { createTextInput, setTextInputState, setTextInputReadOnly } from "../components/text-input.js";

const sampleText = (text = "There's a stapler on my desk.") => el("p", { text });

// 縮圖示意：用幾個色塊畫出辦公室，實際場景圖在 scenes/*.svg
const sampleThumb = () => {
  const rects = [
    [0, 0, 192, 72, "#333c57"], [0, 72, 192, 36, "#566c86"], [20, 12, 44, 30, "#41a6f6"], [20, 26, 44, 2, "#f4f4f4"],
    [90, 56, 80, 6, "#ef7d57"], [96, 62, 4, 30, "#b13e53"], [160, 62, 4, 30, "#b13e53"], [112, 32, 32, 22, "#1a1c2c"],
    [114, 34, 28, 16, "#73eff7"], [124, 54, 8, 2, "#1a1c2c"], [70, 46, 10, 26, "#38b764"], [72, 66, 6, 6, "#5d275d"],
  ];
  const body = rects.map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join("");
  return new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 108" shape-rendering="crispEdges">${body}</svg>`, "image/svg+xml").documentElement;
};

// modal 展示：每個 variant 是一顆打開 modal 的按鈕
// modal 只建立一次，重複打開同一個，避免每按一次就多一個 <dialog>
const modalTrigger = (label, build) => {
  let modal;
  return createButton({ label, variant: "secondary", onClick: () => openModal((modal ||= build())) });
};

const sceneTalkModal = () =>
  createModal({
    title: "Scene talk",
    children: [
      createDialogue({
        title: "Borrowing a stapler",
        highlight: ["stapler"],
        lines: [
          { speaker: "A", text: "Hey, do you have a stapler I could borrow?" },
          { speaker: "B", text: "Sure, it's in the top drawer." },
          { speaker: "A", text: "Thanks! Mine keeps jamming." },
          { speaker: "B", text: "Just bring it back when you're done." },
        ],
      }),
    ],
  });

const completeModal = () => {
  const modal = createModal({
    title: "Scene complete!",
    size: "sm",
    dismissible: false,
    children: [
      el("div", { attrs: { style: "display: flex; align-items: center; gap: 16px; color: var(--color-accent)" } }, [createIcon("star", { scale: 4 }), createProgressBadge({ found: 14, total: 14 })]),
      el("p", { text: "You named everything in the office. Try saying each one out loud tomorrow at work." }),
    ],
    actions: [
      createButton({ label: "Stay here", variant: "secondary", onClick: () => closeModal(modal) }),
      createButton({ label: "Next scene", onClick: () => closeModal(modal) }),
    ],
  });
  return modal;
};

// scene-stage 展示：載入實際的 office 場景。點選後標成已找到，模擬答對
const stageDemo = () => {
  const status = createText({ text: "Hover, tap or Tab to an object, then click / tap again / press Enter.", size: "sm", tone: "muted" });
  const wrap = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 12px; width: 100%" } }, [status]);
  loadScene("office").then(({ data, svgText }) => {
    const ids = data.objects.map((o) => o.id);
    const stage = createSceneStage({
      svg: parseSvg(svgText),
      objectIds: ids,
      found: new Set(["mug"]),
      getLabel: (id, isFound) => `Object ${ids.indexOf(id) + 1} of ${ids.length}${isFound ? `: ${id}` : ""}`,
      onSelect: (id) => {
        setStageSelected(stage, id);
        setStageFound(stage, id);
        status.textContent = `Selected: ${id}`;
      },
    });
    wrap.append(stage);
  });
  return wrap;
};

// panel 展示：一個假場景頁，面板裡放實際的作答內容
const panelDemo = () => {
  const answer = createTextInput({});
  const panel = createPanel({
    title: "Object 3 of 14",
    children: [
      answer,
      el("div", { attrs: { style: "display: flex; flex-wrap: wrap; gap: 8px" } }, [
        createButton({ label: "Check" }),
        createButton({ label: "Hint", variant: "secondary", icon: "bulb" }),
        createButton({ label: "Reveal", variant: "secondary" }),
      ]),
      createFeedback({ tone: "hint", message: "s _ _ _ _ _ _ (7)" }),
      createSentenceList({ highlight: ["stapler"], sentences: ["There's a stapler on my desk.", "Let me staple these pages together.", "This stapler keeps jamming."] }),
    ],
  });
  const scene = el("div", { className: "gallery-demo-scene" }, [
    el("p", { text: "Scene area. Below 1024px the panel is hidden until opened." }),
    createButton({ label: "Open panel", onClick: () => openPanel(panel) }),
  ]);
  return el("div", { className: "gallery-demo-layout" }, [scene, panel]);
};

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
    name: "modal",
    description: "Full-screen dialog (native <dialog>). Focus stays inside; Escape, the close button or a backdrop click closes it unless dismissible is false.",
    variants: [
      { label: "md · Scene talk", render: () => modalTrigger("Open Scene talk", sceneTalkModal) },
      { label: "sm · not dismissible", render: () => modalTrigger("Open Scene complete", completeModal) },
    ],
  },
  {
    name: "panel",
    description: "Answer panel for the scene page. Under 768px it is a bottom sheet, 768–1023px it slides in from the right, from 1024px it sits beside the scene. Switch the width to compare. Escape or the close button closes it.",
    variants: [{ label: "inside a simulated 480px-tall screen", wide: true, viewport: true, render: panelDemo }],
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
    name: "scene-stage",
    description: "Interactive scene art (office). Selecting an object here also marks it as found so you can see the star.",
    variants: [{ label: "office · mug already found", wide: true, render: stageDemo }],
  },
  {
    name: "scene-card",
    description: "Home-screen card for a scene. The whole card is a link; hover or focus turns the frame yellow.",
    variants: [
      { label: "with thumbnail", render: () => el("div", { attrs: { style: "width: 300px" } }, [createSceneCard({ title: "Office", description: "Desks, printers and coffee mugs.", thumbnail: sampleThumb(), found: 4, total: 14 })]) },
      { label: "placeholder thumbnail", render: () => el("div", { attrs: { style: "width: 300px" } }, [createSceneCard({ title: "Sidewalk", description: "Your walk to work.", found: 0, total: 12 })]) },
      { label: "complete", render: () => el("div", { attrs: { style: "width: 300px" } }, [createSceneCard({ title: "Studio apartment", thumbnail: sampleThumb(), found: 12, total: 12 })]) },
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
    name: "text",
    description: "Body text. Pages use it for descriptions and secondary notes instead of setting colours themselves.",
    variants: [
      { label: "md (default)", render: () => createText({ text: "Tap anything in the scene and say its name out loud first." }) },
      { label: "lg", render: () => createText({ text: "Also accepted: fridge", size: "lg" }) },
      { label: "sm · muted", render: () => createText({ text: "Progress is saved in this browser.", size: "sm", tone: "muted" }) },
      { label: "accent", render: () => createText({ text: "New words found today: 5", tone: "accent" }) },
      { label: "with children (highlighted word)", render: () => createText({ children: [highlightWords("Let me staple these pages.", ["staple"])] }) },
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
