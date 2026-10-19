import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { toggleTheme } from '../features/ui/uiSlice';
import { selectTheme } from '../features/boards/selectors';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const isDark = useSelector(selectTheme) === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="icon-btn h-9 w-9"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
