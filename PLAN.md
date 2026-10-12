# 實作計畫

規格見 `PRD.md`，開發規則見 `CLAUDE.md`。里程碑依序執行。

## 目前進度

- 最後完成：M1 元件庫全部完成（14 個元件；speech.js 也已提前完成）
- 下一步：M2 `src/lib/answer-check.js`

## M0 基礎

- [x] `src/styles/tokens.css`：色盤、字級、間距、像素邊框粗細、斷點（768px、1024px）
- [x] `src/styles/base.css`：reset、Google Fonts、body 背景（字體由 `main.css` 載入）
- [x] `index.html` 骨架：載入 `main.css` 與 `src/app.js`
- [x] `components.html` 展示頁骨架：每個元件一區，可切換 375 / 768 / 1440 寬度預覽
- [x] `docs/components.md` 骨架

## M1 元件庫

每個元件完成的定義：`.js` + `.css` 寫好、加進 `src/gallery/demos.js`、`docs/components.md` 補上用法、三種寬度檢查過。

- [x] 共用 helper `src/lib/dom.js`（`el()`、`highlightWords()`）
- [x] `pixel-frame`
- [x] `button`（primary / secondary / ghost，加上 iconOnly、block）
- [x] `speak-button`
- [x] `text-input`（default / almost / wrong / correct）
- [x] `feedback`
- [x] `sentence-list`
- [x] `dialogue`
- [x] `progress-badge`
- [x] `scene-card`
- [x] `panel`（三種斷點行為）
- [x] `modal`
- [x] `tag`（新增，原清單外）
- [x] `heading`（新增，原清單外）
- [x] `icon`（新增，原清單外）

## M2 邏輯

- [x] `src/lib/answer-check.js`：忽略大小寫、前後空白、開頭 a/an/the；接受同義詞；編輯距離 ≤ 1 回傳 almost
- [x] `answer-check` 測試（`tests/answer-check.test.js`，`npm test`）：`Fridge`、`a fridge`、`refrigerater` 都判定為答對 refrigerator
- [x] `src/lib/speech.js`：en-US 發音、偵測是否支援（M1 製作 speak-button 時提前完成）
- [x] `src/lib/progress.js`：localStorage 讀寫加 try/catch、reset；不能用 localStorage 時改存記憶體（`tests/progress.test.js`）

## M3 單一場景跑通（Office）

- [ ] `scenes/office.svg`：12–15 個 `<g data-object>` 物件
- [ ] `scenes/office.json`：每個物件 3 句 self-talk、1 段 4–6 句對話；至少 1 段場景對話
- [ ] `src/views/home.js`：場景卡片列表與進度
- [ ] `src/views/scene.js`：hover / tap 高亮 → 作答 → 揭曉 → 例句 → 發音
- [ ] 鍵盤操作：Tab 逐一聚焦物件、Enter 打開
- [ ] Scene talk 與 Scene complete
- [ ] 完整流程在三種寬度下跑一次

## M4 其餘場景

- [ ] Sidewalk（commute）：SVG + JSON
- [ ] Studio apartment：SVG + JSON

## M5 驗收與部署

- [ ] 逐條對照 `PRD.md` 第 9 節驗收標準
- [ ] 檢查 views 的 CSS 沒有定義元件外觀、沒有寫死顏色或數值
- [ ] Chrome、Safari（含 iPhone）測試發音
- [ ] 部署到 GitHub Pages
