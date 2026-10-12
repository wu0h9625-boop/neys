import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHint, checkAnswer, editDistance, isAccepted, normalize } from "../src/lib/answer-check.js";

const FRIDGE = ["refrigerator", "fridge"];

test("PRD 驗收：Fridge、a fridge、refrigerater 都算答對 refrigerator", () => {
  assert.equal(checkAnswer("Fridge", FRIDGE).result, "correct");
  assert.equal(checkAnswer("a fridge", FRIDGE).result, "correct");

  const typo = checkAnswer("refrigerater", FRIDGE);
  assert.equal(typo.result, "almost");
  assert.equal(typo.match, "refrigerator");
  assert.ok(isAccepted(typo.result));
});

test("忽略大小寫、前後空白、句尾標點與冠詞", () => {
  for (const input of ["  STAPLER ", "the stapler", "An stapler", "stapler.", "Stapler!"]) {
    assert.equal(checkAnswer(input, ["stapler"]).result, "correct", input);
  }
});

test("冠詞只拿掉開頭的一個，不影響單字本身", () => {
  assert.equal(normalize("the theater"), "theater");
  assert.equal(normalize("another"), "another");
  assert.equal(normalize("a"), "a");
});

test("空白與連字號視為相同", () => {
  const accept = ["trash can"];
  for (const input of ["trash can", "trashcan", "trash-can", "Trash  Can"]) {
    assert.equal(checkAnswer(input, accept).result, "correct", input);
  }
});

test("彎引號與直引號視為相同", () => {
  assert.equal(normalize("driver’s seat"), normalize("driver's seat"));
});

test("拼錯一個字母：多、少、換、相鄰對調都算 almost", () => {
  const accept = ["keyboard"];
  assert.equal(checkAnswer("keybaord", accept).result, "almost"); // 對調
  assert.equal(checkAnswer("keybord", accept).result, "almost"); // 少一個
  assert.equal(checkAnswer("keybboard", accept).result, "almost"); // 多一個
  assert.equal(checkAnswer("keyboird", accept).result, "almost"); // 換一個
});

test("拼錯兩個字母算 wrong", () => {
  assert.equal(checkAnswer("kaybord", ["keyboard"]).result, "wrong");
});

test("3 個字母以下的答案不容許拼錯", () => {
  assert.equal(checkAnswer("bug", ["mug"]).result, "wrong");
  assert.equal(checkAnswer("mug", ["mug"]).result, "correct");
  assert.equal(checkAnswer("lamb", ["lamp"]).result, "almost");
});

test("almost 回傳最接近的那個同義詞", () => {
  assert.equal(checkAnswer("fridgee", FRIDGE).match, "fridge");
});

test("完全答對優先於 almost", () => {
  // "sink" 完全符合第二個答案，不應該被判成第一個答案的拼錯
  assert.equal(checkAnswer("sink", ["sinks", "sink"]).result, "correct");
});

test("沒輸入算 empty，不算答錯", () => {
  assert.equal(checkAnswer("", ["mug"]).result, "empty");
  assert.equal(checkAnswer("   ", ["mug"]).result, "empty");
  assert.equal(checkAnswer("the", ["mug"]).result, "wrong");
});

test("完全不相關的字算 wrong，match 回傳主答案", () => {
  assert.deepEqual(checkAnswer("printer", FRIDGE), { result: "wrong", match: "refrigerator" });
});

test("editDistance", () => {
  assert.equal(editDistance("abc", "abc"), 0);
  assert.equal(editDistance("abc", "acb"), 1);
  assert.equal(editDistance("kitten", "sitting"), 3);
  assert.equal(editDistance("a", "abcdef", 1), 2); // 超過 limit 提早停止
});

test("buildHint", () => {
  assert.equal(buildHint("stapler"), "s _ _ _ _ _ _ (7)");
  assert.equal(buildHint("sticky note"), "s _ _ _ _ _   _ _ _ _ (10)");
  assert.equal(buildHint("Mug"), "m _ _ (3)");
  assert.equal(buildHint(""), "");
});
