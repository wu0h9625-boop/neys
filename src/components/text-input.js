// text-input：作答輸入框。狀態 default / almost / wrong / correct 由 setTextInputState 切換。

import { el } from "../lib/dom.js";

const STATES = ["default", "almost", "wrong", "correct"];
let idCounter = 0;

/**
 * createTextInput({ label: "What's this called?", onSubmit: (value) => check(value) })
 * 按 Enter 會呼叫 onSubmit（輸入法選字中按 Enter 不算）。
 */
export function createTextInput({
  label = "What's this called?",
  placeholder = "Type the English word",
  name = "answer",
  value = "",
  hideLabel = false,
  autofocus = false,
  onSubmit,
  className = "",
} = {}) {
  idCounter += 1;
  const id = `text-input-${idCounter}`;

  const field = el("input", {
    className: "text-input__field pixel-border",
    attrs: {
      id,
      name,
      type: "text",
      value,
      placeholder,
      autocomplete: "off",
      autocapitalize: "off",
      autocorrect: "off",
      spellcheck: "false",
      enterkeyhint: "done",
      autofocus,
    },
  });

  if (onSubmit) {
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        onSubmit(field.value);
      }
    });
  }

  return el("div", { className: ["text-input", className].filter(Boolean).join(" "), dataset: { state: "default" } }, [
    el("label", { className: hideLabel ? "visually-hidden" : "text-input__label", text: label, attrs: { for: id } }),
    field,
  ]);
}

function fieldOf(wrapper) {
  return wrapper.querySelector(".text-input__field");
}

export function setTextInputState(wrapper, state) {
  const next = STATES.includes(state) ? state : "default";
  wrapper.dataset.state = next;
  fieldOf(wrapper).setAttribute("aria-invalid", next === "wrong" ? "true" : "false");

  // 每次答錯都重播搖晃動畫
  if (next === "wrong") {
    wrapper.classList.remove("text-input--shake");
    void wrapper.offsetWidth;
    wrapper.classList.add("text-input--shake");
  }
}

export function getTextInputValue(wrapper) {
  return fieldOf(wrapper).value;
}

export function setTextInputValue(wrapper, value) {
  fieldOf(wrapper).value = value;
}

export function setTextInputReadOnly(wrapper, readOnly) {
  fieldOf(wrapper).readOnly = readOnly;
}

export function focusTextInput(wrapper) {
  fieldOf(wrapper).focus();
}
