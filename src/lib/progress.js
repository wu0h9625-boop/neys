// 進度保存：記住每個場景已經找到哪些物件。
//
// 存在 localStorage 的一個 key 裡：{ version: 1, scenes: { office: ["stapler", "mug"] } }
// localStorage 不能用時（無痕模式、被封鎖、Node 測試環境）改存在記憶體，
// 頁面開著時進度照常運作，重新整理後才會消失。

const STORAGE_KEY = "nameit.progress";
const VERSION = 1;

let memory = { version: VERSION, scenes: {} };

function storage() {
  try {
    const store = globalThis.localStorage;
    if (!store) return null;
    // Safari 無痕模式等情況：存在但寫入會丟錯
    const probe = `${STORAGE_KEY}.probe`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

/** 只接受 { scenes: { [sceneId]: string[] } } 的格式，其他一律當成空的。 */
function sanitize(data) {
  const scenes = {};
  if (data && typeof data === "object" && data.scenes && typeof data.scenes === "object") {
    for (const [sceneId, ids] of Object.entries(data.scenes)) {
      if (Array.isArray(ids)) scenes[sceneId] = [...new Set(ids.filter((id) => typeof id === "string"))];
    }
  }
  return { version: VERSION, scenes };
}

function read() {
  const store = storage();
  if (!store) return memory;
  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : { version: VERSION, scenes: {} };
  } catch {
    return { version: VERSION, scenes: {} };
  }
}

function write(data) {
  memory = data;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 空間滿了或被封鎖：保留在記憶體，不中斷遊戲
  }
}

/** 某個場景已找到的物件 id（Set）。 */
export function getFound(sceneId) {
  return new Set(read().scenes[sceneId] ?? []);
}

export function isFound(sceneId, objectId) {
  return getFound(sceneId).has(objectId);
}

/** 標記為已找到，回傳更新後的 Set。重複標記不會重複計算。 */
export function markFound(sceneId, objectId) {
  const data = read();
  const found = new Set(data.scenes[sceneId] ?? []);
  found.add(objectId);
  data.scenes[sceneId] = [...found];
  write(data);
  return found;
}

/**
 * 計算進度。只算目前場景資料裡還存在的物件，
 * 之後場景內容改版刪掉某個物件時，舊進度不會讓數字超過總數。
 */
export function countFound(sceneId, objectIds) {
  const found = getFound(sceneId);
  return objectIds.filter((id) => found.has(id)).length;
}

export function resetScene(sceneId) {
  const data = read();
  delete data.scenes[sceneId];
  write(data);
}

export function resetAll() {
  write({ version: VERSION, scenes: {} });
}

/** 目前是否能永久保存（給介面提示用，例如無痕模式下說明重新整理會清空）。 */
export function isPersistent() {
  return storage() !== null;
}
