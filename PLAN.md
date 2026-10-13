# 實作計畫

規格見 `PRD.md`，開發規則見 `CLAUDE.md`。里程碑依序執行。

## 目前進度

- 最後完成：M4 Sidewalk 場景（12 個物件，`npm test` 42 項通過）
- 下一步：M4 Studio apartment
- 暫緩：M3.5 其餘項目（收集試玩意見、抽查 IPA、改完重新驗證），使用者決定先做 M4。抽查 IPA 時發現 office 的 potted plant、swivel chair、filing cabinet 重音可能標錯，待使用者查字典確認

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
- [x] `scene-stage`（新增，原清單外）
- [x] `text`（新增，原清單外）
- [x] `tag`（新增，原清單外）
- [x] `heading`（新增，原清單外）
- [x] `icon`（新增，原清單外）

## M2 邏輯

- [x] `src/lib/answer-check.js`：忽略大小寫、前後空白、開頭 a/an/the；接受同義詞；編輯距離 ≤ 1 回傳 almost
- [x] `answer-check` 測試（`tests/answer-check.test.js`，`npm test`）：`Fridge`、`a fridge`、`refrigerater` 都判定為答對 refrigerator
- [x] `src/lib/speech.js`：en-US 發音、偵測是否支援（M1 製作 speak-button 時提前完成）
- [x] `src/lib/progress.js`：localStorage 讀寫加 try/catch、reset；不能用 localStorage 時改存記憶體（`tests/progress.test.js`）

## M3 單一場景跑通（Office）

- [x] `scenes/office.svg`：15 個 `<g data-object>` 物件（PRD 的 14 個加上 window）
- [x] `scenes/office.json`：每個物件 3 句 self-talk、1 段 4–6 句對話；至少 1 段場景對話
- [x] `src/views/home.js`：場景卡片列表與進度（含 hash 路由 `src/app.js` 與錯誤頁 `src/views/error.js`）
- [x] `src/views/scene.js`：hover / tap 高亮 → 作答 → 揭曉 → 例句 → 發音
- [x] 鍵盤操作：Tab 逐一聚焦物件、Enter 打開（在 scene-stage 元件內）
- [x] Scene talk 與 Scene complete（另加 Reset progress 確認框）
- [x] 完整流程在三種寬度下跑一次（375 / 768 / 1440）

## M3.5 Office 調整（M4 之前）

- [ ] 收集使用者試玩意見（頁面介面與版面、例句與對話內容）
- [x] 頁面介面與版面調整
  - [x] 套用 Claude Design 的 Office 視覺提案（`docs/design/design_handoff_office_scene/`）：淺色米白主題、Silkscreen、2px 平面框線、黃色單字卡、15 格進度條、聊天泡泡對話、步驟標籤；新增 card / word-card / divider 元件
  - [x] 每個物件加 IPA 美式音標（`ipa` 欄位，`npm test` 檢查格式）
  - [x] 使用者確認設計稿沒畫、依同一套 tokens 延伸的部分：作答狀態、面板空狀態、modal、首頁、手機 bottom sheet
- [ ] 例句與對話內容調整
  - [x] 例句與對話提高到 B1–B2：用關係子句、條件句、現在完成式、片語動詞、因果連接詞，避免只有單一短句
  - [x] 每個物件加「文字畫面」（Word picture）關聯詞：外觀、動作、相關的東西，揭曉面板顯示（新欄位 `wordPicture`，沿用 sentence-list 元件，`npm test` 檢查）
- [ ] 改完重新驗證：`npm test` 通過，375 / 768 / 1440 三種寬度跑過完整流程

## M4 其餘場景

- [x] Sidewalk（commute）：SVG + JSON（12 個物件；說話者 You / Neighbor）
- [ ] Studio apartment：SVG + JSON

## M5 驗收與部署

- [ ] 逐條對照 `PRD.md` 第 9 節驗收標準
- [ ] 檢查 views 的 CSS 沒有定義元件外觀、沒有寫死顏色或數值
- [ ] Chrome、Safari（含 iPhone）測試發音
- [ ] 部署到 GitHub Pages
