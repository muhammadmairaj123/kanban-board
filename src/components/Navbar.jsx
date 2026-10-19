import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <Link to="/" className="flex items-center gap-2 rounded-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
          <LayoutDashboard size={18} aria-hidden="true" />
        </span>
        <span>Kanban Board</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
