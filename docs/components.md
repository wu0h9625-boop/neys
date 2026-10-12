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
| `sentence-list` | 完成 |
| `dialogue` | 完成 |
| `progress-badge` | 完成 |
| `scene-card` | 完成 |
| `panel` | 完成 |
| `modal` | 完成 |
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

注意事項：外框畫在元素外側 4px，不佔版面。`.pixel-frame` 自帶 4px 外距；單獨使用 `.pixel-border` 的元素要自己留外距。上表的變數都用 `@property` 設為不繼承，只對設定它的元素本身有效；要改某個外框，就在那個元素上設定，不能設在祖先元素上。

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

### sentence-list

用途：self-talk 例句列表。每句一列，右邊有發音按鈕；句子裡的目標單字會標成黃色粗體（含 -s / -es / -ed / -ing 變化）。可在句子上方加類型標籤（Describe / Act / Feel）。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | `"Say it to yourself"` | 標題，空字串則不顯示 |
| sentences | `(string \| { text, tag })[]` | `[]` | 例句；`tag` 會顯示成 `tag` 元件 |
| highlight | string[] | `[]` | 要標色的單字 |
| headingLevel | 1–4 | `3` | 標題的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createSentenceList } from "../components/sentence-list.js";
    const selfTalk = createSentenceList({ sentences: object.selfTalk, highlight: object.accept });

注意事項：例句字級 20px，方便跟著唸。標色用全域的 `mark` 樣式（`base.css`），由 `src/lib/dom.js` 的 `highlightWords()` 產生。

### dialogue

用途：兩人一來一往的對話。每句左邊是說話者標籤（第一位青色、第二位黃色），右邊是發音按鈕。標題旁的 Play all 會用兩種聲音連續唸完，唸到哪句就標底色，播放中按鈕變成 Stop。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | `"Mini dialogue"` | 標題，空字串則不顯示 |
| lines | `{ speaker, text }[]` | `[]` | 對話內容；speaker 通常是 `"A"`、`"B"` |
| speakers | object | `{}` | 說話者顯示名稱，例如 `{ A: "You", B: "Coworker" }`；沒給就顯示代號 |
| highlight | string[] | `[]` | 要標色的單字 |
| headingLevel | 1–4 | `3` | 標題的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createDialogue } from "../components/dialogue.js";
    const talk = createDialogue({ lines: object.dialogue, highlight: object.accept });

注意事項：聲音與顏色依說話者第一次出現的順序分配。Play all 用 `speakSequence()` 在同一次點擊裡把所有句子排進佇列，iOS Safari 才不會擋。三欄用 `subgrid` 對齊，說話者名稱長短不同時文字仍然對齊。瀏覽器不支援發音時 Play all 隱藏。

### progress-badge

用途：場景的進度計數「★ Found 4/14」。建立在 `tag` 上，全部找到時變綠色。數字用等寬數字，變動時寬度不跳。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| found | number | `0` | 已發現數 |
| total | number | `0` | 總數 |
| label | string | `"Found"` | 數字前的文字 |
| className | string | `""` | 額外 class |

更新用的函式：`setProgress(badge, { found, total })`。

範例：

    import { createProgressBadge, setProgress } from "../components/progress-badge.js";
    const progress = createProgressBadge({ found: 4, total: 14 });
    setProgress(progress, { found: 5, total: 14 });

注意事項：純展示。要讓螢幕閱讀器知道進度變化，把它放在有 `aria-live` 的區域，或在 `feedback` 裡另外說明。

### scene-card

用途：首頁的場景卡片。整張卡是一個 `<a>`，內含 16:9 縮圖、標題、說明、`progress-badge`。外框用 `pixel-frame`（muted），hover 或鍵盤聚焦時框線變黃色並往上浮 4px。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | — | 場景名稱 |
| description | string | `""` | 一句說明 |
| href | string | `"#"` | 連結，例如 `"#/scene/office"` |
| thumbnail | Element | — | 縮圖（SVG 或 img）；省略時顯示棋盤格 |
| found / total | number | `0` | 進度 |
| headingLevel | 1–4 | `2` | 標題的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createSceneCard } from "../components/scene-card.js";
    const card = createSceneCard({ title: "Office", href: "#/scene/office", thumbnail: officeSvg, found: 4, total: 14 });

