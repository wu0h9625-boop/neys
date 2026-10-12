// progress-badge：「★ Found 4/14」進度計數。建立在 tag 上，全部找到時變綠色。

import { createTag, setTagText, setTagTone } from "./tag.js";

function text(label, found, total) {
  return `${label} ${found}/${total}`;
}

export function createProgressBadge({ found = 0, total = 0, label = "Found", className = "" } = {}) {
  const badge = createTag({
    text: text(label, found, total),
    icon: "star",
    className: ["progress-badge", className].filter(Boolean).join(" "),
  });
  badge.dataset.label = label;
  setProgress(badge, { found, total });
  return badge;
}

export function setProgress(badge, { found, total }) {
  const label = badge.dataset.label || "Found";
  const complete = total > 0 && found >= total;
  setTagText(badge, text(label, found, total));
  setTagTone(badge, complete ? "success" : "default");
  badge.classList.toggle("progress-badge--complete", complete);
}
