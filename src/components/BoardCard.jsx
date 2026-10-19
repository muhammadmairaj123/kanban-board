import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { renameBoard } from '../features/boards/boardsSlice';
import { LIMITS } from '../utils/constants';
import EditableTitle from './EditableTitle';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// One tile on the home page.
export default function BoardCard({ board, onRequestDelete }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  const created = new Date(board.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' });

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-2">
        {editing ? (
          <EditableTitle
            value={board.name}
            label="Board name"
            maxLength={LIMITS.boardName}
            onSave={(name) => {
              dispatch(renameBoard({ id: board.id, name }));
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          // "Stretched link": the ::after layer covers the whole tile, so the entire card is
          // clickable while the rename/delete buttons (z-10) stay separate, valid buttons.
          <Link
            to={`/board/${board.id}`}
            className="min-w-0 flex-1 truncate text-base font-semibold after:absolute after:inset-0 after:content-['']"
          >
            {board.name}
          </Link>
        )}

        {!editing && (
          <div className="relative z-10 flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="icon-btn"
              aria-label={`Rename board ${board.name}`}
            >
              <Pencil size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(board)}
              className="icon-btn hover:text-rose-600 dark:hover:text-rose-400"
              aria-label={`Delete board ${board.name}`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {plural(board.columnCount, 'column')} · {plural(board.cardCount, 'card')}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Created {created}</p>
    </div>
  );
}