注意事項：卡片寬度由外層排版決定（例如首頁的 grid），卡片本身會撐滿。整張卡片只有一個連結，裡面不要再放按鈕。

### panel

用途：場景頁的作答面板。同一個元件依寬度變成三種形態，全部由 CSS 處理：

| 寬度 | 形態 | 關閉時 |
|---|---|---|
| < 768px | bottom sheet，貼齊底部，最高 70% 螢幕，上方仍看得到場景 | 移到畫面下方並隱藏 |
| 768–1023px | 從右側滑出，寬 400px | 移到畫面右側並隱藏 |
| ≥ 1024px | 固定在場景右側（sticky），一直顯示，沒有關閉鈕 | 不變 |

面板不是 modal，開著時仍可點場景裡的其他物件，換內容用 `setPanelContent`。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | `""` | 標題，同時是面板的 `aria-labelledby` |
| children | Node[] | `[]` | 內容，放在可捲動的 body |
| open | boolean | `false` | 初始是否打開 |
| onClose | function | — | 使用者按關閉鈕或 Esc 時呼叫 |
| className | string | `""` | 額外 class |

控制用的函式：

| 函式 | 說明 |
|---|---|
| `openPanel(panel, { focus })` | 打開，預設把焦點移到面板 |
| `closePanel(panel)` | 關閉並呼叫 `onClose` |
| `isPanelOpen(panel)` | 是否打開 |
| `setPanelContent(panel, { title, children })` | 換標題或內容，內容會捲回頂端 |

可覆寫的 CSS 變數：`--panel-sheet-max-height`（手機最高，預設 70vh）、`--panel-desktop-max-height`（桌機最高，預設螢幕高度扣上下 16px）。

範例：

    import { createPanel, openPanel, setPanelContent } from "../components/panel.js";
    const panel = createPanel({ title: "Object 3 of 14", children: [answerInput, feedback] });
    sceneLayout.append(sceneElement, panel);
    setPanelContent(panel, { title: "Object 4 of 14", children: [...] });
    openPanel(panel);

注意事項：桌機版是 sticky，外層排版要把面板放在場景旁邊的欄位（例如 `grid-template-columns: 1fr auto`）。手機版底部有 safe-area 內距，避開 iPhone 的 Home 條。

### modal

用途：蓋住整個畫面的對話框，用在 Scene talk 與 Scene complete。用原生 `<dialog>` 的 `showModal()`：焦點鎖在對話框內、Esc 關閉、背景不能操作，都是瀏覽器內建。外框是 `pixel-frame` 的 accent（黃框）。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | — | 標題，同時是 `aria-labelledby` |
| children | Node[] | `[]` | 內容，超過螢幕高度時在框內捲動 |
| actions | Node[] | `[]` | 底部按鈕列，靠右排列 |
| size | `"sm"` \| `"md"` \| `"lg"` | `"md"` | 最大寬度 400 / 560 / 720px；手機上一律是螢幕寬扣兩側 16px |
| dismissible | boolean | `true` | `false` 時沒有關閉鈕，Esc 與點背景都不會關，只能按 actions 裡的按鈕 |
| onClose | function | — | 對話框關閉時呼叫（任何方式） |
| className | string | `""` | 額外 class |

控制用的函式：`openModal(modal)`（還沒放進頁面時會自動加到 `body`）、`closeModal(modal)`。

範例：

    import { createModal, openModal, closeModal } from "../components/modal.js";
    const done = createModal({
      title: "Scene complete!",
      size: "sm",
      dismissible: false,
      children: [message],
      actions: [createButton({ label: "Next scene", onClick: () => closeModal(done) })],
    });
    openModal(done);

注意事項：同一個 modal 建立一次、重複打開，不要每次都 `createModal`，否則頁面上會累積多個 `<dialog>`。
