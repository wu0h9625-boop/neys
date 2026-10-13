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
| `divider` | 完成 |
| `word-card` | 完成 |
| `card` | 完成 |
| `scene-stage` | 完成 |
| `text` | 完成 |
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

用途：框線容器。面板、卡片、對話框的框線都來自它。同一支 CSS 也提供 `.pixel-border`，給只需要框線的元件（按鈕、輸入框）。外觀是 2px 平面實線，沒有陰影、沒有圓角；框線用 inset box-shadow 畫在元素內側，不影響尺寸。（名稱沿用早期的像素缺角框。）

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| children | Node \| string \| array | `[]` | 內容 |
| variant | `"default"` \| `"muted"` \| `"accent"` \| `"raised"` | `"default"` | default：米白底、`#e3d8c0` 框；muted：米白底、`#ebe1cc` 框；accent：黃框；raised：白底、`#ebe1cc` 框（卡片） |
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
| `--frame-margin` | `.pixel-frame` | 外距，預設 0 |
| `--pixel-border-color` | `.pixel-border` | 框線顏色 |

範例：

    import { createPixelFrame } from "../components/pixel-frame.js";
    const box = createPixelFrame({ variant: "raised", children: [title, body] });

注意事項：上表的變數都用 `@property` 設為不繼承，只對設定它的元素本身有效；要改某個框線，就在那個元素上設定，不能設在祖先元素上。

### icon

用途：像素圖示。點陣用字元寫在 `icon.js` 的 `ICONS` 裡，`#` 是實心格。顏色跟著 `currentColor`。喇叭（speaker）、返回箭頭（arrow-left）、播放（play）的點陣來自 Claude Design 的視覺提案。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| name | string | — | `speaker`、`close`、`star`、`check`、`play`、`stop`、`arrow-left`、`bulb`、`chat` |
| scale | number | `2`（speaker 是 `1`） | 每個點陣格幾個 CSS px。speaker 是 16 格，1 倍就是 16px |
| size | number | — | 直接指定寬度（px），設計稿指定非整數倍時用，例如單字卡的 22px 喇叭 |
| className | string | `""` | 額外 class |

範例：

    import { createIcon } from "../components/icon.js";
    button.append(createIcon("speaker"));
    hero.append(createIcon("speaker", { size: 22 }));

注意事項：SVG 一律加 `aria-hidden="true"`，文字說明由外層元件（例如 button 的 label）提供。新增圖示時在 `ICONS` 加一組點陣，並在本節的 name 清單補上；點陣比較細的圖示可在 `DEFAULT_SCALE` 指定預設倍數。

### heading

