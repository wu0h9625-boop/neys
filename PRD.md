# PRD：Name It — 像素風場景命名練習

## Context

"Naming everything you see" 是一種自學英文的方法：看到身邊的東西，就在心裡說出它的英文名稱，再用這個字造句。這個遊戲把這套練習做成網頁：每個場景是一張像素風畫面，使用者點畫面上的物件，先自己打出英文名稱，再看答案、聽發音，接著讀和這個物件有關的對話範本與自言自語例句，拿來套用到真實生活。


---

## 1. 目標與非目標

**目標**
- 使用者在一個場景裡能練到「先自己想英文名稱 → 確認答案 → 聽發音 → 學會怎麼用」的完整循環。
- 手機、平板、桌機都能流暢操作。
- 純靜態網站，不需要後端，可以部署到 GitHub Pages / Vercel。

**非目標（第一版不做）**
- AI 即時生成內容、帳號登入、雲端同步進度。
- 語音辨識（讓使用者念出來再判斷）。
- 多語言介面。

## 2. 目標使用者

- 自學英文、想把英文帶進日常生活的人，程度約 B1–B2（**推測**，未經使用者確認）。
- 練習情境是一個人：通勤、上班、在家時自己默念。所以內容偏重「自己講給自己聽」的句子，對話範本次之。

## 3. 內容範圍

- 介面全英文。
- 第一版 3 個場景，每個場景 12–15 個可點物件（物件清單為草稿，製作時可增減）：

| 場景 | 物件範例 |
|---|---|
| Office | desk, monitor, keyboard, mouse, stapler, sticky note, whiteboard, printer, swivel chair, water dispenser, potted plant, mug, filing cabinet, headset |
| Sidewalk (commute) | crosswalk, traffic light, bus stop, curb, fire hydrant, manhole cover, streetlight, bike lane, trash can, scooter, umbrella, convenience store sign |
| Studio apartment | bed, wardrobe, mini fridge, rice cooker, induction cooktop, blinds, air conditioner, drying rack, laundry basket, power strip, desk lamp, door lock |

## 4. 核心流程

1. **選場景**：首頁顯示 3 張場景卡片，卡片上標示 `Found 4/14`。
2. **瀏覽場景**：
   - 桌機 hover、觸控裝置第一次 tap：物件出現像素外框，旁邊冒出「?」。不顯示單字。
   - 桌機 click、觸控裝置第二次 tap：打開該物件的作答面板。
3. **作答**：
   - 輸入框：`What's this called?`
   - 判定規則：
     - 忽略大小寫、前後空白、句尾標點、開頭的 a / an / the；空白與連字號視為相同（trash can = trashcan = trash-can）。
     - 接受主單字和同義詞清單（例：refrigerator / fridge）。
     - 和任一個正確答案只差 1 個字母（多、少、換一個，或相鄰兩個字母對調）視為「Almost!」，算答對，並顯示正確拼法。只適用 4 個字母以上的答案，因為 3 個字母的字差一個字母常常是另一個字（mug / bug）。
   - 答錯：顯示 `Not quite`，可以再試，或按 `Hint`（顯示首字母和字母數，例：`s _ _ _ _ _ _ (7)`）。
   - 隨時可按 `Reveal` 直接看答案。
4. **揭曉**：
   - 顯示單字、詞性、同義詞。
   - 🔊 按鈕播放發音（Web Speech API，en-US）。答對或按 Reveal 時自動念一次。
   - 物件記為「已發現」，頁首進度 +1。場景上平常不標示已發現；hover 或選取時，已發現的物件右上角是綠色 ✓，未發現的是黃色「?」。
5. **學怎麼用**（揭曉後同一面板往下）：
   - **Say it to yourself**：3 句自言自語例句，對應 naming 練習的三個層次：
     - 描述：`There's a stapler on the edge of my desk.`
     - 動作：`Let me staple these pages together.`
     - 感受或計畫：`I should get a new stapler; this one keeps jamming.`
   - **Mini dialogue**：一段 4–6 句、兩人一來一往的生活對話，用到這個單字。
   - 每一句旁邊都有 🔊 可單句播放。
6. **場景對話**：場景畫面角落有 `Scene talk` 按鈕，打開 1–2 段以整個場景為主題的對話（例：在辦公室跟同事借東西），不綁定單一物件。

## 5. 介面與視覺

