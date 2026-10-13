// 發音：包裝瀏覽器的 Web Speech API（speechSynthesis）。
//
// iOS Safari 只允許在使用者點擊的同一個事件裡呼叫 speak()，
// 所以 speak() 是同步呼叫 synth.speak()，不能先 await 任何東西。
//
// 聲音：指定 Chrome 內建的「Google US English」（使用者在試聽頁選定的自然美式女聲）。
// 單字、例句、對話的兩個人都用同一個聲音，說話者靠泡泡位置與顏色區分。
// 沒有這個語音的瀏覽器（Safari、Firefox、離線的 Chrome）不指定語音，只設 en-US。
// 注意：macOS Chrome 在「只設 en-US」時會用清單第一個美式語音 Albert（特效聲），
// 但 macOS Chrome 都有 Google US English，所以實際不會走到這個情況。

const LANG = "en-US";
export const PREFERRED_VOICE = "Google US English";

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
let preferred = null;

export function isSpeechSupported() {
  return Boolean(synth) && typeof window.SpeechSynthesisUtterance === "function";
}

/** 從語音清單找指定的語音，找不到回傳 null。純函式，tests/speech.test.js 測試。 */
export function findPreferredVoice(voices = [], name = PREFERRED_VOICE) {
  return voices.find((voice) => voice.name === name) ?? null;
}

function loadVoices() {
  preferred = findPreferredVoice(synth.getVoices());
}

if (isSpeechSupported()) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

function createUtterance(text, rate) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (preferred) utterance.voice = preferred;
  utterance.lang = preferred?.lang || LANG;
  utterance.rate = rate;
  return utterance;
}

/**
 * speak("stapler")
 * 回傳 Promise：唸完回傳 true；被打斷或失敗回傳 false。
 * 第二個參數的 voice（對話的 A / B）保留給呼叫端，目前兩人用同一個聲音，不影響結果。
 */
export function speak(text, { rate = 0.95 } = {}) {
  if (!isSpeechSupported() || !text) return Promise.resolve(false);

  synth.cancel();
  const utterance = createUtterance(text, rate);
  const done = new Promise((resolve) => {
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
  });
  synth.speak(utterance);
  return done;
}

/**
 * 連續唸多句（對話的 Play all）。所有句子在同一個點擊事件裡一次排進佇列，iOS Safari 才不會擋。
 * speakSequence([{ text }], { onLineStart: (index) => {} })
 * 全部唸完回傳 true；被打斷回傳 false。
 */
export function speakSequence(items, { rate = 0.95, onLineStart } = {}) {
  if (!isSpeechSupported() || items.length === 0) return Promise.resolve(false);

  synth.cancel();
  return new Promise((resolve) => {
    items.forEach(({ text }, index) => {
      const utterance = createUtterance(text, rate);
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
