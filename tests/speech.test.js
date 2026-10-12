import { test } from "node:test";
import assert from "node:assert/strict";
import { rankVoices } from "../src/lib/speech.js";

const v = (name, lang, extra = {}) => ({ name, lang, localService: true, default: false, ...extra });

// 實際在 macOS Chrome 上取得的英文語音清單（順序也是瀏覽器給的順序）
const MAC = [
  v("Albert", "en-US"), v("Bad News", "en-US"), v("Bahh", "en-US"), v("Bells", "en-US"), v("Boing", "en-US"),
  v("Bubbles", "en-US"), v("Cellos", "en-US"), v("Daniel", "en-GB"), v("Eddy (英文（英國）)", "en-GB"),
  v("Eddy (英文（美國）)", "en-US"), v("Flo (英文（美國）)", "en-US"), v("Fred", "en-US"), v("Good News", "en-US"),
  v("Grandma (英文（美國）)", "en-US"), v("Jester", "en-US"), v("Junior", "en-US"), v("Karen", "en-AU"),
  v("Kathy", "en-US"), v("Moira", "en-IE"), v("Organ", "en-US"), v("Ralph", "en-US"), v("Reed (英文（美國）)", "en-US"),
  v("Rishi", "en-IN"), v("Samantha", "en-US"), v("Superstar", "en-US"), v("Tessa", "en-ZA"), v("Trinoids", "en-US"),
  v("Whisper", "en-US"), v("Wobble", "en-US"), v("Zarvox", "en-US"), v("Mei-Jia", "zh-TW"),
];

test("macOS：A 用 Samantha，B 用另一個自然人聲（Daniel），不會選到特效聲", () => {
  const ranked = rankVoices(MAC);
  assert.equal(ranked[0].name, "Samantha");
  assert.equal(ranked[1].name, "Daniel");
});

test("特效聲與非英文語音完全被濾掉", () => {
  const names = rankVoices(MAC).map((voice) => voice.name);
  for (const novelty of ["Albert", "Bad News", "Bahh", "Bubbles", "Good News", "Whisper", "Zarvox", "Superstar", "Junior"]) {
    assert.ok(!names.includes(novelty), novelty);
  }
  assert.ok(!names.includes("Mei-Jia"));
});

test("合成感較重的舊語音排在所有自然人聲後面", () => {
  const names = rankVoices(MAC).map((voice) => voice.name);
  const lastNatural = Math.max(...["Samantha", "Daniel", "Karen", "Moira", "Tessa", "Rishi"].map((n) => names.indexOf(n)));
  const firstRobotic = Math.min(...["Fred", "Kathy", "Ralph"].map((n) => names.indexOf(n)));
  assert.ok(lastNatural < firstRobotic);
});

test("Windows / Chrome：自然語音與 Google US English 排前面", () => {
  const ranked = rankVoices([
    v("Microsoft David - English (United States)", "en-US"),
    v("Google US English", "en-US", { localService: false }),
    v("Microsoft Aria Online (Natural) - English (United States)", "en-US", { localService: false }),
  ]);
  assert.equal(ranked[0].name, "Microsoft Aria Online (Natural) - English (United States)");
  assert.equal(ranked[1].name, "Google US English");
});

test("標了 Enhanced / Premium 的高品質語音優先", () => {
  const ranked = rankVoices([v("Samantha", "en-US"), v("Samantha (Enhanced)", "en-US")]);
  assert.equal(ranked[0].name, "Samantha (Enhanced)");
});

test("沒有英文語音時回傳空陣列", () => {
  assert.deepEqual(rankVoices([v("Mei-Jia", "zh-TW")]), []);
  assert.deepEqual(rankVoices(), []);
});
