import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';
import NotFoundPage from './pages/NotFoundPage';
import { selectTheme } from './features/boards/selectors';

export default function App() {
  const theme = useSelector(selectTheme);

  // Tailwind's dark mode is driven by a "dark" class on <html>.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-dvh flex-col">
      <Navbar />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Toast />
    </div>
  );
}
