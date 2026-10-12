// scene-stage：可互動的場景圖。把 SVG 裡每個 <g data-object="id"> 變成可以點的物件。
//
// 互動方式：
//   滑鼠      hover 出現黃色外框與「?」，點擊選取
//   觸控      第一次點出現外框與「?」，再點一次同一個物件才選取
//   鍵盤      Tab 逐一聚焦物件（外框與「?」），Enter / 空白鍵選取
// 平常場景上不顯示任何標記，保持畫面乾淨；hover、聚焦或選取時，
// 右上角顯示黃色「?」（還沒找到）或綠色 ✓（已找到）。
// 太小的物件會加一塊透明的點擊範圍，換算成螢幕上至少 24×24px（WCAG 2.2 AA 最小目標尺寸）。

import { el } from "../lib/dom.js";
import { createIcon } from "./icon.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const MIN_HIT_PX = 24;
const states = new WeakMap();

/**
 * createSceneStage({
 *   svg,                          // SVG 元素（lib/scenes.js 的 parseSvg）
 *   objectIds: ["whiteboard", ...],
 *   found: new Set(["mug"]),
 *   getLabel: (id, isFound) => "Object 3 of 15",   // 螢幕閱讀器讀的名稱，未找到前不能寫出答案
 *   onSelect: (id, { via }) => {},  // via："touch" | "pointer" | "keyboard"
 * })
 */
export function createSceneStage({ svg, objectIds = [], found = new Set(), getLabel = (id) => id, onSelect, className = "" } = {}) {
  const markers = el("div", { className: "scene-stage__markers", attrs: { "aria-hidden": "true" } });
  const stage = el("div", { className: ["scene-stage", className].filter(Boolean).join(" ") }, [svg, markers]);

  svg.classList.add("scene-stage__art");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "Scene. Use Tab to move between objects.");
  svg.removeAttribute("width");
  svg.removeAttribute("height");

  const viewBox = svg.viewBox.baseVal;
  const state = {
    stage,
    svg,
    viewBox,
    found: new Set(found),
    objects: new Map(),
    getLabel,
    hover: null,
    focus: null,
    armed: null,
    selected: null,
    lastPointer: "mouse",
    measured: false,
  };
  states.set(stage, state);

  for (const id of objectIds) {
    const group = svg.querySelector(`[data-object="${CSS.escape(id)}"]`);
    if (!group) {
      console.warn(`scene-stage: <g data-object="${id}"> not found in the SVG`);
      continue;
    }
    group.classList.add("scene-stage__object");
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("focusable", "true");

    const hit = document.createElementNS(SVG_NS, "rect");
    hit.setAttribute("class", "scene-stage__hit");
    hit.setAttribute("fill", "transparent");
    group.prepend(hit);

    const marker = el("span", { className: "scene-stage__marker" });
    markers.append(marker);

    state.objects.set(id, { group, hit, marker, box: null });
  }

  // ---------- 事件 ----------

  const idOf = (target) => target?.closest?.(".scene-stage__object")?.dataset.object ?? null;

  svg.addEventListener("pointerdown", (event) => {
    state.lastPointer = event.pointerType || "mouse";
  });

  svg.addEventListener("click", (event) => {
    const id = idOf(event.target);
    if (!id) {
      setArmed(state, null);
      return;
    }
    const touchLike = state.lastPointer === "touch" || state.lastPointer === "pen";
    if (touchLike && state.armed !== id && state.selected !== id) {
      setArmed(state, id);
      return;
    }
    setArmed(state, null);
    onSelect?.(id, { via: touchLike ? "touch" : "pointer" });
  });

  svg.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    state.hover = idOf(event.target);
    render(state);
  });

  svg.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    const from = idOf(event.target);
    const to = idOf(event.relatedTarget);
    if (from && from === to) return;
    state.hover = to;
    render(state);
  });

  svg.addEventListener("focusin", (event) => {
    state.focus = idOf(event.target);
    render(state);
  });

  svg.addEventListener("focusout", () => {
    state.focus = null;
    render(state);
  });

  svg.addEventListener("keydown", (event) => {
    const id = idOf(event.target);
    if (!id || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onSelect?.(id, { via: "keyboard" });
  });

  // 點擊範圍與標記位置要在 SVG 實際顯示後才量得到（getBBox），之後每次尺寸改變都重算點擊範圍
  new ResizeObserver(() => layout(state)).observe(stage);

  render(state);
  return stage;
}

// ---------- 版面 ----------

function layout(state) {
  const width = state.svg.clientWidth;
  if (!width) return;

  const scale = width / state.viewBox.width;
  const minUnits = MIN_HIT_PX / scale;

  for (const object of state.objects.values()) {
    if (!object.box) {
      object.box = object.group.getBBox();
    }
    const { x, y, width: w, height: h } = object.box;
    const hitW = Math.max(w, minUnits);
    const hitH = Math.max(h, minUnits);
    object.hit.setAttribute("x", String(x - (hitW - w) / 2));
    object.hit.setAttribute("y", String(y - (hitH - h) / 2));
    object.hit.setAttribute("width", String(hitW));
    object.hit.setAttribute("height", String(hitH));

    // 標記放在物件右上角，貼近邊緣時往內收，避免被裁掉
    const left = Math.min(Math.max(((x + w) / state.viewBox.width) * 100, 4), 96);
    const top = Math.min(Math.max((y / state.viewBox.height) * 100, 6), 94);
    object.marker.style.left = `${left}%`;
    object.marker.style.top = `${top}%`;
  }
  state.measured = true;
}

function render(state) {
  // 觸控第一次點的物件優先；觸控筆電可能同時有殘留的滑鼠 hover
  const active = state.armed ?? state.hover ?? state.focus;
  state.objects.forEach((object, id) => {
    const isFound = state.found.has(id);
    const isActive = id === active;
    const isSelected = id === state.selected;

    object.group.classList.toggle("is-active", isActive);
    object.group.classList.toggle("is-selected", isSelected);
    object.group.classList.toggle("is-found", isFound);
    object.group.setAttribute("aria-label", state.getLabel(id, isFound));
    object.group.setAttribute("aria-pressed", String(isSelected));

    object.marker.classList.toggle("scene-stage__marker--visible", isActive || isSelected);
    object.marker.classList.toggle("scene-stage__marker--found", isFound);
    const kind = isFound ? "found" : "unknown";
    if (object.marker.dataset.kind !== kind) {
      object.marker.dataset.kind = kind;
      object.marker.replaceChildren(isFound ? createIcon("check") : "?");
    }
  });
}

function setArmed(state, id) {
  state.armed = id;
  render(state);
}

// ---------- 給頁面用的控制函式 ----------

export function setStageFound(stage, id) {
  const state = states.get(stage);
  if (!state) return;
  state.found.add(id);
  render(state);
}

export function setStageSelected(stage, id) {
  const state = states.get(stage);
  if (!state) return;
  state.selected = id;
  state.armed = null;
  render(state);
}

export function resetStageFound(stage) {
  const state = states.get(stage);
  if (!state) return;
  state.found.clear();
  render(state);
}

export function focusStageObject(stage, id) {
  states.get(stage)?.objects.get(id)?.group.focus();
}
