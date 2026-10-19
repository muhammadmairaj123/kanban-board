import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus } from 'lucide-react';
import { addBoard, deleteBoard } from '../features/boards/boardsSlice';
import { showToast } from '../features/ui/uiSlice';
import { selectBoardSummaries } from '../features/boards/selectors';
import { LIMITS } from '../utils/constants';
import BoardCard from '../components/BoardCard';
import ConfirmDialog from '../components/ConfirmDialog';
import ImportBoardButton from '../components/ImportBoardButton';

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boards = useSelector(selectBoardSummaries);

  const [name, setName] = useState('');
  const [boardToDelete, setBoardToDelete] = useState(null);

  const handleCreate = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    // dispatch() returns the action, so we can read the new board's id and open it right away.
    const action = dispatch(addBoard(trimmed));
    setName('');
    navigate(`/board/${action.payload.board.id}`);
  };

  const handleDelete = () => {
    dispatch(deleteBoard(boardToDelete.id));
    dispatch(showToast(`Deleted "${boardToDelete.name}"`));
    setBoardToDelete(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Your boards</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create a board for each project. Everything is saved in your browser.
          </p>
        </div>
        <ImportBoardButton />
      </div>

      <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          maxLength={LIMITS.boardName}
          onChange={(event) => setName(event.target.value)}
          placeholder="New board name, for example: Website redesign"
          aria-label="New board name"
          className="input sm:max-w-md"
        />
        <button type="submit" className="btn-primary" disabled={!name.trim()}>
          <Plus size={16} aria-hidden="true" />
          Create board
        </button>
      </form>

      {boards.length === 0 ? (
        <div className="mt-10 rounded-xl border-2 border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
          <LayoutDashboard size={32} className="mx-auto text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">No boards yet</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create your first board above, or import one from a JSON file.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.id}>
              <BoardCard board={board} onRequestDelete={setBoardToDelete} />
            </li>
          ))}
        </ul>
      )}

      {boardToDelete && (
        <ConfirmDialog
          title={`Delete "${boardToDelete.name}"?`}
          message={`This board and all of its ${boardToDelete.columnCount} columns and ${boardToDelete.cardCount} cards will be permanently deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setBoardToDelete(null)}
        />
      )}
    </div>
  );
}
