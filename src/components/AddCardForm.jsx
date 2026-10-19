import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, X } from 'lucide-react';
import { addCard } from '../features/boards/boardsSlice';
import { LIMITS } from '../utils/constants';

export default function AddCardForm({ columnId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const submit = (event) => {
    event?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    dispatch(addCard({ columnId, title: trimmed }));
    setTitle(''); // stay open so several cards can be added quickly
  };

  const close = () => {
    setOpen(false);
    setTitle('');
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-2 mb-2 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-slate-300/60 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Plus size={16} aria-hidden="true" />
        Add a card
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="px-2 pb-2">
      <textarea
        autoFocus
        rows={2}
        value={title}
        maxLength={LIMITS.cardTitle}
        placeholder="Enter a title for this card..."
        aria-label="Card title"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          } else if (event.key === 'Escape') {
            close();
          }
        }}
        className="input resize-none"
      />
      <div className="mt-2 flex items-center gap-2">
        <button type="submit" className="btn-primary" disabled={!title.trim()}>
          Add card
        </button>
        <button type="button" onClick={close} className="icon-btn" aria-label="Cancel adding a card">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
