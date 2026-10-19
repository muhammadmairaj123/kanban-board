import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { renameColumn } from '../features/boards/boardsSlice';
import { LIMITS } from '../utils/constants';
import AddCardForm from './AddCardForm';
import Card, { CardView } from './Card';
import EditableTitle from './EditableTitle';

const COLUMN_CLASSES =
  'flex max-h-full w-[82vw] max-w-[20rem] shrink-0 flex-col rounded-xl bg-slate-200/70 dark:bg-slate-900 sm:w-80';

function CountPill({ shown, total }) {
  return (
    <span className="rounded-full bg-slate-300/70 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {shown === total ? total : `${shown}/${total}`}
    </span>
  );
}

// The real column on the board: sortable (can be dragged left/right) and holds sortable cards.
export default function Column({ column, cardIds, cards, totalCount, filtering, onOpenCard, onRequestDelete }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      data: { type: 'column' }, // lets the drag handlers tell columns and cards apart
    });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const visibleCards = cardIds.map((id) => cards[id]).filter(Boolean);

  return (
    // The whole <section> is the sortable/droppable node. Being droppable is what lets a card be
    // dropped into an EMPTY column: there are no cards to hover over, so the column itself is the target.
    <section
      ref={setNodeRef}
      style={style}
      aria-label={`Column: ${column.title}`}
      className={`${COLUMN_CLASSES} ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-1 px-2 pb-1 pt-2">
        {/* Only this grip starts a column drag, so typing, clicking cards and the
            rename input never accidentally drag the whole column. */}
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder column ${column.title}`}
          className="icon-btn cursor-grab touch-none active:cursor-grabbing"
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>

        {editing ? (
          <EditableTitle
            value={column.title}
            label="Column title"
            maxLength={LIMITS.columnTitle}
            className="py-1 font-semibold"
            onSave={(title) => {
              dispatch(renameColumn({ id: column.id, title }));
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            title="Click to rename"
            className="min-w-0 flex-1 truncate rounded px-1 py-1 text-left text-sm font-semibold"
          >
            {column.title}
          </button>
        )}

        <CountPill shown={visibleCards.length} total={totalCount} />
        <button
          type="button"
          onClick={() => onRequestDelete(column)}
          aria-label={`Delete column ${column.title}`}
          className="icon-btn hover:text-rose-600 dark:hover:text-rose-400"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[3.5rem] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 pt-1">
          {visibleCards.map((card) => (
            // While filters are on, the visible cards are only a subset of the real list,
            // so their positions would be wrong. Dragging is paused instead of guessing.
            <Card key={card.id} card={card} onOpen={onOpenCard} disabled={filtering} />
          ))}
          {visibleCards.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {filtering && totalCount > 0 ? 'No cards match the filters' : 'No cards yet. Drop one here or add a new card.'}
            </p>
          )}
        </div>
      </SortableContext>

      <AddCardForm columnId={column.id} />
    </section>
  );
}

// The floating copy shown in the <DragOverlay> while a whole column is being dragged.
// It is static (no hooks), so it never clashes with the real column's ids.
export function ColumnOverlay({ column, cards }) {
  return (
    <section
      className={`${COLUMN_CLASSES} rotate-1 cursor-grabbing shadow-2xl ring-2 ring-indigo-400`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1 px-3 pb-1 pt-3">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{column.title}</span>
        <CountPill shown={cards.length} total={cards.length} />
      </div>
      <div className="flex flex-col gap-2 overflow-hidden px-2 pb-3 pt-1">
        {cards.map((card) => (
          <CardView key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
