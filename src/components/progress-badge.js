// progress-badge：「FOUND 4/15」加上一列進度格。
// 每格代表一個物件：已找到是青色、目前選取的是黃色、還沒找到是米灰色。

import { el } from "../lib/dom.js";

const CELL_STATES = ["found", "current", "empty"];

/** 沒有給 cells 時，依數量產生：前 found 格是 found，其餘 empty。 */
function cellsFromCount(found, total) {
  return Array.from({ length: total }, (_, i) => (i < found ? "found" : "empty"));
}

/**
 * createProgressBadge({ found: 4, total: 15 })
 * createProgressBadge({ found: 4, total: 15, cells: ["found", "empty", "current", ...] })  // 依物件順序
 */
export function createProgressBadge({ found = 0, total = 0, label = "Found", cells, showCells = true, className = "" } = {}) {
  const count = el("span", { className: "progress-badge__count" });
  const bar = showCells ? el("span", { className: "progress-badge__cells", attrs: { "aria-hidden": "true" } }) : null;
  const badge = el("span", { className: ["progress-badge", className].filter(Boolean).join(" "), dataset: { label } }, [
    el("span", { className: "progress-badge__label" }, [`${label} `, count]),
    bar,
  ]);
  setProgress(badge, { found, total, cells });
  return badge;
}

export function setProgress(badge, { found, total, cells }) {
  const label = badge.dataset.label || "Found";
  const count = badge.querySelector(".progress-badge__count");
  count.replaceChildren(el("span", { className: "progress-badge__number", text: String(found) }), `/${total}`);
  badge.classList.toggle("progress-badge--complete", total > 0 && found >= total);
  badge.setAttribute("title", `${label} ${found} of ${total}`);

  const bar = badge.querySelector(".progress-badge__cells");
  if (!bar) return;
  const states = (cells && cells.length === total ? cells : cellsFromCount(found, total)).map((state) =>
    CELL_STATES.includes(state) ? state : "empty",
  );
  bar.replaceChildren(...states.map((state) => el("span", { className: `progress-badge__cell progress-badge__cell--${state}` })));
}
