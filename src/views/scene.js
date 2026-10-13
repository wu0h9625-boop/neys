// 場景頁：場景圖 + 作答面板。
//
// 面板有三種內容：
//   empty     還沒選物件（桌機才看得到，手機與平板面板是收起來的）
//   question  輸入單字、Check / Hint / Reveal
//   revealed  單字、發音、例句、對話、下一個物件

import { el } from "../lib/dom.js";
import { buildHint, checkAnswer, isAccepted } from "../lib/answer-check.js";
import { getFound, markFound, resetScene } from "../lib/progress.js";
import { loadScene, parseSvg, termsFor } from "../lib/scenes.js";
import { speak, stopSpeaking } from "../lib/speech.js";
import { createButton } from "../components/button.js";
import { createDialogue } from "../components/dialogue.js";
import { createDivider } from "../components/divider.js";
import { createFeedback, setFeedback, clearFeedback } from "../components/feedback.js";
import { createHeading } from "../components/heading.js";
import { createIcon } from "../components/icon.js";
import { createModal, openModal, closeModal } from "../components/modal.js";
import { createPanel, openPanel, closePanel, setPanelContent } from "../components/panel.js";
import { createPixelFrame } from "../components/pixel-frame.js";
import { createProgressBadge, setProgress } from "../components/progress-badge.js";
import { createSceneStage, setStageFound, setStageSelected, resetStageFound } from "../components/scene-stage.js";
import { createSentenceList } from "../components/sentence-list.js";
import { createTag } from "../components/tag.js";
import { createText } from "../components/text.js";
import { createTextInput, setTextInputState, getTextInputValue, focusTextInput } from "../components/text-input.js";
import { createWordCard } from "../components/word-card.js";