用途：Silkscreen 像素字標題。`level` 決定 HTML 標籤（語意層級），`size` 決定外觀大小，兩者分開設定。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 標題文字 |
| level | 1–4 | `2` | 輸出 `h1`–`h4` |
| size | `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | `"md"` | sm 13px（卡片標題）、md 16px、lg 24px 粗體、xl 32px 粗體（頁面標題；768px 以下 24px） |
| tone | `"default"` \| `"accent"` \| `"muted"` | `"default"` | 深色、橘色、灰色 |
| className | string | `""` | 額外 class |

範例：

    import { createHeading } from "../components/heading.js";
    const title = createHeading({ text: "Office", level: 1, size: "xl" });

注意事項：一頁只用一個 `level: 1`。單字卡上的單字不是用這個元件，而是 `word-card` 裡的 Atkinson Hyperlegible 粗體。

### tag

用途：小標籤。三種 `kind`：

| kind | 外觀 | 用在 |
|---|---|---|
| `chip` | 一般字體，底色 + 字色 | Also OK 的替代答案 |
| `pixel` | Silkscreen 12px 小方塊 | 場景下方的步驟「1 Tap」 |
| `label` | Silkscreen 文字，沒有底色 | 例句類型 Describe、對話說話者 |

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 標籤文字 |
| kind | `"chip"` \| `"pixel"` \| `"label"` | `"chip"` | 樣式 |
| tone | `"default"` \| `"ink"` \| `"ink-accent"` \| `"accent"` \| `"teal"` \| `"orange"` \| `"success"` \| `"danger"` | `"default"` | chip / pixel 決定底色與字色；label 只決定字色（teal 青、orange 橘） |
| icon | string | — | `icon` 元件的圖示名稱 |
| className | string | `""` | 額外 class |
| attrs | object | — | 額外 HTML 屬性 |

更新用的函式：`setTagTone(tag, tone)`、`setTagText(tag, text)`。

範例：

    import { createTag } from "../components/tag.js";
    const alt = createTag({ text: "water cooler", tone: "ink-accent" });
    const step = createTag({ text: "1 Tap", kind: "pixel", tone: "ink" });
    const type = createTag({ text: "Describe", kind: "label", tone: "teal" });

注意事項：tag 是純展示，不能點。要可以點的請用 `button`。label 的字級可用 `--tag-size` 覆寫（對話說話者是 10px）。

### button

用途：遊戲中所有按鈕。平面樣式，沒有陰影、沒有圓角、沒有按下位移。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| label | string | — | 必填。按鈕文字；`iconOnly` 時變成 `aria-label` 與 `title` |
| variant | `"primary"` \| `"secondary"` \| `"ghost"` \| `"ink"` | `"primary"` | primary：黃底深字；secondary：透明底 + `#d3c5a6` 線框，hover 時框線與字變橘色；ghost：橘字、沒有框（Scenes 返回）；ink：深底黃字（單字卡發音鈕） |
| size | `"sm"` \| `"md"` \| `"lg"` | `"md"` | md 44px；sm 32px（icon-only 時 40px）；lg 只用在 icon-only（52px） |
| icon | string | — | `icon` 元件的圖示名稱，放在文字前 |
| iconOnly | boolean | `false` | 只顯示圖示，按鈕為正方形 |
| block | boolean | `false` | 撐滿父層寬度 |
| disabled | boolean | `false` | 停用（半透明） |
| type | `"button"` \| `"submit"` | `"button"` | 放在 form 裡當送出鈕時用 `"submit"` |
| onClick | function | — | 點擊事件 |
| className | string | `""` | 額外 class |
| attrs | object | `{}` | 額外 HTML 屬性，例如 `aria-pressed` |

更新用的函式：`setButtonLabel(button, label)`、`setButtonIcon(button, icon)`。

可覆寫的 CSS 變數：`--button-bg`、`--button-bg-hover`、`--button-fg`、`--button-fg-hover`、`--button-border`、`--button-border-hover`。

範例：

    import { createButton } from "../components/button.js";
    const playAll = createButton({ label: "Play all", size: "sm", icon: "play", onClick: playDialogue });
    const reset = createButton({ label: "Reset progress", variant: "secondary", onClick: confirmReset });

注意事項：sm（32px）與 icon-only sm（40px）是設計稿尺寸，低於 44px 的觸控標準；在觸控裝置（`pointer: coarse`）上用透明的 `::after` 把點擊範圍補到 44px，外觀不變。

### speak-button

用途：發音按鈕，用瀏覽器內建的英文語音（en-US）唸出文字。建立在 `button` 上，唸的時候圖示會閃爍。瀏覽器不支援 Web Speech API 時，回傳的按鈕是 `hidden`。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 要唸的文字 |
| label | string | `Play "<text>"` | 螢幕閱讀器讀的說明；`showLabel` 時也是按鈕文字 |
| voice | `0` \| `1` | `0` | 對話的 A / B；目前兩人用同一個聲音，保留參數給之後區分 |
| variant | 同 `button` | `"secondary"` | secondary 是米白底、橘色喇叭（例句旁）；單字卡用 `"ink"` |
| size | 同 `button` | `"sm"` | sm 是 40px 方形；單字卡用 `"lg"`（52px） |
| showLabel | boolean | `false` | 顯示文字，預設只顯示圖示 |
| className | string | `""` | 額外 class |

更新用的函式：`setSpeakText(button, text, label)`，讓同一顆按鈕改唸別的字。

範例：

    import { createSpeakButton } from "../components/speak-button.js";
    const listen = createSpeakButton({ text: sentence });

