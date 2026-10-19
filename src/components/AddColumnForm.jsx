import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, X } from 'lucide-react';
import { addColumn } from '../features/boards/boardsSlice';
import { LIMITS } from '../utils/constants';

// Sits at the end of the row of columns, with the same width as a column.
export default function AddColumnForm({ boardId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const close = () => {
    setOpen(false);
    setTitle('');
  };

  const submit = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    dispatch(addColumn({ boardId, title: trimmed }));
    close();
  };

  const widthClasses = 'w-[82vw] max-w-[20rem] shrink-0 sm:w-80';

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${widthClasses} flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400`}
      >
        <Plus size={16} aria-hidden="true" />
        Add another column
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={`${widthClasses} rounded-xl bg-slate-200/70 p-2 dark:bg-slate-900`}>
      <input
        autoFocus
        value={title}
        maxLength={LIMITS.columnTitle}
        placeholder="Column title"
        aria-label="Column title"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
        className="input"
      />
      <div className="mt-2 flex items-center gap-2">
        <button type="submit" className="btn-primary" disabled={!title.trim()}>
          Add column
        </button>
        <button type="button" onClick={close} className="icon-btn" aria-label="Cancel adding a column">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
