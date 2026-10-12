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
| `button` | 完成 |
| `speak-button` | 完成 |
| `text-input` | 完成 |
| `feedback` | 完成 |
| `sentence-list` | 未開始 |
| `dialogue` | 未開始 |
| `progress-badge` | 未開始 |
| `scene-card` | 未開始 |
| `panel` | 未開始 |
| `modal` | 未開始 |
| `tag` | 完成 |
| `heading` | 完成 |
| `icon` | 完成 |

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

### icon

用途：像素圖示。點陣用字元寫在 `icon.js` 的 `ICONS` 裡，`#` 是實心格。顏色跟著 `currentColor`，大小是點陣尺寸乘以 `scale`，一定是整數倍，放大後不會糊。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| name | string | — | `speaker`、`close`、`star`、`check`、`play`、`stop`、`arrow-left`、`bulb`、`chat` |
| scale | number | `2` | 每個點陣格幾個 CSS px，用整數 |
| className | string | `""` | 額外 class |

範例：

    import { createIcon } from "../components/icon.js";
    button.append(createIcon("speaker"));

注意事項：SVG 一律加 `aria-hidden="true"`，文字說明由外層元件（例如 button 的 label）提供。新增圖示時在 `ICONS` 加一組點陣，並在本節的 name 清單補上。

### heading

用途：像素字體（Press Start 2P）標題。`level` 決定 HTML 標籤（語意層級），`size` 決定外觀大小，兩者分開設定，避免為了字級改錯標題層級。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 標題文字 |
| level | 1–4 | `2` | 輸出 `h1`–`h4` |
| size | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | `"md"` | 12 / 16 / 24 / 32px；`xl` 在 768px 以下是 24px |
| tone | `"default"` \| `"accent"` \| `"muted"` | `"default"` | 文字顏色 |
| className | string | `""` | 額外 class |

範例：

    import { createHeading } from "../components/heading.js";
    const title = createHeading({ text: "Say it to yourself", level: 3, size: "sm", tone: "accent" });

注意事項：一頁只用一個 `level: 1`。長單字（例如 `refrigerator`）在窄欄會在任意位置斷行，不會撐破版面。

### tag

用途：小標籤，可帶一個圖示。對話的說話者（A / B）、例句類型（Describe / Act / Feel）、`progress-badge` 都用它。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 標籤文字 |
| tone | `"default"` \| `"accent"` \| `"info"` \| `"success"` \| `"danger"` | `"default"` | 底色 |
| icon | string | — | `icon` 元件的圖示名稱 |
| className | string | `""` | 額外 class |
| attrs | object | — | 額外 HTML 屬性，例如 `aria-label` |

更新用的函式：`setTagTone(tag, tone)`、`setTagText(tag, text)`。

範例：

    import { createTag } from "../components/tag.js";
    const speaker = createTag({ text: "A", tone: "info" });

注意事項：tag 是純展示，不能點。要可以點的請用 `button`。

### button

用途：遊戲中所有按鈕。外框用 `.pixel-border`，底部有 8px 厚度，按下時往下移 4px。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| label | string | — | 必填。按鈕文字；`iconOnly` 時變成 `aria-label` 與 `title` |
| variant | `"primary"` \| `"secondary"` \| `"ghost"` | `"primary"` | primary 藍底；secondary 深灰底；ghost 無外框、黃字 |
| icon | string | — | `icon` 元件的圖示名稱，放在文字前 |
| iconOnly | boolean | `false` | 只顯示圖示，按鈕為 44×44 的正方形 |
| block | boolean | `false` | 撐滿父層寬度 |
| disabled | boolean | `false` | 停用 |
| type | `"button"` \| `"submit"` | `"button"` | 放在 form 裡當送出鈕時用 `"submit"` |
| onClick | function | — | 點擊事件 |
| className | string | `""` | 額外 class |
| attrs | object | `{}` | 額外 HTML 屬性，例如 `aria-pressed` |

更新用的函式：`setButtonLabel(button, label)`、`setButtonIcon(button, icon)`。

可覆寫的 CSS 變數：`--button-bg`、`--button-bg-hover`、`--button-fg`、`--button-border`、`--button-depth`。

範例：

    import { createButton } from "../components/button.js";
    const reveal = createButton({ label: "Reveal", variant: "secondary", onClick: showAnswer });
    const close = createButton({ label: "Close", variant: "ghost", icon: "close", iconOnly: true, onClick: closePanel });

