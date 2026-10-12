// 發音：包裝瀏覽器的 Web Speech API（speechSynthesis）。
//
// iOS Safari 只允許在使用者點擊的同一個事件裡呼叫 speak()，
// 所以 speak() 是同步呼叫 synth.speak()，不能先 await 任何東西。
//
// 不指定語音名稱，只設定語言 en-US，讓瀏覽器使用作業系統預設的美式聲音。
// 網頁能用名稱選到的語音（例如 macOS 的 Samantha）是品質較差的版本，
// 系統預設聲音通常是高品質的 Siri 聲音，但網頁無法用名稱指定它。
// 單字、例句、對話的兩個人都用同一個聲音，說話者靠泡泡位置與顏色區分。

const LANG = "en-US";

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;

export function isSpeechSupported() {
  return Boolean(synth) && typeof window.SpeechSynthesisUtterance === "function";
}

function createUtterance(text, rate) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
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
