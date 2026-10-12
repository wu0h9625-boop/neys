// 在 iframe 內渲染 demos.js 的所有元件與 variant。

import { el } from "../lib/dom.js";
import { demos } from "./demos.js";

const root = document.getElementById("gallery");

function renderVariant(variant) {
  const stage = el("div", { className: variant.viewport ? "gallery__viewport" : "gallery__variant-stage" });
  try {
    stage.append(variant.render());
  } catch (error) {
    stage.append(el("p", { className: "gallery__error", text: `Render failed: ${error.message}` }));
    console.error(error);
  }

  return el("div", { className: variant.wide ? "gallery__variant gallery__variant--wide" : "gallery__variant" }, [
    el("p", { className: "gallery__variant-label", text: variant.label }),
    stage,
  ]);
}

function renderDemo(demo) {
  return el("section", { className: "gallery__section", attrs: { id: demo.name } }, [
    el("h2", { className: "gallery__name", text: demo.name }),
    demo.description ? el("p", { className: "gallery__description", text: demo.description }) : null,
    el("div", { className: "gallery__variants" }, demo.variants.map(renderVariant)),
  ]);
}

function render() {
  if (demos.length === 0) {
    root.replaceChildren(el("p", { className: "gallery__empty", text: "No components yet. Add one to src/gallery/demos.js." }));
    return;
  }
  root.replaceChildren(...demos.map(renderDemo));
}

render();
