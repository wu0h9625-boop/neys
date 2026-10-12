# Name It

這是像素風的英文練習網頁，練習方法是 "Naming everything you see"。使用者在場景中點物件，先自己輸入英文名稱，再揭曉答案、聽發音，然後看例句和對話範本。

- 規格：`PRD.md`
- 實作進度與下一步：`PLAN.md`（開始工作前先讀「目前進度」一節）

## 技術限制

- 純 HTML / CSS / JS，使用 ES modules，不需要 build，不引入框架。
- 本機預覽要開伺服器，因為 `fetch` 和 ES modules 不能用雙擊開檔的方式執行：`python3 -m http.server 8000`
- 外部資源只用 Google Fonts（Press Start 2P、Pixelify Sans）。其他資源都放在 repo 內。
- 部署目標：GitHub Pages，所以路徑一律用相對路徑。

## 資料夾

```
src/components/   元件庫，每個元件一組 <name>.js + <name>.css
src/views/        頁面，只負責組裝元件和排版
src/lib/          純邏輯，不碰 DOM：答案判定、發音、進度保存
src/styles/       tokens.css（設計變數）、base.css（reset 與全域字體）
scenes/           每個場景一組 <id>.json + <id>.svg
docs/             components.md（元件用法）
components.html   元件展示頁，列出所有元件的所有 variant
index.html        遊戲入口
```

## 元件庫規則

按鈕、對話框、面板這類 UI 只能在元件庫寫一次，所有頁面都從元件庫取用。

- 寫任何 UI 之前，先看 `src/components/` 有沒有可用的元件。有就直接用；功能不夠就在原元件加 variant 或參數，不要另外寫一份。
- 同一個樣式或行為出現第二次，就要抽成元件，並把第一次出現的地方一起改成用元件。
- 每個元件是 `src/components/<name>.js` 加 `src/components/<name>.css`。
  - `.js` 匯出一個工廠函式，命名為 `create<Name>`，例如 `createButton({ label, variant, onClick })`，回傳 DOM 元素。
  - CSS class 用元件名稱當前綴，例如 `.button`、`.button--primary`，避免跟其他元件撞名。
- `src/views/*.css` 只能寫版面排列（grid、flex、間距、斷點）。按鈕、框線、字色、陰影這類外觀只能寫在元件 CSS。
- 顏色、字級、間距、像素邊框粗細、斷點一律用 `src/styles/tokens.css` 的 CSS 變數，不寫死數值。
- 新增或修改元件時，同一次修改內要更新 `components.html` 展示頁，並在 `docs/components.md` 補上參數和用法。

### 元件清單

| 元件 | 用途 |
|---|---|
| `button` | primary / secondary / ghost / icon-only 四種 variant。Reveal、Hint、Scene talk、Reset 等所有按鈕都用它 |
| `pixel-frame` | RPG 風格黑底像素邊框，所有面板和卡片的外框都用它 |
| `panel` | 響應式容器：≥ 1024px 固定在右側、768–1023px 從右側滑出、< 768px 為 bottom sheet（最高 70% 螢幕） |
| `modal` | 場景對話、Scene complete 畫面 |
| `text-input` | 作答輸入框，有 default / almost / wrong / correct 狀態 |
| `speak-button` | 🔊 發音按鈕，瀏覽器不支援 Web Speech API 時自動隱藏 |
| `dialogue` | A/B 兩人對話列表，每句帶 speak-button |
| `sentence-list` | self-talk 例句列表，每句帶 speak-button |
| `progress-badge` | `Found 4/14` 計數 |
| `scene-card` | 首頁場景卡片 |
| `feedback` | 答對、答錯、提示的訊息列 |

清單以外的新元件，先確認現有元件加 variant 做不到，再新增並補進這張表。

## 內容規則

- `scenes/*.json` 的欄位以 `PRD.md` 第 6 節為準。
- SVG 中每個可點物件是一個 `<g data-object="<id>">`，`id` 對應 JSON 的 `objects[].id`。
- SVG 邏輯解析度 192×108，加 `shape-rendering="crispEdges"`。
- 物件熱區的 `aria-label` 只寫 `Object 3 of 14`，不能寫出答案。

## 工作習慣

- 每完成 `PLAN.md` 的一個項目就打勾，並更新「目前進度」。
- 每完成 `PLAN.md` 的一個項目就 commit 一次，`PLAN.md` 的勾選要包含在同一個 commit 裡。commit 訊息用英文祈使句，開頭寫里程碑，例如 `M1: add button component`。
- 一個 commit 只放一個項目。做到一半發現要改別的元件，先 commit 目前的項目，再另外 commit。
- 每個元件做完後，在 375px、768px、1440px 三種寬度下檢查展示頁。
