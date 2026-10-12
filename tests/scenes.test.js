import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseSvgObjectIds, termsFor, validateScene } from "../src/lib/scenes.js";
import { buildTermPattern, containsTerm } from "../src/lib/text.js";

const read = (name) => readFileSync(new URL(`../scenes/${name}`, import.meta.url), "utf8");
const sceneIds = JSON.parse(read("index.json")).scenes;

// ---------- 所有場景檔都要符合 PRD 的內容規則 ----------

for (const id of sceneIds) {
  test(`scenes/${id}：內容符合規則（物件數、例句、對話、SVG 對應）`, () => {
    const data = JSON.parse(read(`${id}.json`));
    const svgIds = parseSvgObjectIds(read(`${id}.svg`));
    assert.equal(data.id, id);
    assert.deepEqual(validateScene(data, svgIds), []);
  });
}

// ---------- validateScene 本身抓得到問題 ----------

const line = (speaker, text) => ({ speaker, text });
const makeObject = (id) => ({
  id,
  word: id,
  ipa: "/θɪŋ/",
  accept: [id],
  wordPicture: { looks: ["red", "small", "new"], actions: ["use", "move", "clean"], goesWith: ["desk", "paper", "office"] },
  selfTalk: [
    `There is a ${id} on the table that I have never seen before today.`,
    `I am going to use the ${id} after lunch so I can finish my work.`,
    `If the ${id} breaks again, I will have to ask my manager for help.`,
  ],
  dialogue: [line("A", `Where is the ${id}?`), line("B", "Over there."), line("A", "Thanks."), line("B", "Sure.")],
});
const makeScene = (count = 12) => ({
  id: "test",
  title: "Test",
  sceneDialogues: [{ title: "Hi", lines: [line("A", "Hi"), line("B", "Hello")] }],
  objects: Array.from({ length: count }, (_, i) => makeObject(`thing${String.fromCharCode(97 + i)}`)),
});

test("合格的場景沒有問題", () => {
  const scene = makeScene();
  assert.deepEqual(validateScene(scene, scene.objects.map((o) => o.id)), []);
});

test("物件數量不在 12–15 之間", () => {
  assert.match(validateScene(makeScene(11)).join(), /11 objects/);
  assert.match(validateScene(makeScene(16)).join(), /16 objects/);
});

test("例句不是 3 句、或沒用到單字", () => {
  const scene = makeScene();
  scene.objects[0].selfTalk.pop();
  scene.objects[1].selfTalk[0] = "Nothing related here.";
  const problems = validateScene(scene).join("\n");
  assert.match(problems, /thinga: has 2 selfTalk/);
  assert.match(problems, /thingb: selfTalk\[0\] does not use the word/);
});

test("例句太短（少於 10 個字）", () => {
  const scene = makeScene();
  scene.objects[0].selfTalk[1] = `I see a ${scene.objects[0].id}.`;
  assert.match(validateScene(scene).join(), /thinga: selfTalk\[1\] has 4 words, expected at least 10/);
});

test("IPA 缺少或格式不對", () => {
  const scene = makeScene();
  delete scene.objects[0].ipa;
  scene.objects[1].ipa = "ˈstɪki";
  const problems = validateScene(scene).join("\n");
  assert.match(problems, /thinga: ipa must be written/);
  assert.match(problems, /thingb: ipa must be written/);
});

test("文字畫面缺少或數量不對", () => {
  const scene = makeScene();
  delete scene.objects[0].wordPicture;
  scene.objects[1].wordPicture.actions = ["use"];
  scene.objects[2].wordPicture.goesWith = ["a", "b", "c", "d", "e", "f"];
  const problems = validateScene(scene).join("\n");
  assert.match(problems, /thinga: missing wordPicture/);
  assert.match(problems, /thingb: wordPicture.actions has 1 items/);
  assert.match(problems, /thingc: wordPicture.goesWith has 6 items/);
});

test("對話不是 4–6 句", () => {
  const scene = makeScene();
  scene.objects[0].dialogue = scene.objects[0].dialogue.slice(0, 3);
  assert.match(validateScene(scene).join(), /dialogue has 3 lines/);
});

test("accept 沒包含主單字", () => {
  const scene = makeScene();
  scene.objects[0].accept = ["something else"];
  assert.match(validateScene(scene).join(), /accept does not include the word/);
});

test("重複的 id", () => {
  const scene = makeScene();
  scene.objects[1].id = scene.objects[0].id;
  assert.match(validateScene(scene).join(), /duplicate id/);
});

test("沒有場景對話", () => {
  const scene = makeScene();
  scene.sceneDialogues = [];
  assert.match(validateScene(scene).join(), /0 scene dialogues/);
});

test("SVG 與 JSON 物件不對應、或順序不同", () => {
  const scene = makeScene();
  const ids = scene.objects.map((o) => o.id);
  assert.match(validateScene(scene, ids.slice(1)).join(), /svg is missing/);
  assert.match(validateScene(scene, [...ids, "ghost"]).join(), /svg has "ghost"/);
  assert.match(validateScene(scene, [...ids].reverse()).join(), /order differs/);
});

// ---------- 單字比對 ----------

test("parseSvgObjectIds 依順序取出 id", () => {
  assert.deepEqual(parseSvgObjectIds('<g data-object="a"></g><g data-object="b-c"></g>'), ["a", "b-c"]);
  assert.deepEqual(parseSvgObjectIds('<!-- e.g. <g data-object="id"> --><g data-object="a"></g>'), ["a"]);
});

test("termsFor 合併主單字、答案與額外字形", () => {
  assert.deepEqual(termsFor({ word: "stapler", accept: ["stapler"], highlight: ["staple"] }), ["stapler", "staple"]);
});

test("containsTerm 認得複數與動詞變化，但不會比對到別的字的一部分", () => {
  assert.ok(containsTerm("Let me staple these pages.", ["staple"]));
  assert.ok(containsTerm("I have too many sticky notes.", ["sticky note"]));
  assert.ok(containsTerm("She stapled it.", ["staple"]) === false); // staple + d 不在規則內
  assert.ok(containsTerm("He printed it.", ["print"]));
  assert.ok(!containsTerm("The printer is broken.", ["print"]));
});

test("buildTermPattern 長的字優先", () => {
  const match = "a sticky note here".match(buildTermPattern(["note", "sticky note"]));
  assert.equal(match[0], "sticky note");
});
