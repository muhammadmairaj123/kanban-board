import { Trash2 } from 'lucide-react';
import Modal from './Modal';

// Asks "are you sure?" before anything is deleted.
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} widthClass="max-w-sm">
      <div className="p-5">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
          <Trash2 size={20} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          {/* The safe option gets the initial focus, so Enter will not delete by accident. */}
          <button type="button" autoFocus onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
