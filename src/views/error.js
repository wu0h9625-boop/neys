// 載入失敗時的頁面（例如場景檔不存在、網路斷線）。

import { el } from "../lib/dom.js";
import { createButton } from "../components/button.js";
import { createHeading } from "../components/heading.js";
import { createText } from "../components/text.js";

export function renderError(root, error) {
  document.title = "Something went wrong · Name It";
  root.replaceChildren(
    el("section", { className: "error-view" }, [
      createHeading({ text: "Something went wrong", level: 1, size: "lg" }),
      createText({ text: "This scene could not be loaded. Check your connection and try again." }),
      createText({ text: error?.message ?? String(error), size: "sm", tone: "muted" }),
      el("div", { className: "error-view__actions" }, [
        createButton({ label: "Try again", onClick: () => location.reload() }),
        createButton({ label: "Back to scenes", variant: "secondary", icon: "arrow-left", onClick: () => (location.hash = "#/") }),
      ]),
    ]),
  );
}
