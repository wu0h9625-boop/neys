// 建立 DOM 的共用 helper。元件、頁面、展示頁都用這裡，不各自寫一份。

import { buildTermPattern } from "./text.js";

/**
 * el("button", { className: "button", text: "OK", attrs: { type: "button" }, on: { click } }, [child])
 * children 可放 Node、字串；null / undefined / false 會被略過。
 */
export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const { className, text, attrs, dataset, on } = options;

  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value === null || value === undefined) continue;
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }
  if (dataset) Object.assign(node.dataset, dataset);
  if (on) {
    for (const [event, handler] of Object.entries(on)) node.addEventListener(event, handler);
  }
  append(node, children);
  return node;
}

export function append(parent, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

/**
 * 把句子裡的目標單字包成 <mark>，回傳 DocumentFragment。
 * 不分大小寫，也會標出 -s / -es / -ed / -ing 變化。
 */
export function highlightWords(text, words = []) {
  const fragment = document.createDocumentFragment();
  const pattern = buildTermPattern(words);
  if (!pattern) {
    fragment.append(text);
    return fragment;
  }

  let last = 0;
  for (const match of text.matchAll(pattern)) {
    fragment.append(text.slice(last, match.index));
    fragment.append(el("mark", { text: match[0] }));
    last = match.index + match[0].length;
  }
  fragment.append(text.slice(last));
  return fragment;
}