- **像素風**：場景用 SVG 繪製，邏輯解析度 192×108（16:9），`shape-rendering: crispEdges`，以整數倍放大。每個物件是一個 `<g>` 群組，群組本身就是點擊熱區，不需另外標座標。
- **字體**：標題用像素字體 Press Start 2P；內文、按鈕、標籤用易讀的 Atkinson Hyperlegible，確保 14px 以上可讀。
- **色盤**：每個場景限制 16 色左右，配色像 GBA / SNES 時代。
- **面板樣式**：像 RPG 對話框，黑底白字加像素邊框。
- **RWD**：
  - ≥ 1024px：場景在左，作答面板固定在右側。
  - 768–1023px：場景滿寬，面板也是底部 bottom sheet，最高佔 50% 螢幕，直式平板上不會蓋到場景。（從右側滑出會蓋住場景右半邊，使用者看不到正在命名的物件。）
  - < 768px：場景滿寬（直式手機會有上下留白），面板是底部 bottom sheet，最高佔 70% 螢幕。
  - 按鈕等介面元件的觸控熱區最小 44×44 CSS px。場景物件的熱區最小 24×24 CSS px（WCAG 2.2 AA 最小目標尺寸）：手機寬度下整張場景只有約 343×193px，44px 會讓相鄰物件的熱區幾乎完全重疊。太小的物件（例：sticky note）自動擴大透明熱區，並隨畫面縮放重算。
- **無障礙**：物件可用 Tab 鍵逐一聚焦、Enter 打開；熱區 `aria-label` 只寫「Object 3 of 14」，避免直接念出答案。

## 6. 資料結構

`scenes/index.json` 列出要顯示的場景，順序就是首頁的順序：

```json
{ "scenes": ["office", "sidewalk", "studio"] }
```

每個場景一組 `<id>.json` + `<id>.svg`：

```json
{
  "id": "office",
  "title": "Office",
  "description": "Desks, screens and a lot of coffee.",
  "speakers": { "A": "You", "B": "Coworker" },
  "sceneDialogues": [{ "title": "First day at the office", "lines": [{ "speaker": "A", "text": "..." }] }],
  "objects": [{
    "id": "stapler",
    "word": "stapler",
    "pos": "noun",
    "accept": ["stapler"],
    "highlight": ["staple"],
    "selfTalk": [
      { "tag": "Describe", "text": "..." },
      { "tag": "Act", "text": "..." },
      { "tag": "Feel", "text": "..." }
    ],
    "dialogue": [{ "speaker": "A", "text": "..." }]
  }]
}
```

| 欄位 | 說明 |
|---|---|
| `speakers` | 對話說話者的顯示名稱，場景內所有對話共用 |
| `accept` | 所有算答對的寫法，必須包含 `word` 本身 |
| `highlight` | 選填。例句裡要標色、但不算答案的字形，例如 stapler 的 staple |
| `selfTalk` | 3 句，依序是描述（Describe）、動作（Act）、感受或計畫（Feel） |
| `dialogue` | 4–6 句，至少一句用到這個單字 |

SVG 裡的 `<g data-object="stapler">` 對應 JSON 的 `objects[].id`，兩邊的順序要相同（決定鍵盤 Tab 順序與「Object 3 of 15」的編號）。以上規則由 `npm test` 自動檢查（`tests/scenes.test.js`）。

## 7. 進度保存

- `localStorage` 存每個場景已發現的物件 id，讀寫都包 try/catch，讀不到就當作新玩家。
- 場景頁有 `Reset progress`。
- 全部發現時顯示像素風的 `Scene complete!` 畫面。

## 8. 技術

- 純 HTML / CSS / JS，不需要 build。檔案結構：
  - `index.html`、`style.css`、`app.js`
  - `scenes/office.json`、`scenes/sidewalk.json`、`scenes/studio.json`
  - `scenes/office.svg`（以此類推）
- 用 `fetch` 載入 JSON，所以本機要用簡易伺服器開（例：`python3 -m http.server`），不能直接雙擊打開。
- 瀏覽器不支援 Web Speech API 時隱藏 🔊 按鈕，其他功能正常。
- 部署：GitHub Pages（推 repo 後開啟 Pages），或 Vercel 匯入同一個 repo。

## 9. 驗收標準

- 3 個場景、每個場景 ≥ 12 個物件都能點擊、作答、揭曉。
- 判定：`Fridge`、`a fridge`、`refrigerater`（拼錯 1 字）都判定為答對 refrigerator。
- 每個物件都有 3 句 self-talk 和 1 段 4–6 句對話；每個場景有 ≥ 1 段場景對話。
- 在 iPhone Safari 375px、iPad 768px、桌機 1440px 寬度都能完成整個流程，沒有水平捲動。
- 重新整理頁面後進度還在。
- Chrome、Safari 都能播放發音。

## 10. 待決事項

- 使用者程度（目前假設 B1–B2）。
- 是否要「場景計時挑戰」或「隨機出題」作為第二版功能。
- 例句是否需要中文翻譯開關（目前全英文）。

