import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { STORAGE_KEYS } from '../../utils/constants';
import { readString } from '../../utils/localStorage';

// Saved choice wins; otherwise follow the operating system setting.
function getInitialTheme() {
  const saved = readString(STORAGE_KEYS.theme);
  if (saved === 'dark' || saved === 'light') return saved;
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

const defaultFilters = { text: '', priority: 'all', label: 'all' };

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: getInitialTheme(),
    filters: defaultFilters,
    toast: null, // { id, message, type } or null
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTextFilter(state, action) {
      state.filters.text = action.payload;
    },
    setPriorityFilter(state, action) {
      state.filters.priority = action.payload;
    },
    setLabelFilter(state, action) {
      state.filters.label = action.payload;
    },
    resetFilters(state) {
      state.filters = defaultFilters;
    },
    showToast: {
      // The id changes on every toast, so the auto-dismiss timer restarts for a new message.
      prepare(message, type = 'success') {
        return { payload: { id: nanoid(), message, type } };
      },
      reducer(state, action) {
        state.toast = action.payload;
      },
    },
    dismissToast(state) {
      state.toast = null;
    },
  },
});

export const {
  toggleTheme,
  setTextFilter,
  setPriorityFilter,
  setLabelFilter,
  resetFilters,
  showToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
