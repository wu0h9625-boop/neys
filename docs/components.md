# 元件庫

遊戲裡所有按鈕、面板、對話框、輸入框都來自這份元件庫，頁面不另外寫外觀。開發規則見根目錄 `CLAUDE.md`。

- 預覽：本機執行 `python3 -m http.server 8000`，打開 `http://localhost:8000/components.html`，可切換 375 / 768 / 1024 / 1440 寬度。
- 設計變數：`src/styles/tokens.css`

## 新增一個元件

1. 建立 `src/components/<name>.js`，匯出工廠函式 `create<Name>(options)`，回傳 DOM 元素。
2. 建立 `src/components/<name>.css`，class 以元件名稱為前綴（`.<name>`、`.<name>--<variant>`、`.<name>__<part>`）。數值一律用 tokens。
3. 在 `src/styles/main.css` 的 Components 區塊加一行 `@import`，依字母排序。
4. 在 `src/gallery/demos.js` 加一筆展示，每個 variant 和狀態各一個。
5. 在本文件「元件說明」加一節，照下面的範本寫。
6. 在 375、768、1440 三種寬度檢查展示頁。

## 元件狀態

| 元件 | 狀態 |
|---|---|
| `pixel-frame` | 完成 |
| `button` | 未開始 |
| `speak-button` | 未開始 |
| `text-input` | 未開始 |
| `feedback` | 未開始 |
| `sentence-list` | 未開始 |
| `dialogue` | 未開始 |
| `progress-badge` | 未開始 |
| `scene-card` | 未開始 |
| `panel` | 未開始 |
| `modal` | 未開始 |

## 元件說明

每個元件一節，格式如下：

```md
### button

用途：一句話說明。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| label | string | — | 按鈕文字 |
| variant | "primary" \| "secondary" \| "ghost" \| "icon" | "primary" | 外觀 |

範例：
    import { createButton } from "../components/button.js";
    const reveal = createButton({ label: "Reveal", variant: "secondary", onClick: showAnswer });

注意事項：無障礙、觸控熱區、相依的其他元件。
```

### pixel-frame

用途：RPG 風格的缺角像素外框容器。面板、卡片、對話框的外框都用它。同一支 CSS 也提供 `.pixel-border`，給只需要外框線的元件（按鈕、輸入框）。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| children | Node \| string \| array | `[]` | 內容 |
| variant | `"default"` \| `"muted"` \| `"accent"` \| `"raised"` | `"default"` | 底色與框線顏色 |
| padding | `"none"` \| `"sm"` \| `"md"` \| `"lg"` | `"md"` | 內距 0 / 8 / 16 / 24px |
| tag | string | `"div"` | 外層 HTML 標籤，例如 `"section"`、`"article"` |
| className | string | `""` | 額外 class |
| attrs | object | — | 額外 HTML 屬性 |

可覆寫的 CSS 變數：

| 變數 | 用在 | 說明 |
|---|---|---|
| `--frame-bg` | `.pixel-frame` | 底色 |
| `--frame-border` | `.pixel-frame` | 框線顏色 |
| `--frame-padding` | `.pixel-frame` | 內距 |
| `--frame-margin` | `.pixel-frame` | 外距，預設 4px，替外框留位置 |
| `--pixel-border-color` | `.pixel-border` | 框線顏色 |
| `--pixel-border-extra` | `.pixel-border` | 額外疊一層 box-shadow，例如按鈕的底部厚度 |

範例：

    import { createPixelFrame } from "../components/pixel-frame.js";
    const box = createPixelFrame({ variant: "accent", children: [title, body] });

注意事項：外框畫在元素外側 4px，不佔版面。`.pixel-frame` 自帶 4px 外距；單獨使用 `.pixel-border` 的元素要自己留外距。
