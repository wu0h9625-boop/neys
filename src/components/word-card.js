// word-card：揭曉後的黃色單字卡。詞性、單字、IPA、52px 發音鈕，下方是可接受的其他說法（Also OK）。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";
import { createSpeakButton } from "./speak-button.js";
import { createTag } from "./tag.js";

// 設計稿：52px 按鈕裡的喇叭是 22px
const HERO_ICON_SIZE = 22;

/**
 * createWordCard({ word: "water dispenser", pos: "noun", ipa: "/ˈwɔːtər dɪˈspensər/", alternatives: ["water cooler"] })
 */
export function createWordCard({ word, pos, ipa, alternatives = [], headingLevel = 3, className = "" } = {}) {
  const play = createSpeakButton({ text: word, variant: "ink", size: "lg" });
  play.querySelector(".icon")?.replaceWith(createIcon("speaker", { size: HERO_ICON_SIZE }));

  return el("section", { className: ["word-card", className].filter(Boolean).join(" "), attrs: { "aria-label": `Word: ${word}` } }, [
    el("div", { className: "word-card__main" }, [
      el("div", { className: "word-card__text" }, [
        pos ? el("span", { className: "word-card__pos", text: pos }) : null,
        el(`h${headingLevel}`, { className: "word-card__word", text: word }),
        ipa ? el("span", { className: "word-card__ipa", text: ipa }) : null,
      ]),
      play,
    ]),
    alternatives.length > 0
      ? el("div", { className: "word-card__also" }, [
          el("span", { className: "word-card__also-label", text: "Also OK" }),
          ...alternatives.map((text) => createTag({ text, kind: "chip", tone: "ink-accent" })),
        ])
      : null,
  ]);
}
