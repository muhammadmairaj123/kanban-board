import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import {
  deleteCard,
  deleteColumn,
  renameBoard,
} from '../features/boards/boardsSlice';
import { resetFilters, showToast } from '../features/ui/uiSlice';
import {
  hasActiveFilters,
  matchesFilters,
  selectBoardById,
  selectBoardColumns,
  selectCardsMap,
  selectFilters,
} from '../features/boards/selectors';
import { useBoardDnd } from '../hooks/useBoardDnd';
import { downloadJson, exportBoard, slugify } from '../utils/boardIO';
import { LIMITS } from '../utils/constants';
import AddColumnForm from '../components/AddColumnForm';
import { CardView } from '../components/Card';
import CardModal from '../components/CardModal';
import Column, { ColumnOverlay } from '../components/Column';
import ConfirmDialog from '../components/ConfirmDialog';
import EditableTitle from '../components/EditableTitle';
import FilterBar from '../components/FilterBar';
import ImportBoardButton from '../components/ImportBoardButton';
import NotFoundPage from './NotFoundPage';

// Router entry point. Splitting "does the board exist?" from the board UI means BoardView
// never has to deal with a missing board (and hooks are never called conditionally).
export default function BoardPage() {
  const { boardId } = useParams();
  const board = useSelector((state) => selectBoardById(state, boardId));

  if (!board) {
    return (
      <NotFoundPage
        title="Board not found"
        message="This board does not exist. It may have been deleted, or the link is wrong."
      />
    );
  }
  // `key` makes React start with fresh local state when navigating from one board to another.
  return <BoardView key={board.id} board={board} />;
}

function BoardView({ board }) {
  const dispatch = useDispatch();
  const store = useStore();

  const columns = useSelector((state) => selectBoardColumns(state, board.id));
  const cards = useSelector(selectCardsMap);
  const filters = useSelector(selectFilters);
  const filtering = hasActiveFilters(filters);

  const dnd = useBoardDnd({ boardId: board.id, columns, cards });

  const [renaming, setRenaming] = useState(false);
  const [openCardId, setOpenCardId] = useState(null);
  const [confirm, setConfirm] = useState(null); // what is waiting for "are you sure?"

  // Filters are shared UI state, so clear them when leaving the board.
  useEffect(() => () => dispatch(resetFilters()), [dispatch]);

  const openCard = openCardId ? cards[openCardId] : null;
  const openCardColumn = openCard ? store.getState().boards.columns[openCard.columnId] : null;

  const handleExport = () => {
    const data = exportBoard(store.getState().boards, board.id);
    downloadJson(`${slugify(board.name)}.json`, data);
    dispatch(showToast('Board exported as JSON'));
  };

  const requestDeleteColumn = (column) => {
    const count = column.cardIds.length;
    setConfirm({
      kind: 'column',
      id: column.id,
      title: `Delete "${column.title}"?`,
      message:
        count > 0
          ? `This column and its ${count} ${count === 1 ? 'card' : 'cards'} will be permanently deleted.`
          : 'This empty column will be permanently deleted.',
    });
  };

  const requestDeleteCard = (card) => {
    setConfirm({
      kind: 'card',
      id: card.id,
      title: 'Delete this card?',
      message: `"${card.title}" will be permanently deleted.`,
    });
  };

  const confirmDelete = () => {
    if (confirm.kind === 'column') {
      dispatch(deleteColumn(confirm.id));
      dispatch(showToast('Column deleted'));
    } else {
      dispatch(deleteCard(confirm.id));
      setOpenCardId(null);
      dispatch(showToast('Card deleted'));
    }
    setConfirm(null);
  };

  // Which cards does each column show? While filtering we hide the non-matching ones.
  const visibleCardIds = (column) => {
    const ids = dnd.items[column.id] ?? column.cardIds;
    return filtering ? ids.filter((id) => cards[id] && matchesFilters(cards[id], filters)) : ids;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-3 px-4 pb-3 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/" className="btn-secondary" aria-label="Back to all boards">
              <ArrowLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Boards</span>
            </Link>
            {renaming ? (
              <EditableTitle
                value={board.name}
                label="Board name"
                maxLength={LIMITS.boardName}
                className="text-lg font-bold"
                onSave={(name) => {
                  dispatch(renameBoard({ id: board.id, name }));
                  setRenaming(false);
                }}
                onCancel={() => setRenaming(false)}
              />
            ) : (
              <>
                <h1 className="truncate text-xl font-bold">{board.name}</h1>
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  className="icon-btn"
                  aria-label="Rename board"
                  title="Rename board"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleExport} className="btn-secondary">
              <Download size={16} aria-hidden="true" />
              Export
            </button>
            <ImportBoardButton />
          </div>
        </div>

        <FilterBar />
        {filtering && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Moving cards is paused while filters are on. Clear the filters to drag cards again.
          </p>
        )}
      </div>

      <DndContext
        sensors={dnd.sensors}
        collisionDetection={dnd.collisionDetection}
        // Re-measure drop zones while dragging, because columns grow and shrink as cards move.
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        accessibility={{ announcements: dnd.announcements }}
        onDragStart={dnd.handlers.onDragStart}
        onDragOver={dnd.handlers.onDragOver}
        onDragEnd={dnd.handlers.onDragEnd}
        onDragCancel={dnd.handlers.onDragCancel}
      >
        <SortableContext items={columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
          {/* This row scrolls sideways on small screens. */}
          <div className="flex min-h-0 flex-1 items-start gap-3 overflow-x-auto px-4 pb-4 pt-1 sm:px-6">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cardIds={visibleCardIds(column)}
                cards={cards}
                totalCount={(dnd.items[column.id] ?? column.cardIds).length}
                filtering={filtering}
                onOpenCard={setOpenCardId}
                onRequestDelete={requestDeleteColumn}
              />
            ))}
            <AddColumnForm boardId={board.id} />
          </div>
        </SortableContext>

        {/* The floating copy that follows the pointer while dragging. */}
        <DragOverlay>
          {dnd.activeCard ? (
            <CardView card={dnd.activeCard} isOverlay />
          ) : dnd.activeColumn ? (
            <ColumnOverlay
              column={dnd.activeColumn}
              cards={dnd.activeColumn.cardIds.map((id) => cards[id]).filter(Boolean)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {openCard && (
        <CardModal
          key={openCard.id}
          card={openCard}
          columnTitle={openCardColumn?.title ?? ''}
          onClose={() => setOpenCardId(null)}
          onRequestDelete={requestDeleteCard}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
