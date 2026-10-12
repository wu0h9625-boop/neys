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
import { createFeedback, setFeedback } from "../components/feedback.js";
import { createHeading } from "../components/heading.js";
import { createIcon } from "../components/icon.js";
import { createModal, openModal, closeModal } from "../components/modal.js";
import { createPanel, openPanel, closePanel, setPanelContent } from "../components/panel.js";
import { createPixelFrame } from "../components/pixel-frame.js";
import { createProgressBadge, setProgress } from "../components/progress-badge.js";
import { createSceneStage, setStageFound, setStageSelected, resetStageFound } from "../components/scene-stage.js";
import { createSentenceList } from "../components/sentence-list.js";
import { createSpeakButton } from "../components/speak-button.js";
import { createTag } from "../components/tag.js";
import { createText } from "../components/text.js";
import { createTextInput, setTextInputState, getTextInputValue, focusTextInput } from "../components/text-input.js";

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

  // ---------- 頁首 ----------

  const progress = createProgressBadge({ found: found.size, total });

  const header = el("header", { className: "scene-view__header" }, [
    el("div", { className: "scene-view__title-row" }, [
      createButton({ label: "Scenes", variant: "ghost", icon: "arrow-left", onClick: () => (location.hash = "#/") }),
      createHeading({ text: data.title, level: 1, size: "lg" }),
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
      stopSpeaking();
    },
  });

  function emptyContent() {
    return [
      createText({ text: "Look at the scene and name everything you can see, out loud." }),
      el("ol", { className: "scene-view__steps" }, [
        el("li", {}, [createText({ text: "1. Point at something (tap it on a phone)." })]),
        el("li", {}, [createText({ text: "2. Say what it is in English." })]),
        el("li", {}, [createText({ text: "3. Click it (or tap again) and type the word." })]),
      ]),
      createText({ text: "Keyboard: Tab moves between objects, Enter opens one.", size: "sm", tone: "muted" }),
    ];
  }

  function showEmpty() {
    selected = null;
    setStageSelected(stage, null);
    setPanelContent(panel, { title: "Pick something", children: emptyContent() });
  }

  function select(id, { focusInput = true } = {}) {
    const object = byId.get(id);
    if (!object) return;
    selected = id;
    stopSpeaking();
    setStageSelected(stage, id);
    if (found.has(id)) showRevealed(object, { result: "found" });
    else showQuestion(object, { focusInput });
    openPanel(panel, { focus: !focusInput || found.has(id) });
  }

  // ---------- 作答 ----------

  function showQuestion(object, { focusInput }) {
    let attempts = 0;
    const feedback = createFeedback();
    const input = createTextInput({ onSubmit: check });

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
              setFeedback(feedback, { tone: "hint", message: buildHint(object.word) });
              focusTextInput(input);
            },
          }),
          createButton({ label: "Reveal", variant: "secondary", onClick: () => complete(object, { result: "revealed" }) }),
        ]),
        feedback,
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
      setProgress(progress, { found: found.size, total });
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
        el("div", { className: "scene-view__word" }, [
          createHeading({ text: object.word, level: 3, size: "lg", tone: "accent" }),
          createSpeakButton({ text: object.word, variant: "secondary" }),
          object.pos ? createTag({ text: object.pos }) : null,
        ]),
        others.length > 0 ? createText({ text: `Also OK: ${others.join(", ")}`, size: "sm", tone: "muted" }) : null,
        message ? createFeedback(message) : null,
        createSentenceList({ sentences: object.selfTalk, highlight: terms }),
        createDialogue({ lines: object.dialogue, speakers: data.speakers, highlight: terms }),
        next ? createButton({ label: "Next object", icon: "play", block: true, onClick: () => select(next) }) : null,
      ],
    });
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
          setProgress(progress, { found: 0, total });
          closePanel(panel);
          showEmpty();
          closeModal(resetModal);
        },
      }),
    ],
  });

  // ---------- 組裝 ----------

  root.replaceChildren(
    el("section", { className: "scene-view" }, [
      header,
      el("div", { className: "scene-view__main" }, [
        el("div", { className: "scene-view__stage" }, [
          createPixelFrame({ padding: "none", children: [stage] }),
          // 重設很少用，放在場景下方，手機上頁首才不會多佔一行
          el("div", { className: "scene-view__footer" }, [
            createText({ text: "Hover or tap something, say its name, then open it.", size: "sm", tone: "muted" }),
            createButton({ label: "Reset progress", variant: "ghost", onClick: () => openModal(resetModal) }),
          ]),
        ]),
        panel,
      ]),
    ]),
  );

  return () => {
    stopSpeaking();
    for (const modal of [talkModal, completeModal, resetModal]) {
      closeModal(modal);
      modal.remove();
    }
  };
}
