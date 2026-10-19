// Shared constants. Keeping them in one place means the UI, the Redux reducers
// and the import validator all agree on what a "valid" priority or label is.

export const STORAGE_KEYS = {
  boards: 'kanban-boards-v1',
  theme: 'kanban-theme',
};

// Full Tailwind class names are written out (not built dynamically) because
// Tailwind only generates CSS for class names it can find in the source text.
export const PRIORITIES = [
  {
    value: 'low',
    label: 'Low',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    active: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    active: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    value: 'high',
    label: 'High',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    active: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
];

export const PRIORITY_VALUES = PRIORITIES.map((p) => p.value);

export function getPriority(value) {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1];
}

export const LABELS = [
  { id: 'red', name: 'Red', swatch: 'bg-red-500' },
  { id: 'orange', name: 'Orange', swatch: 'bg-orange-500' },
  { id: 'yellow', name: 'Yellow', swatch: 'bg-yellow-400' },
  { id: 'green', name: 'Green', swatch: 'bg-green-500' },
  { id: 'blue', name: 'Blue', swatch: 'bg-blue-500' },
  { id: 'purple', name: 'Purple', swatch: 'bg-purple-500' },
];

export const LABEL_IDS = LABELS.map((l) => l.id);

export function getLabel(id) {
  return LABELS.find((l) => l.id === id);
}

export const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done'];

export const LIMITS = {
  boardName: 60,
  columnTitle: 60,
  cardTitle: 200,
  description: 2000,
};

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 MB is plenty for a board
