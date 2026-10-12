// icon：像素圖示。每個圖示用字元畫出點陣，"#" 是實心格，其他字元是空格。
// 輸出的 SVG 用 currentColor 上色，大小是點陣尺寸的整數倍，放大後不會糊。

const SVG_NS = "http://www.w3.org/2000/svg";

const ICONS = {
  speaker: [
    "................",
    "................",
    "................",
    "......##........",
    "......##....##..",
    "....####..####..",
    ".#######..##.##.",
    ".#######.....##.",
    ".#######.....##.",
    ".#######..##.##.",
    "....####..####..",
    "......##....##..",
    "......##........",
    "................",
    "................",
    "................",
  ],
  close: [
    "##....##",
    "###..###",
    ".######.",
    "..####..",
    "..####..",
    ".######.",
    "###..###",
    "##....##",
  ],
  star: [
    "....#....",
    "....#....",
    "...###...",
    "#########",
    ".#######.",
    "..#####..",
    "..##.##..",
    ".##...##.",
    ".#.....#.",
  ],
  check: [
    ".......#",
    "......##",
    ".....##.",
    "#...##..",
    "##.##...",
    ".###....",
    "..#.....",
    "........",
  ],
  play: [
    "##....",
    "####..",
    "######",
    "######",
    "####..",
    "##....",
  ],
  stop: [
    "........",
    ".######.",
    ".######.",
    ".######.",
    ".######.",
    ".######.",
    ".######.",
    "........",
  ],
  "arrow-left": [
    "........",
    "..#.....",
    ".##.....",
    "########",
    "########",
    ".##.....",
    "..#.....",
    "........",
  ],
  bulb: [
    "..###..",
    ".#####.",
    "#######",
    "#######",
    ".#####.",
    "..###..",
    ".......",
    "..###..",
    "..###..",
  ],
  chat: [
    "#########",
    "#########",
    "##.....##",
    "#########",
    "##...####",
    "#########",
    ".##......",
    "##.......",
  ],
};

export const ICON_NAMES = Object.keys(ICONS);

// 點陣比較細的圖示預設用 1 倍（16 格的喇叭 = 16px），其他預設 2 倍（8 格 = 16px）
const DEFAULT_SCALE = { speaker: 1 };

/** 把每一列連續的實心格合併成一個 rect，減少節點數。 */
function toRects(rows) {
  const rects = [];
  rows.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x += 1) {
      const filled = row[x] === "#";
      if (filled && start < 0) start = x;
      if (!filled && start >= 0) {
        rects.push({ x: start, y, w: x - start });
        start = -1;
      }
    }
  });
  return rects;
}

/**
 * createIcon("speaker", { scale: 2 })
 * scale：每個點陣格幾個 CSS px，預設 2（8×8 的圖示顯示為 16×16）；speaker 預設 1。
 * size：直接指定寬度（px），高度依比例；設計稿指定非整數倍尺寸時用（例如 16 格的喇叭顯示成 22px）。
 * 喇叭、返回箭頭、播放三個圖示的點陣來自 Claude Design 的 Office 視覺提案。
 */
export function createIcon(name, { scale, size, className = "" } = {}) {
  const rows = ICONS[name];
  if (!rows) throw new Error(`Unknown icon: ${name}`);

  const width = Math.max(...rows.map((row) => row.length));
  const height = rows.length;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const px = size ? size / width : scale ?? DEFAULT_SCALE[name] ?? 2;
  svg.setAttribute("width", String(width * px));
  svg.setAttribute("height", String(height * px));
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", ["icon", `icon--${name}`, className].filter(Boolean).join(" "));

  for (const { x, y, w } of toRects(rows)) {
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(w));
    rect.setAttribute("height", "1");
    svg.append(rect);
  }
  return svg;
}
