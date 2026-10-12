import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

// 用假的 localStorage 測試；import 之前就要放好，progress.js 每次讀寫都會重新取用
class FakeStorage {
  constructor() {
    this.map = new Map();
    this.broken = false;
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    if (this.broken) throw new Error("QuotaExceededError");
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

const fake = new FakeStorage();
Object.defineProperty(globalThis, "localStorage", { value: fake, configurable: true, writable: true });

const { countFound, getFound, isFound, isPersistent, markFound, resetAll, resetScene } = await import("../src/lib/progress.js");

beforeEach(() => {
  fake.broken = false;
  fake.map.clear();
  resetAll();
});

test("標記後可以讀回，而且存進 localStorage", () => {
  markFound("office", "stapler");
  markFound("office", "mug");
  assert.deepEqual([...getFound("office")].sort(), ["mug", "stapler"]);
  assert.ok(isFound("office", "mug"));
  assert.ok(!isFound("office", "printer"));
  assert.match(fake.getItem("nameit.progress"), /stapler/);
});

test("重複標記不會重複計算", () => {
  markFound("office", "stapler");
  markFound("office", "stapler");
  assert.equal(getFound("office").size, 1);
});

test("場景之間互不影響", () => {
  markFound("office", "stapler");
  markFound("studio", "bed");
  resetScene("office");
  assert.equal(getFound("office").size, 0);
  assert.ok(isFound("studio", "bed"));
});

test("countFound 只算目前場景還存在的物件", () => {
  markFound("office", "stapler");
  markFound("office", "fax-machine"); // 假設改版後刪掉了
  assert.equal(countFound("office", ["stapler", "mug"]), 1);
});

test("localStorage 內容壞掉時當成沒有進度，不會丟錯", () => {
  fake.map.set("nameit.progress", "{not json");
  assert.equal(getFound("office").size, 0);

  fake.map.set("nameit.progress", JSON.stringify({ scenes: { office: "stapler", studio: ["bed", 3, "bed"] } }));
  assert.equal(getFound("office").size, 0);
  assert.deepEqual([...getFound("studio")], ["bed"]);
});

test("localStorage 不能寫入時改存記憶體，遊戲照常", () => {
  fake.broken = true;
  assert.equal(isPersistent(), false);
  markFound("office", "stapler");
  assert.ok(isFound("office", "stapler"));
});

test("沒有 localStorage（例如 Node）時改存記憶體", () => {
  const saved = globalThis.localStorage;
  globalThis.localStorage = undefined;
  try {
    assert.equal(isPersistent(), false);
    markFound("office", "mug");
    assert.ok(isFound("office", "mug"));
  } finally {
    globalThis.localStorage = saved;
  }
});
