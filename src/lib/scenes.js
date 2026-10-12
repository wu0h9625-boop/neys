// 場景資料：載入 scenes/*.json 與 *.svg，以及內容規則檢查。
// validateScene / parseSvgObjectIds / termsFor 是純邏輯，tests/scenes.test.js 會用來檢查所有場景檔。

import { checkAnswer } from "./answer-check.js";
import { containsTerm } from "./text.js";

export const SCENE_RULES = {
  minObjects: 12,
  maxObjects: 15,
  selfTalkCount: 3,
  dialogueMin: 4,
  dialogueMax: 6,
  minSceneDialogues: 1,
};

/** 標色與內容檢查用的單字：主單字、所有可接受答案、額外指定的字形（例如 stapler 的 staple）。 */
export function termsFor(object) {
  return [...new Set([object.word, ...(object.accept ?? []), ...(object.highlight ?? [])].filter(Boolean))];
}

/** 依出現順序取出 SVG 裡所有 data-object 的 id（註解裡的不算）。 */
export function parseSvgObjectIds(svgText) {
  const withoutComments = String(svgText).replace(/<!--[\s\S]*?-->/g, "");
  return [...withoutComments.matchAll(/data-object="([^"]+)"/g)].map((match) => match[1]);
}

/**
 * 檢查一個場景的資料是否符合內容規則，回傳問題清單（空陣列代表沒問題）。
 * svgIds 可省略；有給就檢查 SVG 與 JSON 的物件一一對應、順序相同。
 */
export function validateScene(data, svgIds) {
  const problems = [];
  const where = (object, index) => `objects[${index}] ${object?.id ?? "(no id)"}`;

  if (!data || typeof data !== "object") return ["scene data is not an object"];
  if (!data.id) problems.push("missing id");
  if (!data.title) problems.push("missing title");

  const objects = Array.isArray(data.objects) ? data.objects : [];
  if (objects.length < SCENE_RULES.minObjects || objects.length > SCENE_RULES.maxObjects) {
    problems.push(`has ${objects.length} objects, expected ${SCENE_RULES.minObjects}–${SCENE_RULES.maxObjects}`);
  }

  const seen = new Set();
  objects.forEach((object, index) => {
    const at = where(object, index);
    if (!object.id) problems.push(`${at}: missing id`);
    if (seen.has(object.id)) problems.push(`${at}: duplicate id`);
    seen.add(object.id);

    if (!object.word) problems.push(`${at}: missing word`);
    if (!Array.isArray(object.accept) || object.accept.length === 0) {
      problems.push(`${at}: accept must list at least one answer`);
    } else if (object.word && checkAnswer(object.word, object.accept).result !== "correct") {
      problems.push(`${at}: accept does not include the word itself`);
    }

    const terms = termsFor(object);

    const selfTalk = Array.isArray(object.selfTalk) ? object.selfTalk : [];
    if (selfTalk.length !== SCENE_RULES.selfTalkCount) {
      problems.push(`${at}: has ${selfTalk.length} selfTalk sentences, expected ${SCENE_RULES.selfTalkCount}`);
    }
    selfTalk.forEach((sentence, i) => {
      const text = typeof sentence === "string" ? sentence : sentence?.text;
      if (!text) problems.push(`${at}: selfTalk[${i}] is empty`);
      else if (!containsTerm(text, terms)) problems.push(`${at}: selfTalk[${i}] does not use the word`);
    });

    const dialogue = Array.isArray(object.dialogue) ? object.dialogue : [];
    if (dialogue.length < SCENE_RULES.dialogueMin || dialogue.length > SCENE_RULES.dialogueMax) {
      problems.push(`${at}: dialogue has ${dialogue.length} lines, expected ${SCENE_RULES.dialogueMin}–${SCENE_RULES.dialogueMax}`);
    }
    dialogue.forEach((line, i) => {
      if (!line?.speaker || !line?.text) problems.push(`${at}: dialogue[${i}] needs speaker and text`);
    });
    if (dialogue.length > 0 && !dialogue.some((line) => containsTerm(line?.text ?? "", terms))) {
      problems.push(`${at}: dialogue never uses the word`);
    }
  });

  const sceneDialogues = Array.isArray(data.sceneDialogues) ? data.sceneDialogues : [];
  if (sceneDialogues.length < SCENE_RULES.minSceneDialogues) {
    problems.push(`has ${sceneDialogues.length} scene dialogues, expected at least ${SCENE_RULES.minSceneDialogues}`);
  }
  sceneDialogues.forEach((talk, index) => {
    if (!talk?.title) problems.push(`sceneDialogues[${index}]: missing title`);
    const lines = Array.isArray(talk?.lines) ? talk.lines : [];
    if (lines.length < 2) problems.push(`sceneDialogues[${index}]: needs at least 2 lines`);
    lines.forEach((line, i) => {
      if (!line?.speaker || !line?.text) problems.push(`sceneDialogues[${index}].lines[${i}] needs speaker and text`);
    });
  });

  if (svgIds) {
    const jsonIds = objects.map((object) => object.id);
    for (const id of jsonIds) if (!svgIds.includes(id)) problems.push(`svg is missing <g data-object="${id}">`);
    for (const id of svgIds) if (!jsonIds.includes(id)) problems.push(`svg has "${id}" but the json does not`);
    if (problems.length === 0 && jsonIds.join() !== svgIds.join()) {
      problems.push("svg object order differs from json order (tab order and numbering would not match)");
    }
  }

  return problems;
}

// ---------- 瀏覽器載入 ----------

const BASE = new URL("../../scenes/", import.meta.url);
const cache = new Map();

async function fetchText(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(new URL(name, BASE)).then((response) => {
        if (!response.ok) throw new Error(`Could not load scenes/${name} (${response.status})`);
        return response.text();
      }),
    );
  }
  return cache.get(name);
}

/** 場景 id 清單（scenes/index.json）。 */
export async function loadSceneIds() {
  const index = JSON.parse(await fetchText("index.json"));
  return Array.isArray(index.scenes) ? index.scenes : [];
}

/** 每次呼叫都回傳一份新的 SVG 元素，可以直接放進頁面。 */
export function parseSvg(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.nodeName !== "svg") throw new Error("Scene art is not a valid SVG");
  return document.importNode(svg, true);
}

/** 載入一個場景：{ data, svgText }。資料有問題時在 console 警告，但仍然回傳。 */
export async function loadScene(id) {
  const [json, svgText] = await Promise.all([fetchText(`${id}.json`), fetchText(`${id}.svg`)]);
  const data = JSON.parse(json);
  const problems = validateScene(data, parseSvgObjectIds(svgText));
  if (problems.length > 0) console.warn(`Scene "${id}" has content problems:\n- ${problems.join("\n- ")}`);
  return { data, svgText };
}
