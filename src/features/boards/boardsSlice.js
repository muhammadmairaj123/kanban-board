import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { DEFAULT_COLUMNS, LABEL_IDS, LIMITS, PRIORITY_VALUES } from '../../utils/constants';
import { isValidISODate } from '../../utils/dates';

// ---------------------------------------------------------------------------
// State shape (normalized: every entity is stored once, by id)
//
// {
//   boardOrder: [boardId, ...],                 // order shown on the home page
//   boards:  { [id]: { id, name, createdAt, columnOrder: [columnId, ...] } },
//   columns: { [id]: { id, boardId, title, cardIds: [cardId, ...] } },
//   cards:   { [id]: { id, columnId, title, description, priority, dueDate, labels, createdAt } },
// }
//
// WHY normalized? Moving a card between columns only touches two small arrays of ids
// and one `columnId` field. With nested data we would have to copy big trees around.
// ---------------------------------------------------------------------------

const initialState = {
  boardOrder: [],
  boards: {},
  columns: {},
  cards: {},
};

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

// Move an item inside an array (used for column reordering).
function moveInArray(array, fromIndex, toIndex) {
  const [item] = array.splice(fromIndex, 1);
  array.splice(toIndex, 0, item);
}

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    // --- Boards -----------------------------------------------------------
    addBoard: {
      // Reducers must be pure (no random values), so ids and dates are created in `prepare`.
      prepare(name) {
        const boardId = nanoid();
        const columns = DEFAULT_COLUMNS.map((title) => ({
          id: nanoid(),
          boardId,
          title,
          cardIds: [],
        }));
        return {
          payload: {
            board: {
              id: boardId,
              name: clean(name, LIMITS.boardName),
              createdAt: new Date().toISOString(),
              columnOrder: columns.map((column) => column.id),
            },
            columns,
          },
        };
      },
      reducer(state, action) {
        const { board, columns } = action.payload;
        if (!board.name) return;
        state.boards[board.id] = board;
        state.boardOrder.push(board.id);
        columns.forEach((column) => {
          state.columns[column.id] = column;
        });
      },
    },

    // Used by "Import board": the payload is already validated and normalized by buildImportedBoard().
    importBoard(state, action) {
      const { board, columns, cards } = action.payload;
      state.boards[board.id] = board;
      state.boardOrder.push(board.id);
      columns.forEach((column) => {
        state.columns[column.id] = column;
      });
      cards.forEach((card) => {
        state.cards[card.id] = card;
      });
    },

    renameBoard(state, action) {
      const { id, name } = action.payload;
      const board = state.boards[id];
      const trimmed = clean(name, LIMITS.boardName);
      if (board && trimmed) board.name = trimmed;
    },

    deleteBoard(state, action) {
      const board = state.boards[action.payload];
      if (!board) return;
      // Delete children first, otherwise orphaned columns/cards would stay in storage forever.
      board.columnOrder.forEach((columnId) => {
        const column = state.columns[columnId];
        if (column) column.cardIds.forEach((cardId) => delete state.cards[cardId]);
        delete state.columns[columnId];
      });
      state.boardOrder = state.boardOrder.filter((id) => id !== board.id);
      delete state.boards[board.id];
    },

    // --- Columns ----------------------------------------------------------
    addColumn: {
      prepare({ boardId, title }) {
        return { payload: { id: nanoid(), boardId, title } };
      },
      reducer(state, action) {
        const { id, boardId, title } = action.payload;
        const board = state.boards[boardId];
        const trimmed = clean(title, LIMITS.columnTitle);
        if (!board || !trimmed) return;
        state.columns[id] = { id, boardId, title: trimmed, cardIds: [] };
        board.columnOrder.push(id);
      },
    },

    renameColumn(state, action) {
      const { id, title } = action.payload;
      const column = state.columns[id];
      const trimmed = clean(title, LIMITS.columnTitle);
      if (column && trimmed) column.title = trimmed;
    },

    deleteColumn(state, action) {
      const column = state.columns[action.payload];
      if (!column) return;
      const board = state.boards[column.boardId];
      if (board) board.columnOrder = board.columnOrder.filter((id) => id !== column.id);
      // A column owns its cards, so they are deleted with it.
      column.cardIds.forEach((cardId) => delete state.cards[cardId]);
      delete state.columns[column.id];
    },

    // Reorder columns. We receive the dragged column id and the id of the column it was dropped on.
    moveColumn(state, action) {
      const { boardId, activeId, overId } = action.payload;
      const board = state.boards[boardId];
      if (!board) return;
      const fromIndex = board.columnOrder.indexOf(activeId);
      const toIndex = board.columnOrder.indexOf(overId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
      moveInArray(board.columnOrder, fromIndex, toIndex);
    },

    // --- Cards ------------------------------------------------------------
    addCard: {
      prepare({ columnId, title }) {
        return { payload: { id: nanoid(), columnId, title, createdAt: new Date().toISOString() } };
      },
      reducer(state, action) {
        const { id, columnId, title, createdAt } = action.payload;
        const column = state.columns[columnId];
        const trimmed = clean(title, LIMITS.cardTitle);
        if (!column || !trimmed) return;
        state.cards[id] = {
          id,
          columnId,
          title: trimmed,
          description: '',
          priority: 'medium',
          dueDate: '',
          labels: [],
          createdAt,
        };
        column.cardIds.push(id);
      },
    },

    // Only whitelisted fields can be changed, and each one is validated.
    updateCard(state, action) {
      const { id, changes } = action.payload;
      const card = state.cards[id];
      if (!card) return;

      if ('title' in changes) {
        const title = clean(changes.title, LIMITS.cardTitle);
        if (title) card.title = title;
      }
      if ('description' in changes) {
        card.description = clean(changes.description, LIMITS.description);
      }
      if ('priority' in changes && PRIORITY_VALUES.includes(changes.priority)) {
        card.priority = changes.priority;
      }
      if ('dueDate' in changes) {
        card.dueDate = isValidISODate(changes.dueDate) ? changes.dueDate : '';
      }
      if ('labels' in changes && Array.isArray(changes.labels)) {
        card.labels = [...new Set(changes.labels.filter((label) => LABEL_IDS.includes(label)))];
      }
    },

    deleteCard(state, action) {
      const card = state.cards[action.payload];
      if (!card) return;
      const column = state.columns[card.columnId];
      if (column) column.cardIds = column.cardIds.filter((id) => id !== card.id);
      delete state.cards[card.id];
    },

    // One reducer handles BOTH cases: reordering inside a column and moving to another column.
    // `toIndex` is the position the card should have in the destination column AFTER the move.
    moveCard(state, action) {
      const { cardId, toColumnId, toIndex } = action.payload;
      const card = state.cards[cardId];
      const toColumn = state.columns[toColumnId];
      if (!card || !toColumn) return;

      // Step 1: take the card out of its current column. If source and destination are the
      // same column, this is what makes `toIndex` mean "final position".
      const fromColumn = state.columns[card.columnId];
      if (fromColumn) {
        fromColumn.cardIds = fromColumn.cardIds.filter((id) => id !== cardId);
      }

      // Step 2: insert it into the destination. The index is clamped so a bad value
      // (for example from dropping onto an empty column) can never break the array.
      // (If source and destination are the same column, `toColumn` is the same object as
      // `fromColumn`, so it already sees the card removed in step 1.)
      const index = clamp(toIndex, 0, toColumn.cardIds.length);
      toColumn.cardIds.splice(index, 0, cardId);

      // Step 3: keep the card's own pointer to its column in sync.
      card.columnId = toColumnId;
    },
  },
});

export const {
  addBoard,
  importBoard,
  renameBoard,
  deleteBoard,
  addColumn,
  renameColumn,
  deleteColumn,
  moveColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
} = boardsSlice.actions;

export default boardsSlice.reducer;
