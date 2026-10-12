// 在 iframe 內渲染 demos.js 的所有元件與 variant。

import { demos } from "./demos.js";

const root = document.getElementById("gallery");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderVariant(variant) {
  const item = el("div", "gallery__variant");
  item.append(el("p", "gallery__variant-label", variant.label));

  const stage = el("div", "gallery__variant-stage");
  try {
    stage.append(variant.render());
  } catch (error) {
    stage.append(el("p", "gallery__error", `Render failed: ${error.message}`));
    console.error(error);
  }
  item.append(stage);
  return item;
}

function renderDemo(demo) {
  const section = el("section", "gallery__section");
  section.id = demo.name;
  section.append(el("h2", "gallery__name", demo.name));
  if (demo.description) section.append(el("p", "gallery__description", demo.description));

  const list = el("div", "gallery__variants");
  demo.variants.forEach((variant) => list.append(renderVariant(variant)));
  section.append(list);
  return section;
}

function render() {
  if (demos.length === 0) {
    root.replaceChildren(el("p", "gallery__empty", "No components yet. Add one to src/gallery/demos.js."));
    return;
  }
  root.replaceChildren(...demos.map(renderDemo));
}

render();
