import { Calendar } from 'lucide-react';
import { getLabel, getPriority } from '../utils/constants';
import { formatDate, getDueStatus } from '../utils/dates';

export function PriorityBadge({ priority }) {
  const { label, badge } = getPriority(priority);
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>{label}</span>;
}

const DUE_STYLES = {
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  soon: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  upcoming: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function DueDateBadge({ dueDate }) {
  const status = getDueStatus(dueDate);
  if (status === 'none') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${DUE_STYLES[status]}`}
      title={status === 'overdue' ? 'This card is overdue' : 'Due date'}
    >
      <Calendar size={12} aria-hidden="true" />
      {formatDate(dueDate)}
      {/* Text as well as color, so the meaning is not color-only. */}
      {status === 'overdue' && <span>· Overdue</span>}
    </span>
  );
}

// Trello-style colored bars. The color name is in the title for hover and screen readers.
export function LabelChips({ labels }) {
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((id) => {
        const label = getLabel(id);
        if (!label) return null;
        return (
          <span key={id} title={label.name} className={`h-2 w-9 rounded-full ${label.swatch}`}>
            <span className="sr-only">{label.name} label</span>
          </span>
        );
      })}
    </div>
  );
}
