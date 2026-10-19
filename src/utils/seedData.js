import { nanoid } from 'nanoid';
import { addDaysISO } from './dates';

// Demo data shown on the very first launch, so the app never looks empty.
// It uses the same normalized shape as the Redux state:
// boards / columns / cards are stored by id, plus order arrays.
export function createSeedState() {
  const now = new Date().toISOString();
  const boardId = nanoid();
  const todoId = nanoid();
  const progressId = nanoid();
  const doneId = nanoid();

  const makeCard = (columnId, fields) => ({
    id: nanoid(),
    columnId,
    description: '',
    priority: 'medium',
    dueDate: '',
    labels: [],
    createdAt: now,
    ...fields,
  });

  const todoCards = [
    makeCard(todoId, {
      title: 'Open this card',
      description: 'Click any card to see its details. You can edit the title, description, priority, due date and labels.',
      priority: 'medium',
      dueDate: addDaysISO(3),
      labels: ['blue'],
    }),
    makeCard(todoId, {
      title: 'Drag me to another column',
      description: 'Cards can be reordered inside a column or moved between columns. Try it with the mouse, with touch, or with the keyboard (focus a card, press Space, then use the arrow keys).',
      priority: 'high',
      dueDate: addDaysISO(1),
      labels: ['red', 'orange'],
    }),
    makeCard(todoId, {
      title: 'Create your own board',
      description: 'Go back to the home page and create a new board for your own project.',
      priority: 'low',
      labels: ['green'],
    }),
  ];

  const progressCards = [
    makeCard(progressId, {
      title: 'Try search and filters',
      description: 'Use the search box and the priority / label filters above the board.',
      priority: 'medium',
      dueDate: addDaysISO(2),
      labels: ['purple'],
    }),
  ];

  const doneCards = [
    makeCard(doneId, {
      title: 'Install the app',
      description: 'You already did this. Nice work!',
      priority: 'low',
      labels: ['green'],
    }),
  ];

  const columnsList = [
    { id: todoId, boardId, title: 'To Do', cards: todoCards },
    { id: progressId, boardId, title: 'In Progress', cards: progressCards },
    { id: doneId, boardId, title: 'Done', cards: doneCards },
  ];

  const columns = {};
  const cards = {};
  columnsList.forEach(({ cards: columnCards, ...column }) => {
    columns[column.id] = { ...column, cardIds: columnCards.map((card) => card.id) };
    columnCards.forEach((card) => {
      cards[card.id] = card;
    });
  });

  return {
    boards: {
      [boardId]: {
        id: boardId,
        name: 'Welcome Board',
        createdAt: now,
        columnOrder: [todoId, progressId, doneId],
      },
    },
    boardOrder: [boardId],
    columns,
    cards,
  };
}
