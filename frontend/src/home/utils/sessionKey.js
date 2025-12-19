// utils/sessionKey.js
export function getSessionKey(userId) {
  // Use userId if available, otherwise fallback to a random key per tab
  if (userId) return `players_${userId}`;

  // Persist a tab-specific key so reloads reuse it
  let key = sessionStorage.getItem("sessionKey");
  if (!key) {
    key = `players_${crypto.randomUUID()}`;
    sessionStorage.setItem("sessionKey", key);
  }
  return key;
}

// utils/sessionKey.js
export function getTabId() {
  let id = sessionStorage.getItem("tabId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tabId", id);
  }
  return id;
}
