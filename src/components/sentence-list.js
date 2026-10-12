// sentence-list：self-talk 例句列表，每句後面有發音按鈕，目標單字會標色。

import { el, highlightWords } from "../lib/dom.js";
import { createHeading } from "./heading.js";
import { createSpeakButton } from "./speak-button.js";
import { createTag } from "./tag.js";

/**
 * createSentenceList({
 *   sentences: ["There's a stapler on my desk.", { text: "Let me staple these.", tag: "Act" }],
 *   highlight: ["stapler", "staple"],
 * })
 */
export function createSentenceList({ title = "Say it to yourself", sentences = [], highlight = [], headingLevel = 3, className = "" } = {}) {
  const items = sentences.map((sentence) => {
    const { text, tag } = typeof sentence === "string" ? { text: sentence } : sentence;
    return el("li", { className: "sentence-list__item" }, [
      el("div", { className: "sentence-list__content" }, [
        tag ? createTag({ text: tag }) : null,
        el("p", { className: "sentence-list__text" }, [highlightWords(text, highlight)]),
      ]),
      createSpeakButton({ text }),
    ]);
  });

  return el("section", { className: ["sentence-list", className].filter(Boolean).join(" ") }, [
    title ? createHeading({ text: title, level: headingLevel, size: "sm", tone: "accent" }) : null,
    el("ol", { className: "sentence-list__items" }, items),
  ]);
}