注意事項：發音邏輯在 `src/lib/speech.js`。不指定語音時 macOS Chrome 會用清單第一個美式語音 Albert（特效聲），網頁能用名稱選到的 Samantha 品質也較差，所以指定 Chrome 內建的「Google US English」（`PREFERRED_VOICE`），單字、例句、對話兩人都用它；瀏覽器沒有這個語音時（Safari、Firefox、離線的 Chrome）只設 `en-US`。iOS Safari 只允許在點擊事件裡直接發音，所以不要在 click 之後先 `await` 別的東西再呼叫 `speak()`。唸的時候 `aria-pressed="true"`。

### text-input

用途：作答輸入框。框線來自 `.pixel-border`，平常是 `#545a6e`（輸入框只能靠框線辨識位置，所以用 6.6:1 的深灰）；聚焦時變藍色；狀態改變框線顏色：almost 金、wrong 紅（並搖晃）、correct 青。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| label | string | `"What's this called?"` | 輸入框上方的標籤 |
| placeholder | string | `"Type the English word"` | 提示文字 |
| name | string | `"answer"` | input 的 name |
| value | string | `""` | 初始值 |
| hideLabel | boolean | `false` | 標籤只給螢幕閱讀器讀 |
| autofocus | boolean | `false` | 自動聚焦 |
| onSubmit | function(value) | — | 按 Enter 時呼叫；輸入法選字中的 Enter 不算 |
| onInput | function(value) | — | 內容每次改變時呼叫，例如答錯後重新打字時切回 default 狀態 |
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

注意事項：四種狀態色在米白底上的對比都 ≥ 5:1（success 青 5.26、almost 金 5.70、error 紅 6.78、hint 藍 6.60，見 `tokens.css` 註解）。hint 的主訊息用等寬字（`--font-mono`）加字距，字母格 `s _ _ _ _ _ _` 才數得出幾個字母。

### sentence-list

用途：例句列表卡片（建立在 `card` 上）。每句一列：青色的類型標籤（Describe / Act / Feel）、17px 的句子、右邊 40px 發音鈕；句子裡的目標單字標成橘色粗體（含 -s / -es / -ed / -ing 變化）。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | `"Say it to yourself"` | 卡片標題，空字串則不顯示標題列 |
| sentences | `(string \| { text, tag })[]` | `[]` | 例句；`tag` 顯示成 label 樣式的 `tag` |
| highlight | string[] | `[]` | 要標色的單字 |
| headingLevel | 1–4 | `3` | 標題的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createSentenceList } from "../components/sentence-list.js";
    const selfTalk = createSentenceList({ sentences: object.selfTalk, highlight: object.accept });

注意事項：標色用全域的 `mark` 樣式（`base.css`），由 `src/lib/dom.js` 的 `highlightWords()` 產生。場景頁的文字畫面（Word picture）也用這個元件：每組一列，`tag` 是 Looks / Actions / Goes with，文字用逗號串起來，發音時才有停頓。

### dialogue

用途：兩人一來一往的對話，聊天泡泡樣式（建立在 `card` 上）。第一位說話者靠右、青色泡泡、青色名稱；第二位靠左、米色泡泡、橘色名稱。整個泡泡是按鈕，點了播放那一句。標題列右邊的 Play all 連續唸完，唸到哪句那個泡泡的框線就變橘色，播放中按鈕變成 Stop。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | `"Mini dialogue"` | 卡片標題 |
| lines | `{ speaker, text }[]` | `[]` | 對話內容；speaker 通常是 `"A"`、`"B"` |
| speakers | object | `{}` | 說話者顯示名稱，例如 `{ A: "You", B: "Coworker" }`；沒給就顯示代號 |
| highlight | string[] | `[]` | 要標色的單字 |
| headingLevel | 1–4 | `3` | 標題的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createDialogue } from "../components/dialogue.js";
    const talk = createDialogue({ lines: object.dialogue, speakers: scene.speakers, highlight: object.accept });

注意事項：左右邊與顏色依說話者第一次出現的順序分配；兩人用同一個聲音（見 speak-button 的說明）。Play all 用 `speakSequence()` 在同一次點擊裡把所有句子排進佇列，iOS Safari 才不會擋。泡泡的 `aria-label` 是「說話者: 句子. Play this line.」。瀏覽器不支援發音時，Play all 隱藏、泡泡停用但文字照常顯示。

### progress-badge

