import { test } from "node:test";
import assert from "node:assert/strict";
import { findPreferredVoice, PREFERRED_VOICE } from "../src/lib/speech.js";

const v = (name, lang) => ({ name, lang });

test("指定的語音是 Google US English", () => {
  assert.equal(PREFERRED_VOICE, "Google US English");
});

test("清單裡有 Google US English 時找到它，不會選到前面的特效聲或 Samantha", () => {
  const voices = [v("Albert", "en-US"), v("Bad News", "en-US"), v("Samantha", "en-US"), v("Google US English", "en-US"), v("Google UK English Female", "en-GB")];
  assert.equal(findPreferredVoice(voices).name, "Google US English");
});

test("清單裡沒有時回傳 null（Safari、Firefox、離線的 Chrome）", () => {
  assert.equal(findPreferredVoice([v("Samantha", "en-US"), v("Daniel", "en-GB")]), null);
  assert.equal(findPreferredVoice([]), null);
  assert.equal(findPreferredVoice(), null);
});

test("名稱要完全相同，不會誤選 Google UK English", () => {
  assert.equal(findPreferredVoice([v("Google UK English Male", "en-GB")]), null);
});
