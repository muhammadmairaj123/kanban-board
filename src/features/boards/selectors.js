import { createSelector } from '@reduxjs/toolkit';

// Simple "pick a piece of state" selectors.
export const selectBoardOrder = (state) => state.boards.boardOrder;
export const selectBoardsMap = (state) => state.boards.boards;
export const selectColumnsMap = (state) => state.boards.columns;
export const selectCardsMap = (state) => state.boards.cards;

export const selectBoardById = (state, boardId) => state.boards.boards[boardId];

// Boards for the home page, with counts. createSelector caches the result, so the list
// is only rebuilt when boards, columns or the order really change.
export const selectBoardSummaries = createSelector(
  [selectBoardOrder, selectBoardsMap, selectColumnsMap],
  (boardOrder, boards, columns) =>
    boardOrder.map((id) => {
      const board = boards[id];
      const cardCount = board.columnOrder.reduce(
        (total, columnId) => total + columns[columnId].cardIds.length,
        0,
      );
      return {
        id: board.id,
        name: board.name,
        createdAt: board.createdAt,
        columnCount: board.columnOrder.length,
        cardCount,
      };
    }),
);

// The columns of one board, in order. Takes (state, boardId).
export const selectBoardColumns = createSelector(
  [selectBoardsMap, selectColumnsMap, (_state, boardId) => boardId],
  (boards, columns, boardId) => {
    const board = boards[boardId];
    return board ? board.columnOrder.map((columnId) => columns[columnId]) : [];
  },
);

// --- UI state (theme and filters) ---------------------------------------------
export const selectTheme = (state) => state.ui.theme;
export const selectFilters = (state) => state.ui.filters;
export const selectToast = (state) => state.ui.toast;

export function hasActiveFilters(filters) {
  return filters.text.trim() !== '' || filters.priority !== 'all' || filters.label !== 'all';
}

// Pure helper: does a card pass the current filters?
export function matchesFilters(card, filters) {
  if (filters.priority !== 'all' && card.priority !== filters.priority) return false;
  if (filters.label !== 'all' && !card.labels.includes(filters.label)) return false;

  const query = filters.text.trim().toLowerCase();
  if (query) {
    const haystack = `${card.title} ${card.description}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}