用途：「FOUND 4/15」加上一列進度格（每格 8×12px）。每格代表一個物件：已找到青色、目前選取黃色、還沒找到米灰色。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| found | number | `0` | 已發現數 |
| total | number | `0` | 總數，也是格數 |
| cells | `("found" \| "current" \| "empty")[]` | — | 依物件順序指定每格狀態；沒給時前 `found` 格是 found、其餘 empty |
| showCells | boolean | `true` | false 時只顯示文字 |
| label | string | `"Found"` | 數字前的文字 |
| className | string | `""` | 額外 class |

更新用的函式：`setProgress(badge, { found, total, cells })`。

範例：

    import { createProgressBadge, setProgress } from "../components/progress-badge.js";
    const progress = createProgressBadge({ found: 4, total: 15 });
    setProgress(progress, { found: 5, total: 15, cells });

注意事項：純展示，進度格加 `aria-hidden`，元素的 `title` 是「Found 4 of 15」。要讓螢幕閱讀器知道進度變化，在 `feedback` 裡另外說明。

### scene-card

用途：首頁的場景卡片。整張卡是一個 `<a>`，內含 16:9 縮圖、標題、說明、`progress-badge`。外框用 `pixel-frame`（muted），縮圖底色是場景的深藍；hover 或鍵盤聚焦時框線變橘色並往上浮 4px。

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
| 768–1023px | bottom sheet，最高 50% 螢幕。從右側滑出會蓋住場景右半邊、看不到正在命名的物件，所以不用 | 移到畫面下方並隱藏 |
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

可覆寫的 CSS 變數：`--panel-sheet-max-height`（bottom sheet 最高，預設手機 70vh、平板 50vh）、`--panel-desktop-height`（桌機高度，預設 `calc(100vh - 140px)`）、`--panel-desktop-min-height`（桌機最低高度，預設 560px）。這幾個是 tokens，可在外層元素覆寫。

範例：

    import { createPanel, openPanel, setPanelContent } from "../components/panel.js";
    const panel = createPanel({ title: "Object 3 of 14", children: [answerInput, feedback] });
    sceneLayout.append(sceneElement, panel);
    setPanelContent(panel, { title: "Object 4 of 14", children: [...] });
    openPanel(panel);

注意事項：桌機版是 sticky，外層排版要把面板放在場景旁邊的欄位（例如 `grid-template-columns: 1fr auto`）。手機版底部有 safe-area 內距，避開 iPhone 的 Home 條。

### modal

用途：蓋住整個畫面的對話框，用在 Scene talk 與 Scene complete。用原生 `<dialog>` 的 `showModal()`：焦點鎖在對話框內、Esc 關閉、背景不能操作，都是瀏覽器內建。外框是 `pixel-frame` 的 default（米白底、`#e3d8c0` 框），背後是半透明深色遮罩。

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

### text

用途：一般段落文字。頁面上的說明、副標、灰色補充文字都用它，頁面 CSS 不另外設定字色與字級。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| text | string | — | 文字內容 |
| children | Node[] | — | 要放元素（例如標色的單字）時用，會取代 `text` |
| tone | `"default"` \| `"muted"` \| `"accent"` | `"default"` | 白、灰、黃 |
| size | `"sm"` \| `"md"` \| `"lg"` | `"md"` | 14 / 16 / 20px |
| tag | string | `"p"` | HTML 標籤，例如 `"span"` |
| className | string | `""` | 額外 class |

範例：

    import { createText } from "../components/text.js";
    const note = createText({ text: "Progress is saved in this browser.", size: "sm", tone: "muted" });

### scene-stage

用途：可互動的場景圖。把 SVG 裡每個 `<g data-object="id">` 變成可以點的物件：

| 操作 | 行為 |
|---|---|
| 滑鼠 hover | 物件出現 1 格像素的黃色外框，右上角出現「?」 |
| 滑鼠點擊 | 選取（呼叫 `onSelect`） |
| 觸控第一次點 | 出現外框與「?」，不選取；點空白處取消 |
| 觸控再點同一個 | 選取；已選取的物件點一次就會再選取 |
| 鍵盤 | Tab 依 SVG 順序聚焦物件，Enter 或空白鍵選取 |

