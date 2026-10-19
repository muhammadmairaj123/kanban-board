import { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { moveCard, moveColumn } from '../features/boards/boardsSlice';

// ---------------------------------------------------------------------------
// All the drag and drop logic for one board lives in this hook.
//
// THE KEY IDEA
// While a card is being dragged we do NOT write to Redux on every pixel.
// Instead we keep a temporary copy of the card lists (`dragItems`) in local state and
// move the card around in that copy, so the UI updates live. When the user drops, we
// compare the copy with the real state and dispatch ONE `moveCard` action.
// Benefits: one history entry, one save to localStorage, and cancelling (Escape) is
// trivial: we just throw the copy away.
// ---------------------------------------------------------------------------

// The PointerSensor also reacts to touch. We want touch to be handled ONLY by the
// TouchSensor (long press to drag), so that a quick swipe still scrolls the board.
// So this version of PointerSensor ignores touch pointers.
class MousePointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }, { onActivation }) => {
        if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return false;
        onActivation?.({ event });
        return true;
      },
    },
  ];
}

// Which column currently holds this id? A column id counts as "its own container".
function findContainer(id, items) {
  if (id in items) return id;
  return Object.keys(items).find((columnId) => items[columnId].includes(id));
}

export function useBoardDnd({ boardId, columns, cards }) {
  const dispatch = useDispatch();

  // The real card order, straight from Redux: { [columnId]: [cardId, ...] }
  const baseItems = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.id, column.cardIds])),
    [columns],
  );

  const [dragItems, setDragItems] = useState(null); // temporary copy, only while dragging a card
  const [active, setActive] = useState(null); // { type: 'card' | 'column', id }

  const items = dragItems ?? baseItems;

  // The collision function must always see the newest items, so we read them from a ref.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // --- Sensors ---------------------------------------------------------------
  const sensors = useSensors(
    // Mouse and pen: the pointer must move 6px before a drag starts, so plain clicks still work.
    useSensor(MousePointerSensor, { activationConstraint: { distance: 6 } }),
    // Touch: press and hold for 220ms to drag. A quick swipe scrolls instead.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    // Keyboard: Space/Enter picks up, arrow keys move, Space/Enter drops, Escape cancels.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // --- Collision detection: "which thing is the dragged item over?" ---------
  const collisionDetection = useCallback((args) => {
    const type = args.active.data.current?.type;

    // Dragging a column: only other columns count as targets.
    if (type === 'column') {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.data.current?.type === 'column',
        ),
      });
    }

    // Dragging a card: first find what is under the pointer.
    const pointerHits = pointerWithin(args);
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    let overId = getFirstCollision(hits, 'id');
    if (overId == null) return [];

    // If that is a column that already has cards, refine the answer to the closest CARD
    // in it, so the dragged card slots in between cards. An empty column stays the target.
    const current = itemsRef.current;
    if (overId in current && current[overId].length > 0) {
      const closestCard = closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.id !== overId && current[overId].includes(container.id),
        ),
      });
      overId = closestCard[0]?.id ?? overId;
    }
    return [{ id: overId }];
  }, []);

  // --- Drag events -----------------------------------------------------------
  const onDragStart = ({ active: dragged }) => {
    const type = dragged.data.current?.type;
    setActive({ type, id: dragged.id });
    if (type === 'card') {
      // Make the temporary, editable copy (arrays are copied so we never mutate Redux state).
      setDragItems(
        Object.fromEntries(Object.entries(baseItems).map(([columnId, ids]) => [columnId, [...ids]])),
      );
    }
  };

  // Fires continuously while dragging. Here we only handle a card entering ANOTHER column,
  // by moving it into that column's list in the temporary copy.
  // (Reordering inside the same column is animated by dnd-kit itself and finalized on drop.)
  const onDragOver = ({ active: dragged, over }) => {
    if (!over || dragged.data.current?.type !== 'card') return;

    setDragItems((previous) => {
      if (!previous) return previous;
      const fromColumn = findContainer(dragged.id, previous);
      const toColumn = findContainer(over.id, previous);
      if (!fromColumn || !toColumn || fromColumn === toColumn) return previous;

      const toItems = previous[toColumn];
      let newIndex;
      if (over.id in previous) {
        // Hovering the column itself (it is empty, or we are below its last card): go to the end.
        newIndex = toItems.length;
      } else {
        // Hovering a card: insert before it, or after it if the dragged card is in its lower half.
        const overIndex = toItems.indexOf(over.id);
        const draggedRect = dragged.rect.current.translated;
        const isBelow = draggedRect && draggedRect.top > over.rect.top + over.rect.height / 2;
        newIndex = overIndex >= 0 ? overIndex + (isBelow ? 1 : 0) : toItems.length;
      }

      return {
        ...previous,
        [fromColumn]: previous[fromColumn].filter((id) => id !== dragged.id),
        [toColumn]: [...toItems.slice(0, newIndex), dragged.id, ...toItems.slice(newIndex)],
      };
    });
  };

  const onDragEnd = ({ active: dragged, over }) => {
    const type = dragged.data.current?.type;
    setActive(null);

    // Columns: one dispatch with the dragged column and the column it was dropped on.
    if (type === 'column') {
      if (over && over.id !== dragged.id) {
        dispatch(moveColumn({ boardId, activeId: dragged.id, overId: over.id }));
      }
      return;
    }

    if (type !== 'card' || !dragItems) return;
    const finalItems = dragItems;
    setDragItems(null); // from now on the UI shows the real (Redux) state again
    if (!over) return; // dropped outside of everything: nothing changes

    const toColumnId = findContainer(dragged.id, finalItems);
    const overColumnId = findContainer(over.id, finalItems);
    if (!toColumnId || !overColumnId) return;

    // Where should the card end up inside the destination column?
    let toIndex = finalItems[toColumnId].indexOf(dragged.id);
    if (toColumnId === overColumnId) {
      const overIndex = finalItems[overColumnId].indexOf(over.id);
      // overIndex is -1 when we dropped on the column itself (for example an empty column):
      // then the card simply keeps the index it already has in the copy.
      if (overIndex !== -1) toIndex = overIndex;
    }

    // Edge case: dropped back exactly where it started -> do not dispatch anything.
    const originalColumnId = cards[dragged.id].columnId;
    const originalIndex = baseItems[originalColumnId].indexOf(dragged.id);
    if (originalColumnId === toColumnId && originalIndex === toIndex) return;

    dispatch(moveCard({ cardId: dragged.id, toColumnId, toIndex }));
  };

  // Escape or lost drag: forget the temporary copy; Redux was never touched.
  const onDragCancel = () => {
    setActive(null);
    setDragItems(null);
  };

  // --- Friendlier screen reader announcements (default ones read out raw ids) ---
  const describe = (id) => {
    if (cards[id]) return `card ${cards[id].title}`;
    const column = columns.find((c) => c.id === id);
    return column ? `column ${column.title}` : 'item';
  };
  const announcements = {
    onDragStart: ({ active: a }) => `Picked up ${describe(a.id)}.`,
    onDragOver: ({ active: a, over }) => (over ? `${describe(a.id)} is over ${describe(over.id)}.` : undefined),
    onDragEnd: ({ active: a, over }) =>
      over ? `Dropped ${describe(a.id)} over ${describe(over.id)}.` : `Dropped ${describe(a.id)}.`,
    onDragCancel: ({ active: a }) => `Cancelled moving ${describe(a.id)}.`,
  };

  return {
    sensors,
    collisionDetection,
    items, // the card order to render (temporary copy while dragging)
    announcements,
    activeCard: active?.type === 'card' ? cards[active.id] : null,
    activeColumn: active?.type === 'column' ? columns.find((c) => c.id === active.id) : null,
    handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel },
  };
}
