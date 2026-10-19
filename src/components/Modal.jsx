import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Generic modal shell used by the card details and the confirm dialog.
// Rendered in a portal (directly under <body>) so it is never clipped by a scrolling
// column and never interferes with drag and drop.
export default function Modal({ title, onClose, children, widthClass = 'max-w-lg' }) {
  const dialogRef = useRef(null);

  // Keep the newest onClose in a ref so the effect below runs only once per modal.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // stop the page behind from scrolling

    // Start keyboard focus inside the dialog (unless a child already took it with autoFocus).
    if (!dialog.contains(document.activeElement)) dialog.focus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      // If two modals are stacked, only the top one (the last in the DOM) should close.
      const dialogs = document.querySelectorAll('[data-modal-dialog]');
      if (dialogs[dialogs.length - 1] !== dialog) return;
      onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.(); // give focus back to where the user was
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-slate-900/60 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        // Close only when the dark backdrop itself is clicked, not the dialog inside it.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-modal-dialog
        className={`max-h-[92dvh] w-full ${widthClass} animate-pop-in overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none dark:bg-slate-900 sm:rounded-2xl`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
