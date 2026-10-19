import { useRef, useState } from 'react';

// A text input for renaming something in place.
//   Enter or clicking away -> save (onSave), unless the text is empty or unchanged
//   Escape                 -> cancel (onCancel)
// The parent decides when to show it, and closes it from onSave / onCancel.
export default function EditableTitle({ value, onSave, onCancel, label, maxLength = 60, className = '' }) {
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  const finish = () => {
    const trimmed = draft.trim();
    if (cancelled.current || !trimmed || trimmed === value) {
      onCancel();
    } else {
      onSave(trimmed);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // blur triggers finish(), so saving lives in one place
    } else if (event.key === 'Escape') {
      cancelled.current = true;
      event.currentTarget.blur();
    }
  };

  return (
    <input
      autoFocus
      value={draft}
      maxLength={maxLength}
      aria-label={label}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={(event) => event.target.select()}
      onBlur={finish}
      onKeyDown={handleKeyDown}
      className={`input min-w-0 ${className}`}
    />
  );
}