export async function renderScene(root, sceneId) {
  const { data, svgText } = await loadScene(sceneId);
  const objects = data.objects;
  const ids = objects.map((object) => object.id);
  const byId = new Map(objects.map((object) => [object.id, object]));
  const total = objects.length;
  const found = new Set([...getFound(sceneId)].filter((id) => byId.has(id)));
  const allTerms = objects.flatMap(termsFor);
  let selected = null;

  document.title = `${data.title} · Name It`;

  const numberOf = (id) => ids.indexOf(id) + 1;
  const labelOf = (id, isFound) => `Object ${numberOf(id)} of ${total}${isFound ? `: ${byId.get(id).word}` : ""}`;

  // ---------- 場景圖 ----------

  const stage = createSceneStage({
    svg: parseSvg(svgText),
    objectIds: ids,
    found,
    getLabel: labelOf,
    onSelect: (id, { via }) => select(id, { focusInput: via !== "touch" }),
  });
  const stageFrame = createPixelFrame({ padding: "none", children: [stage] });

  // ---------- 頁首 ----------

  // 進度格依物件順序：已找到青色、目前選取黃色、還沒找到米灰色
  const cellStates = () => ids.map((id) => (id === selected ? "current" : found.has(id) ? "found" : "empty"));
  const progress = createProgressBadge({ found: found.size, total, cells: cellStates() });
  const updateProgress = () => setProgress(progress, { found: found.size, total, cells: cellStates() });

  const header = el("header", { className: "scene-view__header" }, [
    el("div", { className: "scene-view__title-row" }, [
      createButton({ label: "Scenes", variant: "ghost", icon: "arrow-left", onClick: () => (location.hash = "#/") }),
      createDivider(),
      createHeading({ text: data.title, level: 1, size: "xl" }),
    ]),
    el("div", { className: "scene-view__tools" }, [
      progress,
      createButton({ label: "Scene talk", variant: "secondary", icon: "chat", onClick: () => openModal(talkModal) }),
    ]),
  ]);

  // ---------- 面板 ----------

  const panel = createPanel({
    title: "Pick something",
    children: emptyContent(),
    onClose: () => {
      selected = null;
      setStageSelected(stage, null);
      updateProgress();
      stopSpeaking();
      view.classList.remove("scene-view--sheet-open");
    },
  });

  function emptyContent() {
    return [
      // 三個步驟已經寫在場景下方的步驟標籤，這裡不再重複
      createText({ text: "Look at the scene and name everything you can see, out loud." }),
      createText({ text: "Keyboard: Tab moves between objects, Enter opens one.", size: "sm", tone: "muted" }),
    ];
  }

  function showEmpty() {
    selected = null;
    setStageSelected(stage, null);
    updateProgress();
    setPanelContent(panel, { title: "Pick something", children: emptyContent() });
  }

  function select(id, { focusInput = true } = {}) {
    const object = byId.get(id);
    if (!object) return;
    selected = id;
    stopSpeaking();
    setStageSelected(stage, id);
    updateProgress();
    if (found.has(id)) showRevealed(object, { result: "found" });
    else showQuestion(object, { focusInput });
    openPanel(panel, { focus: !focusInput || found.has(id) });
    keepStageAboveSheet();
  }

  // 手機的 sheet 最高 70%，揭曉後會蓋住場景。把頁面捲到場景圖貼齊頂端，
  // 375×812 時場景圖約 193px，sheet 上方還剩 244px，整張場景都露得出來。
  // 平板的 sheet 只到 50%，不會蓋到場景，不用捲。
  function keepStageAboveSheet() {
    if (matchMedia("(min-width: 768px)").matches) return;
    view.classList.add("scene-view--sheet-open");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = stageFrame.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // ---------- 作答 ----------

  function showQuestion(object, { focusInput }) {
    let attempts = 0;
    const feedback = createFeedback();
    // 提示獨立一行，答錯時不會被錯誤訊息蓋掉
    const hint = createFeedback();
    const input = createTextInput({ onSubmit: check, onInput: clearResult });

    // 答錯後開始改答案，紅框與錯誤訊息就拿掉，輸入框回到聚焦的藍框
    function clearResult() {
      if (input.dataset.state === "default") return;
      setTextInputState(input, "default");
      clearFeedback(feedback);
    }

    function check() {
      const typed = getTextInputValue(input);
      const { result, match } = checkAnswer(typed, object.accept);

      if (result === "empty") {
        setTextInputState(input, "default");
        setFeedback(feedback, { tone: "info", message: "Type what you think it is first." });
        focusTextInput(input);
        return;
      }
      if (!isAccepted(result)) {
        attempts += 1;
        setTextInputState(input, "wrong");
        setFeedback(feedback, {
          tone: "error",
          message: "Not quite. Try again.",
          detail: attempts >= 2 ? "Stuck? Use Hint, or Reveal to see the answer." : "",
        });
        focusTextInput(input);
        return;
      }
      complete(object, { result, typed, match });
    }

    setPanelContent(panel, {
      title: `Object ${numberOf(object.id)} of ${total}`,
      children: [
        createText({ text: "Say it out loud first. Then type it.", size: "sm", tone: "muted" }),
        input,
        el("div", { className: "scene-view__actions" }, [
          createButton({ label: "Check", onClick: check }),
          createButton({
            label: "Hint",
            variant: "secondary",
            icon: "bulb",
            onClick: () => {
              setFeedback(hint, { tone: "hint", message: buildHint(object.word) });
              focusTextInput(input);
            },
          }),
          createButton({ label: "Reveal", variant: "secondary", onClick: () => complete(object, { result: "revealed" }) }),
        ]),
        el("div", { className: "scene-view__feedback" }, [hint, feedback]),
      ],
    });

    if (focusInput) requestAnimationFrame(() => focusTextInput(input));
  }

  function complete(object, { result, typed, match }) {
    // 在同一個點擊事件裡發音，iOS Safari 才會出聲
    speak(object.word);

    const newlyFound = !found.has(object.id);
    if (newlyFound) {
      found.add(object.id);
      markFound(sceneId, object.id);
      setStageFound(stage, object.id);
      updateProgress();
    }

    showRevealed(object, { result, typed, match });

    if (newlyFound && found.size === total) openModal(completeModal);
  }

  // ---------- 揭曉 ----------

  const RESULT_MESSAGES = {
    correct: () => ({ tone: "success", message: "Nice! That's right." }),
    almost: ({ typed, match }) => ({ tone: "almost", message: "Almost!", detail: `You typed "${typed.trim()}". It's spelled "${match}".` }),
    revealed: () => ({ tone: "info", message: "Here it is. Say it out loud three times." }),
  };

  function showRevealed(object, { result, typed, match }) {
    const terms = termsFor(object);
    const others = object.accept.filter((answer) => answer.toLowerCase() !== object.word.toLowerCase()).slice(0, 3);
    const next = nextUnfound(object.id);
    const message = RESULT_MESSAGES[result]?.({ typed, match });

    setPanelContent(panel, {
      title: `Object ${numberOf(object.id)} of ${total}`,
      children: [
        createWordCard({ word: object.word, pos: object.pos, ipa: object.ipa, alternatives: others }),
        message ? createFeedback(message) : null,
        object.wordPicture ? createSentenceList({ title: "Word picture", sentences: wordPictureRows(object.wordPicture) }) : null,
        createSentenceList({ sentences: object.selfTalk, highlight: terms }),
        createDialogue({ lines: object.dialogue, speakers: data.speakers, highlight: terms }),
        next ? createButton({ label: "Next object", block: true, onClick: () => select(next) }) : null,
      ],
    });
  }

  /**
   * 文字畫面（Word picture）：每組一列，沿用 sentence-list 的「標籤 + 一行文字 + 發音」。
   * 用逗號分隔，語音念起來才會有停頓。
   */
  function wordPictureRows(picture) {
    const groups = [
      ["looks", "Looks"],
      ["actions", "Actions"],
      ["goesWith", "Goes with"],
    ];
    return groups
      .filter(([key]) => Array.isArray(picture[key]) && picture[key].length > 0)
      .map(([key, tag]) => ({ tag, text: picture[key].join(", ") }));
  }

  /** 依編號往後找下一個還沒找到的物件，找完一輪都找到了回傳 null。 */
  function nextUnfound(fromId) {
    const start = ids.indexOf(fromId);
    for (let step = 1; step <= ids.length; step += 1) {
      const id = ids[(start + step) % ids.length];
      if (!found.has(id)) return id;
    }
    return null;
  }

  // ---------- Modal ----------

  const talkModal = createModal({
    title: "Scene talk",
    children: data.sceneDialogues.map((talk) =>
      createDialogue({ title: talk.title, lines: talk.lines, speakers: data.speakers, highlight: allTerms }),
    ),
    onClose: stopSpeaking,
  });

  const completeModal = createModal({
    title: "Scene complete!",
    size: "sm",
    dismissible: false,
    children: [
      el("div", { className: "scene-view__complete" }, [
        createText({ tag: "span", tone: "accent", children: [createIcon("star", { scale: 4 })] }),
        createProgressBadge({ found: total, total }),
      ]),
      createText({ text: `You named all ${total} things in the ${data.title.toLowerCase()}. Tomorrow, try naming them out loud in real life.` }),
    ],
    actions: [
      createButton({ label: "Stay here", variant: "secondary", onClick: () => closeModal(completeModal) }),
      createButton({ label: "Back to scenes", onClick: () => (location.hash = "#/") }),
    ],
  });

  const resetModal = createModal({
    title: "Reset progress?",
    size: "sm",
    children: [createText({ text: `This clears every object you found in the ${data.title.toLowerCase()}. You can't undo it.` })],
    actions: [
      createButton({ label: "Cancel", variant: "secondary", onClick: () => closeModal(resetModal) }),
      createButton({
        label: "Reset",
        onClick: () => {
          resetScene(sceneId);
          found.clear();
          resetStageFound(stage);
          updateProgress();
          closePanel(panel);
          showEmpty();
          closeModal(resetModal);
        },
      }),
    ],
  });

  // ---------- 組裝 ----------

  const view = el("section", { className: "scene-view" }, [
      header,
      el("div", { className: "scene-view__main" }, [
        el("div", { className: "scene-view__stage" }, [
          stageFrame,
          // 重設很少用，放在場景下方，手機上頁首才不會多佔一行
          el("div", { className: "scene-view__footer" }, [
            el("div", { className: "scene-view__steps-row" }, [
              el("span", { className: "scene-view__step-tags" }, [
                createTag({ text: "1 Tap", kind: "pixel", tone: "ink" }),
                createTag({ text: "2 Say it", kind: "pixel", tone: "ink" }),
                createTag({ text: "3 Open", kind: "pixel", tone: "ink" }),
              ]),
              createText({ text: "Tap an object, say its name, then open it.", tone: "muted", tag: "span" }),
            ]),
            createButton({ label: "Reset progress", variant: "secondary", onClick: () => openModal(resetModal) }),
          ]),
        ]),
        panel,
      ]),
    ]);
  root.replaceChildren(view);

  return () => {
    stopSpeaking();
    for (const modal of [talkModal, completeModal, resetModal]) {
      closeModal(modal);
      modal.remove();
    }
  };
}
