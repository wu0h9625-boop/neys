# Handoff: Office Scene — Vocabulary Explorer

## Overview
A pixel-art scene page for English vocabulary practice. The learner taps objects in an office illustration. A side panel shows the selected word with pronunciation, example sentences, and a mini dialogue. Each item has text-to-speech playback.

## About the Design Files
`Office Scene.dc.html` is a **design reference built in HTML**. It is a prototype of the intended look and behavior, not production code. Recreate it in the target codebase's environment (React, Vue, etc.) using that codebase's own patterns. If no codebase exists yet, pick a suitable framework.
- To preview: open `Office Scene.dc.html` in a browser. `support.js` must sit in the same folder; it is the runtime for this prototype format.
- All styling is inline. Logic lives in the `<script type="text/x-dc">` class at the bottom of the file (`renderVals()` returns the template data).

## Fidelity
**High-fidelity.** Colors, type, and spacing are final. The scene is a **screenshot placeholder** (`assets/office-scene.png`). The real interactive scene with hit areas still needs to be implemented.

## Layout
- Page: background `#f3ead6`, padding `28px 40px 40px`, content max-width `1440px` centered, vertical gap `24px`.
- Header: a flex row, space-between, wraps.
  - Left: "Scenes" back link (pixel arrow icon, 16px bold, `#b3440a`), a 2×28px divider (`#e3d8c0`), and the H1 "Office".
  - Right: "Found 14/15" label plus a 15-segment progress bar (8×12px cells, 2px gap).
- Body: flex-wrap, gap `28px`.
  - Scene column: `flex: 999 1 560px`.
  - Panel: `flex: 1 1 380px; max-width: 440px; min-width: min(100%,360px)`.
  - Below about 950px of content width, the panel wraps under the scene.

### Scene column
- Frame: `2px solid #e3d8c0`, background `#2b3350`. The image is full-width with `image-rendering: pixelated`.
- Selected-object highlight: absolutely positioned, `3px dashed #b3440a`. Water dispenser box: left 74.2%, top 28.8%, width 10.2%, height 56.8%.
- Footer row:
  - Left: step chips "1 Tap", "2 Say it", "3 Open" (Silkscreen 12px, bg `#1b1e2e`, text `#fffaf0`, padding 3×7px, nowrap), followed by the hint "Tap an object, say its name, then open it." (16px, `#545a6e`).
  - Right: a "Reset progress" ghost button (44px tall, `2px solid #d3c5a6`; on hover, border and text turn `#b3440a`).

### Side panel
- Frame: sticky (top 24px), height `calc(100vh - 140px)`, min-height 560px, background `#fffaf0`, `2px solid #e3d8c0`.
- Body: scrolls internally, padding 16px, gap 14px.

1. **Word hero card**: bg `#ffc94d`, padding 20px, text `#1b1e2e`.
   - "noun" (Silkscreen 12px, 75% opacity).
   - Word "water dispenser" (Atkinson Hyperlegible 700, 34px, line-height 1.05).
   - IPA "/ˈwɔːtər dɪˈspensər/" (17px).
   - Play button: 52×52, bg `#1b1e2e`, pixel speaker icon `#ffc94d`.
   - Divider: `2px dashed #b88a33`, then "Also OK" (14px bold) with chips "water cooler" and "dispenser" (bg `#1b1e2e`, text `#ffc94d`, 14px, padding 2×8).
2. **"Say it to yourself" card**: bg `#ffffff`, `2px solid #ebe1cc`.
   - Header: Silkscreen 13px `#b3440a`, padding 12×16, bottom border `#ebe1cc`.
   - Rows: grid `1fr 40px`, padding 14×16, bottom border `2px solid #f3ead6`. Each row has:
     - Tag (Silkscreen 11px `#1f7383`): Describe / Act / Feel.
     - Sentence (17px, line-height 1.5, `#1b1e2e`), with the target word in bold `#b3440a`.
     - A 40×40 play button (bg `#fffaf0`, `2px solid #d3c5a6`; on hover the border turns `#b3440a`).
3. **"Mini dialogue" card**: same shell as card 2.
   - Header: title plus a "Play all" button (32px tall, bg `#ffc94d`, 13px bold).
   - Chat list: gap 10px. Each line has a speaker label (Silkscreen 10px) and a bubble (max-width 88%, padding 8×12, 16px/1.45).
     - "You": right-aligned, bg `#dcf1f4`, border `#9fd3dc`, label `#1f7383`.
     - "Coworker": left-aligned, bg `#f3ead6`, border `#d3c5a6`, label `#b3440a`.
   - Clicking a bubble plays that line.

## Interactions
- Every play control uses Web Speech `SpeechSynthesisUtterance` (en-US, rate 0.9) and cancels any current speech first. In production, replace this with recorded audio if available.
- "Play all" queues every dialogue line in order.
- Scene objects (to build): on hover or tap, highlight the object. Opening an object loads it into the panel, marks it as found, and advances the progress bar.
- "Reset progress" clears the found state.
- The design intentionally has **no shadows, no rounded corners, and no heavy black borders**.

## State
- `selectedObjectId`, `foundIds[]` (drives "Found n/15" and the progress cells), and the current object's data (`word`, `pos`, `ipa`, `alternatives[]`, `examples[{tag, pre, post}]`, `dialogue[{who, pre, hl, post}]`).
- Progress cells: found = `#1f7383`, current = `#ffc94d`, empty = `#d3c5a6`.

## Design Tokens
- Background `#f3ead6` · Panel `#fffaf0` · Card `#ffffff` · Inner/soft `#f3ead6`
- Lines: `#e3d8c0` (frames, dividers) · `#ebe1cc` (card borders) · `#d3c5a6` (button borders)
- Ink `#1b1e2e` · Muted text `#545a6e`
- Accent yellow `#ffc94d` · Accent text (orange) `#b3440a` · Dashed divider `#b88a33`
- Teal `#1f7383` · You bubble `#dcf1f4` / `#9fd3dc`
- Fonts (Google Fonts): **Silkscreen** for pixel labels and small headings (H1 32px, section titles 13–14px, tags 10–12px); **Atkinson Hyperlegible** 400/700 for the word title and all reading text (14–34px).
- Spacing: 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 px. Radius: 0. Shadows: none.
- Icons: hand-built pixel SVGs (`shape-rendering: crispEdges`) for speaker, play, and back arrow.

## Assets
- `assets/office-scene.png`: a scene screenshot cropped from the existing product (1876×1051). It is a placeholder for the real scene.

## Files
- `Office Scene.dc.html`: the full page design and logic.
- `support.js`: the prototype runtime (needed only for previewing).
- `assets/office-scene.png`
