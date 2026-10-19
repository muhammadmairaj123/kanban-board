import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Trash2, X } from 'lucide-react';
import { updateCard } from '../features/boards/boardsSlice';
import { LABELS, LIMITS, PRIORITIES } from '../utils/constants';
import { formatDateTime } from '../utils/dates';
import Modal from './Modal';

// Details / edit window for one card.
// We edit a local copy ("draft") and only write to Redux when the user clicks Save,
// so Cancel or Escape really does throw the changes away.
export default function CardModal({ card, columnTitle, onClose, onRequestDelete }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [labels, setLabels] = useState(card.labels);

  const canSave = title.trim() !== '';

  const toggleLabel = (id) => {
    setLabels((current) => (current.includes(id) ? current.filter((l) => l !== id) : [...current, id]));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    dispatch(updateCard({ id: card.id, changes: { title, description, priority, dueDate, labels } }));
    onClose();
  };

  return (
    <Modal title="Card details" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Card details</h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              In column <span className="font-medium">{columnTitle}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="card-title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="card-title"
              autoFocus
              value={title}
              maxLength={LIMITS.cardTitle}
              onChange={(event) => setTitle(event.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="card-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="card-description"
              rows={4}
              value={description}
              maxLength={LIMITS.description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a more detailed description..."
              className="input resize-y"
            />
          </div>

          <fieldset>
            <legend className="mb-1 text-sm font-medium">Priority</legend>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={priority === option.value}
                  onClick={() => setPriority(option.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    priority === option.value
                      ? option.active
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="card-due" className="mb-1 block text-sm font-medium">
              Due date
            </label>
            <div className="flex items-center gap-2">
              <input
                id="card-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="input w-auto"
              />
              {dueDate && (
                <button type="button" onClick={() => setDueDate('')} className="btn-secondary">
                  Clear
                </button>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="mb-1 text-sm font-medium">Labels</legend>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((label) => {
                const selected = labels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleLabel(label.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${label.swatch}`} aria-hidden="true" />
                    {label.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="text-xs text-slate-500 dark:text-slate-400">Created {formatDateTime(card.createdAt)}</p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onRequestDelete(card)}
            className="btn-secondary text-rose-600 dark:text-rose-400"
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!canSave}>
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
