import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../features/ui/uiSlice';
import { selectToast } from '../features/boards/selectors';

// A small message that appears at the bottom and disappears by itself.
export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(dismissToast()), 3500);
    // Cleanup: a new toast cancels the old timer, so the new one gets its full time.
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const color = toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800 dark:bg-slate-700';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className={`pointer-events-auto animate-pop-in rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${color}`}
      >
        {toast.message}
      </div>
    </div>
  );
}
