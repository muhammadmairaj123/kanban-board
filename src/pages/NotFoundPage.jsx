import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <p className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
      <Link to="/" className="btn-primary mt-6">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to all boards
      </Link>
    </div>
  );
}
