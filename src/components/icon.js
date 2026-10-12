// icon：像素圖示。每個圖示用字元畫出點陣，"#" 是實心格，其他字元是空格。
// 輸出的 SVG 用 currentColor 上色，大小是點陣尺寸的整數倍，放大後不會糊。

const SVG_NS = "http://www.w3.org/2000/svg";

const ICONS = {
  speaker: [
    "...#.....",
    "..##...#.",
    "####....#",
    "####.#..#",
    "####.#..#",
    "####....#",
    "..##...#.",
    "...#.....",
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
    "##......",
    "####....",
    "######..",
    "########",
    "######..",
    "####....",
    "##......",
    "........",
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
    "...#....",
    "..##....",
    ".#######",
    "########",
    ".#######",
    "..##....",
    "...#....",
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
 * scale：每個點陣格幾個 CSS px，預設 2（8×8 的圖示顯示為 16×16）。
 */
export function createIcon(name, { scale = 2, className = "" } = {}) {
  const rows = ICONS[name];
  if (!rows) throw new Error(`Unknown icon: ${name}`);

  const width = Math.max(...rows.map((row) => row.length));
  const height = rows.length;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width * scale));
  svg.setAttribute("height", String(height * scale));
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
