// 發音：包裝瀏覽器的 Web Speech API（speechSynthesis）。
//
// iOS Safari 只允許在使用者點擊的同一個事件裡呼叫 speak()，
// 所以 speak() 是同步呼叫 synth.speak()，不能先 await 任何東西。

const LANG = "en-US";

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
let voices = [];

export function isSpeechSupported() {
  return Boolean(synth) && typeof window.SpeechSynthesisUtterance === "function";
}

function loadVoices() {
  if (!isSpeechSupported()) return;
  voices = synth.getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith("en"));
  // en-US 排前面，其次是其他英文口音
  voices.sort((a, b) => Number(b.lang === LANG) - Number(a.lang === LANG) || Number(b.localService) - Number(a.localService));
}

if (isSpeechSupported()) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

/**
 * speak("stapler", { voice: 0 })
 * voice：0 或 1，對話裡 A、B 兩個人用不同聲音。只有一個英文聲音時，B 改用較高的音調區分。
 * 回傳 Promise：唸完回傳 true；被打斷或失敗回傳 false。
 */
export function speak(text, { voice = 0, rate = 0.95 } = {}) {
  if (!isSpeechSupported() || !text) return Promise.resolve(false);

  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  utterance.rate = rate;

  if (voices.length > 0) {
    utterance.voice = voices[voice % voices.length];
  }
  if (voice > 0 && voices.length < 2) {
    utterance.pitch = 1.25;
  }

  const done = new Promise((resolve) => {
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
  });
  synth.speak(utterance);
  return done;
}

/**
 * 連續唸多句（對話的 Play all）。所有句子在同一個點擊事件裡一次排進佇列，iOS Safari 才不會擋。
 * speakSequence([{ text, voice }], { onLineStart: (index) => {} })
 * 全部唸完回傳 true；被打斷回傳 false。
 */
export function speakSequence(items, { rate = 0.95, onLineStart } = {}) {
  if (!isSpeechSupported() || items.length === 0) return Promise.resolve(false);

  synth.cancel();
  return new Promise((resolve) => {
    items.forEach(({ text, voice = 0 }, index) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG;
      utterance.rate = rate;
      if (voices.length > 0) utterance.voice = voices[voice % voices.length];
      if (voice > 0 && voices.length < 2) utterance.pitch = 1.25;

      utterance.onstart = () => onLineStart?.(index);
      utterance.onerror = () => resolve(false);
      if (index === items.length - 1) utterance.onend = () => resolve(true);
      synth.speak(utterance);
    });
  });
}

export function stopSpeaking() {
  if (isSpeechSupported()) synth.cancel();
}
