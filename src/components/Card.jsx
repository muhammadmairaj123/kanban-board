import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil } from 'lucide-react';
import { DueDateBadge, LabelChips, PriorityBadge } from './CardBadges';

// CardView is ONLY the look of a card. It is used twice:
//   1) inside <Card> below (the real, sortable card in a column)
//   2) inside <DragOverlay> (the floating copy that follows the pointer while dragging)
// Splitting look from behavior keeps the overlay free of drag hooks, which would otherwise
// register the same id twice.
export const CardView = forwardRef(function CardView(
  { card, isDragging = false, isOverlay = false, onEdit, className = '', ...rest },
  ref,
) {
  const stateClasses = isOverlay
    ? 'rotate-2 cursor-grabbing border-indigo-400 shadow-xl'
    : 'border-slate-200 hover:border-indigo-300 hover:shadow dark:border-slate-700 dark:hover:border-indigo-500';

  return (
    <div
      ref={ref}
      {...rest}
      className={`group relative rounded-lg border bg-white p-3 text-left shadow-sm transition-shadow dark:bg-slate-800 ${stateClasses} ${
        isDragging ? 'opacity-40' : ''
      } ${className}`}
    >
      <LabelChips labels={card.labels} />
      <p className={`break-words pr-6 text-sm font-medium ${card.labels.length > 0 ? 'mt-2' : ''}`}>
        {card.title}
      </p>
      {card.description && (
        <p className="mt-1 line-clamp-2 break-words text-xs text-slate-500 dark:text-slate-400">
          {card.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={card.priority} />
        <DueDateBadge dueDate={card.dueDate} />
      </div>

      {onEdit && (
        // Keyboard users cannot "click" the card (Enter/Space start a keyboard drag),
        // so this real button gives them a way to open the details.
        <button
          type="button"
          aria-label={`Edit card: ${card.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(card.id);
          }}
          className="icon-btn absolute right-1.5 top-1.5 h-6 w-6 opacity-0 transition-opacity focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

// The real card: CardView + dnd-kit's sortable behavior.
export default function Card({ card, onOpen, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' }, // lets the drag handlers tell cards and columns apart
    disabled,
  });

  // dnd-kit gives us a transform while neighbours make room; CSS.Transform turns it into a string.
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <CardView
      ref={setNodeRef}
      style={style}
      card={card}
      isDragging={isDragging}
      onEdit={onOpen}
      // A plain click opens the details. The drag sensors only start a drag after the pointer
      // has moved a few pixels, so a normal click never turns into a drag.
      onClick={() => onOpen(card.id)}
      className={disabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
      {...attributes}
      {...listeners}
    />
  );
}
