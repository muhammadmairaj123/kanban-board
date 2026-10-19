# Kanban Board

A Trello-style Kanban board built with **React**, **Redux Toolkit** and **dnd-kit**. Create multiple boards, organize work in columns and cards, and drag everything around with the mouse, touch or keyboard. No backend and no setup: all data is saved in your browser's `localStorage`.

> Add a live demo link here after deploying, for example: `https://your-kanban-board.vercel.app`

## Features

**Boards**
- Create, rename and delete multiple boards (home page at `/`, each board at `/board/:boardId`)
- A 404 page for unknown routes and for board ids that do not exist
- Export a board to a JSON file and import it back as a new board (with validation)
- A demo "Welcome Board" is created on first launch, so the app never looks empty

**Columns**
- Add, rename (click the title) and delete columns, with a confirm dialog before deleting
- Drag and drop to reorder columns horizontally

**Cards**
- Add, edit and delete cards
- Drag and drop to reorder inside a column and to move between columns, including into empty columns
- Details window with title, description, priority (Low / Medium / High), due date, colored labels and created date
- Badges on the card: priority, due date (overdue is highlighted) and label colors

**Search and filter** (per board): by text, by priority and by label

**Experience**
- Dark and light mode, saved in `localStorage`, follows the system setting by default (no flash on load)
- Responsive layout: columns scroll sideways on small screens
- Touch friendly drag (press and hold to drag, a quick swipe still scrolls)
- Keyboard accessible: focus a card or a column grip, press Space or Enter, move with the arrow keys, drop with Space or Enter, cancel with Escape
- Smooth drag overlay, empty states, hover and focus styles, toasts and confirm dialogs

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | React 18 + Vite 5 (JavaScript) |
| State | Redux Toolkit + react-redux |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Icons | lucide-react |
| IDs | nanoid |
| Persistence | `localStorage` (debounced, validated on load) |

## Screenshots

_Add your screenshots here after you run the app:_

| Home | Board | Card details | Dark mode |
| --- | --- | --- | --- |
| `docs/home.png` | `docs/board.png` | `docs/card-modal.png` | `docs/dark.png` |

## Getting started

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build     # production build in /dist
npm run preview   # serve the production build locally
```

## Deployment

The app is a static site, so it deploys to Vercel or Netlify without any settings.
Both are already configured for client-side routing (`vercel.json` and `public/_redirects`), so opening `/board/123` directly works after deploying.

## Project structure

```
src/
  app/
    store.js                 Redux store, loading and debounced saving to localStorage
  features/
    boards/
      boardsSlice.js         Normalized state + all board / column / card actions
      selectors.js           Selectors (createSelector) and the filter helper
    ui/
      uiSlice.js             Theme, search/filter values and toast message
  hooks/
    useBoardDnd.js           All drag and drop logic (sensors, collisions, drag events)
  components/
    Navbar, ThemeToggle, Toast
    BoardCard                A board tile on the home page
    Column, Card             Sortable column and card (+ look-only versions for DragOverlay)
    CardModal                Card details and edit window
    AddColumnForm, AddCardForm
    FilterBar
    ConfirmDialog, Modal     Reusable dialog shell
    EditableTitle            Rename-in-place input
    CardBadges               Priority, due date and label display
    ImportBoardButton
  pages/
    HomePage, BoardPage, NotFoundPage
  utils/
    localStorage.js          Safe localStorage wrappers
    seedData.js              Demo board for first launch
    boardIO.js               Validate saved data, export and import JSON
    constants.js, dates.js
  App.jsx, main.jsx, index.css
```

## Key technical decisions

**Why Redux Toolkit?**
The same data is used by many distant components (home page, columns, cards, modal, filters). A single store avoids passing props down several levels. Redux Toolkit removes the boilerplate: `createSlice` writes the reducers with plain "mutating" code (Immer makes it immutable), and the Redux DevTools work out of the box.

**Normalized state.**
Boards, columns and cards are stored once, by id, with order arrays (`columnOrder`, `cardIds`). Moving a card then only edits two small arrays and one `columnId`, instead of copying a deeply nested tree. A single `moveCard` reducer handles both reordering inside a column and moving to another column.

**Why dnd-kit?**
It is modern, small, works with hooks, supports mouse, touch and keyboard, and is accessible by design. `react-beautiful-dnd` is no longer maintained and does not support React 18 strict mode well.

**Drag state stays local until the drop.**
While dragging, a temporary copy of the card lists is moved around in React state, so the UI updates live. Redux receives exactly **one** `moveCard` action when the card is dropped. That keeps the store clean, avoids saving on every pixel, and makes cancelling (Escape) trivial.

**Empty columns are drop targets.**
Each column is itself a droppable, and a custom collision function picks the column when it has no cards, or the nearest card when it has.

**Touch and mouse are separated.**
Mouse drag starts after moving 6 px (so clicks still work). Touch drag starts after a 220 ms press, so a quick swipe still scrolls the board.

**Safe persistence.**
Saving is debounced (300 ms) and also runs when the tab closes. On load, the saved data is validated (shape and that every referenced id exists); if anything is wrong the app falls back to the demo data instead of crashing.

**Safe import.**
Imported JSON is treated as untrusted: fields are validated and trimmed, unknown values fall back to defaults, the file size is limited, and all ids are regenerated so an import can never overwrite existing data.

## Known limitations

- Data lives only in this browser. Clearing site data removes it. Use Export to back up a board.
- Cards cannot be dragged while a search or filter is active (the visible list is only part of the real list, so positions would be wrong). Clear the filters to drag again.

## Future improvements

- User accounts and a real backend / database (for example Firebase or Supabase) with sync across devices
- Real-time collaboration
- Checklists, comments and attachments on cards
- Undo / redo
- Migrate to TypeScript
- Unit tests for the reducers (Vitest) and component tests (React Testing Library)
- Drag cards while filters are active
