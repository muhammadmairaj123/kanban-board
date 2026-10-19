import { nanoid } from 'nanoid';
import {
  LABEL_IDS,
  LIMITS,
  PRIORITY_VALUES,
} from './constants';
import { isValidISODate } from './dates';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Trim and cap a string; anything that is not a string becomes ''.
const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// ---------------------------------------------------------------------------
// 1) Checking data that was loaded from localStorage
// ---------------------------------------------------------------------------

// Make sure the saved state has the right shape AND that every id it points to
// really exists. If anything is off, the caller falls back to the seed data
// instead of crashing the whole app on a corrupted save.
export function isValidBoardsState(state) {
  if (!isObject(state)) return false;
  if (!isObject(state.boards) || !isObject(state.columns) || !isObject(state.cards)) return false;
  if (!Array.isArray(state.boardOrder)) return false;
  if (!state.boardOrder.every((id) => isObject(state.boards[id]))) return false;

  for (const board of Object.values(state.boards)) {
    if (typeof board.name !== 'string' || !Array.isArray(board.columnOrder)) return false;
    if (!board.columnOrder.every((id) => isObject(state.columns[id]))) return false;
  }
  for (const column of Object.values(state.columns)) {
    if (typeof column.title !== 'string' || !Array.isArray(column.cardIds)) return false;
    if (!column.cardIds.every((id) => isObject(state.cards[id]))) return false;
  }
  for (const card of Object.values(state.cards)) {
    if (typeof card.title !== 'string' || !Array.isArray(card.labels)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// 2) Export: turn one board into a simple, human-readable nested object
// ---------------------------------------------------------------------------

export function exportBoard(boardsState, boardId) {
  const board = boardsState.boards[boardId];
  return {
    app: 'kanban-board',
    version: 1,
    name: board.name,
    exportedAt: new Date().toISOString(),
    columns: board.columnOrder.map((columnId) => {
      const column = boardsState.columns[columnId];
      return {
        title: column.title,
        cards: column.cardIds.map((cardId) => {
          const card = boardsState.cards[cardId];
          return {
            title: card.title,
            description: card.description,
            priority: card.priority,
            dueDate: card.dueDate,
            labels: card.labels,
            createdAt: card.createdAt,
          };
        }),
      };
    }),
  };
}

export function slugify(text) {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'board';
}

// Trigger a browser download without any server: create a temporary Blob URL and click a link.
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// 3) Import: validate untrusted JSON and turn it into normalized data
// ---------------------------------------------------------------------------

// The file is user-supplied, so we never trust it. Every field is cleaned, and all ids
// are generated fresh. That way importing the same file twice can never clash with existing data.
export function buildImportedBoard(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isObject(data) || typeof data.name !== 'string' || !Array.isArray(data.columns)) {
    throw new Error('That file is not a Kanban board export.');
  }

  const boardName = cleanText(data.name, LIMITS.boardName);
  if (!boardName) throw new Error('The board in that file has no name.');

  const boardId = nanoid();
  const columns = [];
  const cards = [];

  data.columns.forEach((rawColumn) => {
    if (!isObject(rawColumn)) return;
    const title = cleanText(rawColumn.title, LIMITS.columnTitle);
    if (!title) return;

    const columnId = nanoid();
    const cardIds = [];
    const rawCards = Array.isArray(rawColumn.cards) ? rawColumn.cards : [];

    rawCards.forEach((rawCard) => {
      if (!isObject(rawCard)) return;
      const cardTitle = cleanText(rawCard.title, LIMITS.cardTitle);
      if (!cardTitle) return;

      const cardId = nanoid();
      cardIds.push(cardId);
      cards.push({
        id: cardId,
        columnId,
        title: cardTitle,
        description: cleanText(rawCard.description, LIMITS.description),
        priority: PRIORITY_VALUES.includes(rawCard.priority) ? rawCard.priority : 'medium',
        dueDate: isValidISODate(rawCard.dueDate) ? rawCard.dueDate : '',
        labels: Array.isArray(rawCard.labels)
          ? [...new Set(rawCard.labels.filter((id) => LABEL_IDS.includes(id)))]
          : [],
        createdAt:
          typeof rawCard.createdAt === 'string' && !Number.isNaN(new Date(rawCard.createdAt).getTime())
            ? rawCard.createdAt
            : new Date().toISOString(),
      });
    });

    columns.push({ id: columnId, boardId, title, cardIds });
  });

  return {
    board: {
      id: boardId,
      name: boardName,
      createdAt: new Date().toISOString(),
      columnOrder: columns.map((column) => column.id),
    },
    columns,
    cards,
  };
}
