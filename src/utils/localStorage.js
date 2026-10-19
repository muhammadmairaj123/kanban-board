// Tiny wrappers around localStorage. Every call is wrapped in try/catch because
// localStorage can throw (private mode, storage full, blocked by browser settings).
// If it fails, the app keeps working in memory instead of crashing.

export function readJSON(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // missing, blocked, or corrupted JSON
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore: the data simply won't persist.
  }
}

export function readString(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore: see above.
  }
}
