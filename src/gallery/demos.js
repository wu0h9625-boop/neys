// 元件展示清單。每完成一個元件，就在這裡加一筆，components.html 會自動列出。
//
// 格式：
// {
//   name: "button",                       // 與 src/components/<name>.js 同名
//   description: "All buttons in the game.",
//   variants: [
//     { label: "Primary", render: () => createButton({ label: "Reveal", variant: "primary" }) },
//   ],
// }
//
// render() 回傳一個 DOM 元素。依字母排序加入。
// variant 可加 wide: true 佔滿一整列；viewport: true 會放進一個 480px 高的模擬螢幕框，
// 給 panel 這類 position: fixed 的元件用。

export const demos = [];
