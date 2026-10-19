import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from '../features/boards/boardsSlice';
import uiReducer from '../features/ui/uiSlice';
import { STORAGE_KEYS } from '../utils/constants';
import { readJSON, writeJSON, writeString } from '../utils/localStorage';
import { isValidBoardsState } from '../utils/boardIO';
import { createSeedState } from '../utils/seedData';

// Hydrate: use the saved boards if they exist AND look valid.
// First launch or corrupted data -> fall back to the demo board.
function loadBoards() {
  const saved = readJSON(STORAGE_KEYS.boards);
  return isValidBoardsState(saved) ? saved : createSeedState();
}

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    ui: uiReducer,
  },
  preloadedState: {
    boards: loadBoards(),
  },
});

// --- Persistence ------------------------------------------------------------
// Save to localStorage when boards or theme change. It is debounced (waits 300 ms of
// quiet) so rapid changes, like typing, do not write on every keystroke.
let timerId = null;
let previous = store.getState();

function persist() {
  const { boards, ui } = store.getState();
  writeJSON(STORAGE_KEYS.boards, boards);
  writeString(STORAGE_KEYS.theme, ui.theme);
}

store.subscribe(() => {
  const next = store.getState();
  // Filters, toasts, etc. change often but do not need saving.
  if (next.boards === previous.boards && next.ui.theme === previous.ui.theme) return;
  previous = next;
  clearTimeout(timerId);
  timerId = setTimeout(persist, 300);
});

// If the user closes the tab inside the 300 ms window, save immediately.
window.addEventListener('pagehide', () => {
  clearTimeout(timerId);
  persist();
});