注意事項：最小點擊範圍 44×44。非 ghost 的按鈕外側有 4px 外框與底部 8px 厚度，按鈕自帶外距，排版時不用另外留。

### speak-button

用途：發音按鈕，用瀏覽器內建的英文語音（en-US）唸出文字。建立在 `button` 上，唸的時候圖示會閃爍。瀏覽器不支援 Web Speech API 時，回傳的按鈕是 `hidden`，其他功能不受影響。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 要唸的文字 |
| label | string | `Play "<text>"` | 螢幕閱讀器讀的說明；`showLabel` 時也是按鈕文字 |
| voice | `0` \| `1` | `0` | 對話的 A / B 用不同聲音；只有一個英文聲音時 B 改用較高音調 |
| variant | 同 `button` | `"ghost"` | 外觀 |
| showLabel | boolean | `false` | 顯示文字，預設只顯示圖示 |
| className | string | `""` | 額外 class |

更新用的函式：`setSpeakText(button, text, label)`，讓同一顆按鈕改唸別的字。

範例：

    import { createSpeakButton } from "../components/speak-button.js";
    const listen = createSpeakButton({ text: object.word });

注意事項：發音邏輯在 `src/lib/speech.js`。iOS Safari 只允許在點擊事件裡直接發音，所以不要在 click 之後先 `await` 別的東西再呼叫 `speak()`。唸的時候 `aria-pressed="true"`。

### text-input

用途：作答輸入框。外框來自 `.pixel-border`，聚焦時框線變藍色（避開 almost 的黃色）；狀態改變框線顏色：almost 黃、wrong 橘（並搖晃）、correct 綠。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| label | string | `"What's this called?"` | 輸入框上方的標籤 |
| placeholder | string | `"Type the English word"` | 提示文字 |
| name | string | `"answer"` | input 的 name |
| value | string | `""` | 初始值 |
| hideLabel | boolean | `false` | 標籤只給螢幕閱讀器讀 |
| autofocus | boolean | `false` | 自動聚焦 |
| onSubmit | function(value) | — | 按 Enter 時呼叫；輸入法選字中的 Enter 不算 |
| className | string | `""` | 額外 class |

更新用的函式：

| 函式 | 說明 |
|---|---|
| `setTextInputState(input, state)` | `"default"` \| `"almost"` \| `"wrong"` \| `"correct"`；wrong 會重播搖晃動畫並設 `aria-invalid` |
| `getTextInputValue(input)` / `setTextInputValue(input, value)` | 讀寫內容 |
| `setTextInputReadOnly(input, readOnly)` | 揭曉後鎖住輸入框 |
| `focusTextInput(input)` | 聚焦 |

範例：

    import { createTextInput, setTextInputState } from "../components/text-input.js";
    const answer = createTextInput({ onSubmit: (value) => setTextInputState(answer, check(value)) });

注意事項：字級 20px，避免 iOS Safari 聚焦時自動放大畫面。關閉了自動大寫、自動修正、拼字檢查，避免瀏覽器幫使用者改答案。

### feedback

用途：作答結果訊息列，放在輸入框下方。是 `aria-live="polite"` 區域，要先建立一次、之後用 `setFeedback` 更新，螢幕閱讀器才會唸出變化。沒有訊息時不佔高度。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| tone | `"success"` \| `"almost"` \| `"error"` \| `"hint"` \| `"info"` | `"info"` | 顏色與圖示：綠勾、黃星、橘叉、青燈泡、灰色無圖示 |
| message | string | `""` | 主訊息，粗體 |
| detail | string | `""` | 補充說明，灰色 |
| className | string | `""` | 額外 class |

更新用的函式：`setFeedback(feedback, { tone, message, detail })`、`clearFeedback(feedback)`。

範例：

    import { createFeedback, setFeedback } from "../components/feedback.js";
    const result = createFeedback();
    setFeedback(result, { tone: "almost", message: "Almost!", detail: "It's spelled refrigerator." });

注意事項：error 用 `--color-danger-text`（橘色），不用 `--color-danger`，因為紅色在深色背景上對比不足。hint 的主訊息用等寬字（`--font-mono`）加字距，字母格 `s _ _ _ _ _ _` 才數得出幾個字母。
