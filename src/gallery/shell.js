// components.html 外框：切換 iframe 寬度，並讓 iframe 高度跟著內容走。

const STORAGE_KEY = "nameit.gallery.width";

const select = document.getElementById("gallery-width");
const frame = document.getElementById("gallery-frame");
const sizeLabel = document.getElementById("gallery-size");

function readSavedWidth() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveWidth(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 無法存取 localStorage 時只是不記住選擇，不影響預覽
  }
}

function applyWidth(value) {
  frame.style.width = value === "fill" ? "100%" : `${value}px`;
  updateSizeLabel();
}

function updateSizeLabel() {
  sizeLabel.textContent = `${Math.round(frame.getBoundingClientRect().width)}px`;
}

function fitHeight() {
  const doc = frame.contentDocument;
  if (!doc) return;
  frame.style.height = `${doc.documentElement.scrollHeight}px`;
}

frame.addEventListener("load", () => {
  const doc = frame.contentDocument;
  if (!doc) return;
  new ResizeObserver(fitHeight).observe(doc.body);
  fitHeight();
});

select.addEventListener("change", () => {
  applyWidth(select.value);
  saveWidth(select.value);
});

window.addEventListener("resize", updateSizeLabel);

const saved = readSavedWidth();
if (saved && [...select.options].some((option) => option.value === saved)) {
  select.value = saved;
}
applyWidth(select.value);
