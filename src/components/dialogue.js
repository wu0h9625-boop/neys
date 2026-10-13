// dialogue：兩人一來一往的對話，聊天泡泡樣式。
// 第一位說話者（通常是 A = You）靠右、青色；第二位靠左、米色。點泡泡播放那一句；
// 標題列的 Play all 連續唸完，唸到哪句就標出那一句。兩人用同一個聲音（Google US English，見 lib/speech.js）。

import { el, highlightWords } from "../lib/dom.js";
import { speak, speakSequence, stopSpeaking, isSpeechSupported } from "../lib/speech.js";
import { createButton, setButtonIcon, setButtonLabel } from "./button.js";
import { createCard } from "./card.js";
import { createTag } from "./tag.js";

const SIDES = ["end", "start"];
const LABEL_TONES = ["teal", "orange"];

/**
 * createDialogue({
 *   title: "Borrowing a stapler",
 *   lines: [{ speaker: "A", text: "Can I borrow your stapler?" }, { speaker: "B", text: "Sure." }],
 *   speakers: { A: "You", B: "Coworker" },   // 可省略，預設直接顯示 A / B
 *   highlight: ["stapler"],
 * })
 */
export function createDialogue({ title = "Mini dialogue", lines = [], speakers = {}, highlight = [], headingLevel = 3, className = "" } = {}) {
  // 依出現順序決定每個說話者用第幾種聲音、靠哪一邊
  const order = [...new Set(lines.map((line) => line.speaker))];
  const indexOf = (speaker) => Math.max(order.indexOf(speaker), 0);
  const canSpeak = isSpeechSupported();

  const bubbles = [];
  const items = lines.map((line) => {
    const index = indexOf(line.speaker);
    const name = speakers[line.speaker] || line.speaker;
    const bubble = el(
      "button",
      {
        className: "dialogue__bubble",
        attrs: { type: "button", "aria-label": `${name}: ${line.text}. Play this line.`, "aria-pressed": "false", disabled: !canSpeak },
        on: {
          click: async () => {
            bubble.setAttribute("aria-pressed", "true");
            await speak(line.text, { voice: index });
            bubble.setAttribute("aria-pressed", "false");
          },
        },
      },
      [highlightWords(line.text, highlight)],
    );
    bubbles.push(bubble);
    return el("li", { className: `dialogue__line dialogue__line--${SIDES[index % SIDES.length]}`, dataset: { speaker: line.speaker } }, [
      createTag({ text: name, kind: "label", tone: LABEL_TONES[index % LABEL_TONES.length], className: "dialogue__speaker" }),
      bubble,
    ]);
  });

  let playing = false;
  const markLine = (index) => bubbles.forEach((bubble, i) => bubble.classList.toggle("dialogue__bubble--playing", i === index));

  const playAll = createButton({
    label: "Play all",
    size: "sm",
    icon: "play",
    className: "dialogue__play",
    onClick: async () => {
      if (playing) {
        stopSpeaking();
        return;
      }
      playing = true;
      setButtonLabel(playAll, "Stop");
      setButtonIcon(playAll, "stop");
      await speakSequence(
        lines.map((line) => ({ text: line.text, voice: indexOf(line.speaker) })),
        { onLineStart: markLine },
      );
      playing = false;
      markLine(-1);
      setButtonLabel(playAll, "Play all");
      setButtonIcon(playAll, "play");
    },
  });
  playAll.hidden = !canSpeak || lines.length === 0;

  return createCard({
    title,
    headingLevel,
    actions: [playAll],
    className: ["dialogue", className].filter(Boolean).join(" "),
    children: [el("ol", { className: "dialogue__lines" }, items)],
  });
}
