// dialogue：兩人一來一往的對話。每句有發音按鈕；標題旁的 Play all 會用兩種聲音連續唸完。

import { el, highlightWords } from "../lib/dom.js";
import { speakSequence, stopSpeaking, isSpeechSupported } from "../lib/speech.js";
import { createButton, setButtonIcon, setButtonLabel } from "./button.js";
import { createHeading } from "./heading.js";
import { createSpeakButton } from "./speak-button.js";
import { createTag } from "./tag.js";

const SPEAKER_TONES = ["info", "accent"];

/**
 * createDialogue({
 *   title: "Borrowing a stapler",
 *   lines: [{ speaker: "A", text: "Can I borrow your stapler?" }, { speaker: "B", text: "Sure." }],
 *   speakers: { A: "You", B: "Coworker" },   // 可省略，預設直接顯示 A / B
 *   highlight: ["stapler"],
 * })
 */
export function createDialogue({ title = "Mini dialogue", lines = [], speakers = {}, highlight = [], headingLevel = 3, className = "" } = {}) {
  // 依出現順序決定每個說話者用第幾種聲音與顏色
  const order = [...new Set(lines.map((line) => line.speaker))];
  const voiceOf = (speaker) => Math.max(order.indexOf(speaker), 0);

  const items = lines.map((line) => {
    const voice = voiceOf(line.speaker);
    return el("li", { className: "dialogue__line", dataset: { speaker: line.speaker } }, [
      createTag({ text: speakers[line.speaker] || line.speaker, tone: SPEAKER_TONES[voice % SPEAKER_TONES.length], className: "dialogue__speaker" }),
      el("p", { className: "dialogue__text" }, [highlightWords(line.text, highlight)]),
      createSpeakButton({ text: line.text, voice }),
    ]);
  });

  const list = el("ol", { className: "dialogue__lines" }, items);

  let playing = false;
  const markLine = (index) => items.forEach((item, i) => item.classList.toggle("dialogue__line--playing", i === index));

  const playAll = createButton({
    label: "Play all",
    variant: "ghost",
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
        lines.map((line) => ({ text: line.text, voice: voiceOf(line.speaker) })),
        { onLineStart: markLine },
      );
      playing = false;
      markLine(-1);
      setButtonLabel(playAll, "Play all");
      setButtonIcon(playAll, "play");
    },
  });
  playAll.hidden = !isSpeechSupported() || lines.length === 0;

  return el("section", { className: ["dialogue", className].filter(Boolean).join(" ") }, [
    el("div", { className: "dialogue__header" }, [
      title ? createHeading({ text: title, level: headingLevel, size: "sm", tone: "accent" }) : null,
      playAll,
    ]),
    list,
  ]);
}
