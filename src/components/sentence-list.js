// sentence-list：例句列表卡片。每句一列：類型標籤 + 句子 + 40px 發音鈕，目標單字會標色。
// Say it to yourself 與 Word picture 都用它。

import { el, highlightWords } from "../lib/dom.js";
import { createCard } from "./card.js";
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
        tag ? createTag({ text: tag, kind: "label", tone: "teal" }) : null,
        el("p", { className: "sentence-list__text" }, [highlightWords(text, highlight)]),
      ]),
      createSpeakButton({ text }),
    ]);
  });

  return createCard({
    title,
    headingLevel,
    className: ["sentence-list", className].filter(Boolean).join(" "),
    children: [el("ol", { className: "sentence-list__items" }, items)],
  });
}
