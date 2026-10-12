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

// ---------- 語音挑選 ----------
//
// 瀏覽器的語音清單裡混了很多特效聲（macOS 的 Albert、Bad News、Bubbles……），
// 直接拿清單前面的會唸出機器人或怪聲，所以依品質排序後再挑。

// macOS 內建的特效聲，完全不用
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|junior|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ)\b/i;

// 各平台常見、聽起來自然的英文語音（名稱開頭比對）
const NATURAL = [
  // Apple（macOS / iOS）
  "samantha", "alex", "ava", "allison", "susan", "tom", "evan", "zoe", "nathan", "nicky", "joelle", "noelle", "aaron",
  "daniel", "karen", "moira", "tessa", "rishi", "serena", "kate", "oliver", "arthur", "martha", "catherine", "gordon",
  // Chrome
  "google us english", "google uk english",
  // Windows / Edge
  "microsoft aria", "microsoft jenny", "microsoft guy", "microsoft ana", "microsoft christopher", "microsoft eric",
  "microsoft michelle", "microsoft roger", "microsoft steffan", "microsoft sonia", "microsoft ryan", "microsoft libby",
];

// 合成感較重的舊語音：可以用，但排在自然人聲後面
const ROBOTIC = /^(fred|ralph|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;

const HIGH_QUALITY = /(enhanced|premium|natural|neural|siri)/i;

function voiceScore(voice) {
  const name = String(voice.name ?? "").toLowerCase();
  const lang = String(voice.lang ?? "").replace("_", "-").toLowerCase();
  let score = 0;
  if (lang === "en-us") score += 30;
  if (HIGH_QUALITY.test(name)) score += 40;
  if (NATURAL.some((prefix) => name.startsWith(prefix))) score += 50;
  if (ROBOTIC.test(name)) score -= 40;
  if (voice.default) score += 5;
  return score;
}

/**
 * 把語音清單排成「最適合唸英文例句」在前。特效聲與非英文語音會被濾掉。
 * 純函式，tests/speech.test.js 用假的語音清單測試。
 */
export function rankVoices(list = []) {
  return list
    .filter((voice) => String(voice.lang ?? "").toLowerCase().startsWith("en"))
    .filter((voice) => !NOVELTY.test(String(voice.name ?? "")))
    .map((voice, index) => ({ voice, index, score: voiceScore(voice) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ voice }) => voice);
}

function loadVoices() {
  if (!isSpeechSupported()) return;
  voices = rankVoices(synth.getVoices());
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
