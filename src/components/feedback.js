// feedback：答對、差一點、答錯、提示的訊息列。
// 是一個 aria-live 區域：建立一次，之後用 setFeedback 更新內容，螢幕閱讀器才會唸出變化。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";

const TONES = {
  success: "check",
  almost: "star",
  error: "close",
  hint: "bulb",
  info: null,
};

export function createFeedback({ tone = "info", message = "", detail = "", className = "" } = {}) {
  const wrapper = el("div", {
    className: ["feedback", className].filter(Boolean).join(" "),
    attrs: { role: "status", "aria-live": "polite" },
  });
  setFeedback(wrapper, { tone, message, detail });
  return wrapper;
}

export function setFeedback(wrapper, { tone = "info", message = "", detail = "" } = {}) {
  const t = tone in TONES ? tone : "info";
  for (const name of Object.keys(TONES)) wrapper.classList.toggle(`feedback--${name}`, name === t);
  wrapper.classList.toggle("feedback--empty", !message);

  const icon = TONES[t];
  wrapper.replaceChildren(
    ...(message
      ? [
          icon ? createIcon(icon, { className: "feedback__icon" }) : null,
          el("div", { className: "feedback__body" }, [
            el("p", { className: "feedback__message", text: message }),
            detail ? el("p", { className: "feedback__detail", text: detail }) : null,
          ]),
        ].filter(Boolean)
      : []),
  );
}

export function clearFeedback(wrapper) {
  setFeedback(wrapper, { message: "" });
}
