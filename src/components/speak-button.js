// speak-button：🔊 發音按鈕。建立在 button 上，瀏覽器不支援發音時回傳隱藏的按鈕。

import { isSpeechSupported, speak } from "../lib/speech.js";
import { createButton } from "./button.js";

/**
 * createSpeakButton({ text: "stapler" })
 * label：給螢幕閱讀器的說明，預設 `Play "<text>"`。
 * showLabel：true 時顯示文字（例如 "Listen"），預設只顯示圖示。
 * 預設是例句旁的 40px 方形鈕（secondary、sm）；單字卡用 variant: "ink", size: "lg"（52px）。
 */
export function createSpeakButton({ text, label, voice = 0, variant = "secondary", size = "sm", showLabel = false, className = "" } = {}) {
  const button = createButton({
    label: label || `Play "${text}"`,
    variant,
    size,
    icon: "speaker",
    iconOnly: !showLabel,
    className: ["speak-button", className].filter(Boolean).join(" "),
    attrs: { "aria-pressed": "false" },
  });

  if (!isSpeechSupported()) {
    button.hidden = true;
    return button;
  }

  button.addEventListener("click", async () => {
    button.setAttribute("aria-pressed", "true");
    await speak(button.dataset.text, { voice: Number(button.dataset.voice) });
    button.setAttribute("aria-pressed", "false");
  });

  button.dataset.text = text;
  button.dataset.voice = String(voice);
  return button;
}

/** 讓同一顆按鈕改唸別的字，例如作答面板切換物件時。 */
export function setSpeakText(button, text, label) {
  button.dataset.text = text;
  const nextLabel = label || `Play "${text}"`;
  const hidden = button.querySelector(".visually-hidden");
  if (hidden) hidden.textContent = nextLabel;
  if (button.classList.contains("button--icon-only")) button.title = nextLabel;
}