平常場景上不顯示任何標記；hover、聚焦或選取時右上角出現標記：還沒找到是黃色「?」，已找到是綠色 ✓。已選取但滑鼠移開的物件是白色外框。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| svg | SVGElement | — | 場景圖，用 `lib/scenes.js` 的 `parseSvg()` 產生 |
| objectIds | string[] | `[]` | 要變成可點的物件 id；SVG 裡找不到的會在 console 警告 |
| found | Set | 空 | 已找到的物件 |
| getLabel | `(id, isFound) => string` | 回傳 id | 物件的 `aria-label`。未找到前不能寫出答案，例如 `"Object 3 of 15"` |
| onSelect | `(id, { via }) => void` | — | 選取物件時呼叫。`via` 是 `"touch"`、`"pointer"` 或 `"keyboard"`，頁面可依此決定要不要自動聚焦輸入框（觸控時聚焦會跳出手機鍵盤蓋住場景） |
| className | string | `""` | 額外 class |

控制用的函式：`setStageSelected(stage, id \| null)`、`setStageFound(stage, id)`、`resetStageFound(stage)`、`focusStageObject(stage, id)`。

範例：

    import { createSceneStage, setStageSelected } from "../components/scene-stage.js";
    const stage = createSceneStage({ svg, objectIds, found, getLabel, onSelect: (id) => setStageSelected(stage, id) });

注意事項：
- 小物件會在群組最底層加一塊透明的 `rect`，換算成螢幕上至少 24×24px（WCAG 2.2 AA 的最小目標尺寸），視窗縮放時重算。手機寬度下整張場景只有約 343×193px，PRD 原本的 44px 會讓相鄰物件的點擊範圍幾乎完全重疊，所以採 24px。
- 外框用 SVG 上的 CSS `drop-shadow`，長度單位是 SVG 自己的座標：`1px` 就是場景圖的 1 個像素，會跟著場景縮放。
- Tab 順序、「Object N of M」的編號都依 SVG 裡的群組順序，`npm test` 會檢查它跟 JSON 一致。

### card

用途：面板裡的白底卡片：2px `#ebe1cc` 框線、標題列（Silkscreen 13px 橘色標題，右側可放按鈕）與內容區。`sentence-list`、`dialogue` 都建立在它上面。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| title | string | — | 標題；不給就沒有標題列 |
| actions | Node[] | `[]` | 標題列右側的按鈕，例如 Play all。按鈕維持原寬不換行，標題太長時由標題換行 |
| children | Node[] | `[]` | 內容；卡片本身沒有內距，由內容自己決定 |
| headingLevel | 1–4 | `3` | 標題的 HTML 層級 |
| tag | string | `"section"` | 外層 HTML 標籤 |
| className | string | `""` | 額外 class |

範例：

    import { createCard } from "../components/card.js";
    const box = createCard({ title: "Mini dialogue", actions: [playAll], children: [list] });

### word-card

用途：揭曉後的黃色單字卡（設計稿的 Word hero card）：Silkscreen 詞性、34px 粗體單字、IPA 音標、右上角 52px 深色發音鈕；下方虛線分隔後是 Also OK 替代答案。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| word | string | — | 單字 |
| pos | string | — | 詞性，例如 `"noun"` |
| ipa | string | — | 音標，例如 `"/ˈsteɪplər/"`；不給就不顯示 |
| alternatives | string[] | `[]` | 其他算答對的說法；空陣列時不顯示 Also OK 那一列 |
| headingLevel | 1–4 | `3` | 單字的 HTML 層級 |
| className | string | `""` | 額外 class |

範例：

    import { createWordCard } from "../components/word-card.js";
    const hero = createWordCard({ word: object.word, pos: object.pos, ipa: object.ipa, alternatives });

### divider

用途：分隔線。vertical 是 2×28px，用在頁首「Scenes ｜ Office」之間；horizontal 是撐滿寬度的 2px 線。

| 參數 | 型別 | 預設 | 說明 |
|---|---|---|---|
| orientation | `"vertical"` \| `"horizontal"` | `"vertical"` | 方向 |
| className | string | `""` | 額外 class |

範例：

    import { createDivider } from "../components/divider.js";
    titleRow.append(backButton, createDivider(), heading);

注意事項：vertical 的長度可用 `--divider-length` 覆寫。
