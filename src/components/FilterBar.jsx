import { useDispatch, useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import {
  resetFilters,
  setLabelFilter,
  setPriorityFilter,
  setTextFilter,
} from '../features/ui/uiSlice';
import { hasActiveFilters, selectFilters } from '../features/boards/selectors';
import { LABELS, PRIORITIES } from '../utils/constants';

export default function FilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const active = hasActiveFilters(filters);

  return (
    <div className="flex flex-wrap items-center gap-2" role="search" aria-label="Filter cards">
      <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={filters.text}
          onChange={(event) => dispatch(setTextFilter(event.target.value))}
          placeholder="Search cards..."
          aria-label="Search cards"
          className="input pl-9"
        />
      </div>

      <select
        value={filters.priority}
        onChange={(event) => dispatch(setPriorityFilter(event.target.value))}
        aria-label="Filter by priority"
        className="input w-auto"
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>

      <select
        value={filters.label}
        onChange={(event) => dispatch(setLabelFilter(event.target.value))}
        aria-label="Filter by label"
        className="input w-auto"
      >
        <option value="all">All labels</option>
        {LABELS.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>

      {active && (
        <button type="button" onClick={() => dispatch(resetFilters())} className="btn-secondary">
          <X size={14} aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}
