// 答案判定。純邏輯，不碰 DOM，可以在 Node 跑測試（tests/answer-check.test.js）。
//
// 規則：
// 1. 忽略大小寫、前後空白、句尾標點、開頭的 a / an / the。
// 2. 空白與連字號視為相同：trash can = trashcan = trash-can。
// 3. 符合 accept 清單中任一個 → correct。
// 4. 跟任一個答案只差 1 個字母（多一個、少一個、換一個、相鄰兩個對調）→ almost，算答對。
//    只有 4 個字母以上的答案才容許拼錯；3 個字母以下差一個字母常常是另一個字（mug / bug）。
// 5. 其他 → wrong；沒輸入 → empty。

const ARTICLE = /^(?:a|an|the)\s+/;
const MIN_LENGTH_FOR_TYPO = 4;

/** 統一大小寫、空白、標點，去掉冠詞。回傳只剩字母與數字的字串，用來比對。 */
export function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .trim()
    .replace(/\s+/g, " ")
    .replace(ARTICLE, "")
    .replace(/[\s\-_'.,!?;:"]+/g, "");
}

/**
 * 編輯距離（Optimal String Alignment）：插入、刪除、替換、相鄰對調各算 1。
 * limit：超過就提早停止，回傳 limit + 1。
 */
export function editDistance(a, b, limit = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, (_, i) => {
    const row = new Array(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j += 1) d[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    let rowMin = Infinity;
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > limit) return limit + 1;
  }
  return d[a.length][b.length];
}

/**
 * checkAnswer("refrigerater", ["refrigerator", "fridge"])
 * → { result: "almost", match: "refrigerator" }
 * result：correct | almost | wrong | empty
 * match：最接近的正確答案（原本的寫法），wrong 與 empty 時是 accept[0]。
 */
export function checkAnswer(input, accept = []) {
  const answers = accept.filter(Boolean);
  const value = normalize(input);
  const fallback = answers[0] ?? "";

  if (!value) return { result: "empty", match: fallback };

  for (const answer of answers) {
    if (normalize(answer) === value) return { result: "correct", match: answer };
  }

  for (const answer of answers) {
    const target = normalize(answer);
    if (target.length < MIN_LENGTH_FOR_TYPO) continue;
    if (editDistance(value, target, 1) <= 1) return { result: "almost", match: answer };
  }

  return { result: "wrong", match: fallback };
}

/** 答對（含 almost）就算找到這個物件。 */
export function isAccepted(result) {
  return result === "correct" || result === "almost";
}

/**
 * 提示：第一個字母 + 每個字母一格底線 + 總字母數。
 * buildHint("stapler")     → "s _ _ _ _ _ _ (7)"
 * buildHint("sticky note") → "s _ _ _ _ _   _ _ _ _ (10)"（字之間空三格）
 */
export function buildHint(word) {
  const words = String(word ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = words.join("").length;
  if (letters === 0) return "";

  const parts = words.map((w, index) =>
    [...w].map((char, i) => (index === 0 && i === 0 ? char.toLowerCase() : "_")).join(" "),
  );
  return `${parts.join("   ")} (${letters})`;
}
