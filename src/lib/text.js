// 文字比對的共用工具。純邏輯，dom.js 的 highlightWords 與 scenes.js 的內容檢查都用這裡。

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 找出目標單字（含 -s / -es / -ed / -ing 變化）的 RegExp，不分大小寫。
 * 長的字排前面，"sticky note" 才會優先於 "note" 整段比對到。
 * 沒有任何單字時回傳 null。
 */
export function buildTermPattern(terms = []) {
  const list = [...new Set(terms.filter(Boolean))].map(escapeRegExp).sort((a, b) => b.length - a.length);
  if (list.length === 0) return null;
  return new RegExp(`\\b(?:${list.join("|")})(?:s|es|ed|ing)?\\b`, "gi");
}

/** 句子裡是否出現任一個目標單字。 */
export function containsTerm(text, terms) {
  const pattern = buildTermPattern(terms);
  return pattern ? new RegExp(pattern.source, "i").test(text) : false;
}
