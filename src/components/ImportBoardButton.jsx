import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { importBoard } from '../features/boards/boardsSlice';
import { showToast } from '../features/ui/uiSlice';
import { buildImportedBoard } from '../utils/boardIO';
import { MAX_IMPORT_BYTES } from '../utils/constants';

// Reads a JSON file chosen by the user and creates a NEW board from it.
// The real <input type="file"> is hidden; the visible button just opens it.
export default function ImportBoardButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // reset, so choosing the same file again still triggers onChange
    if (!file) return;

    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('That file is too large (2 MB maximum).');
      const imported = buildImportedBoard(await file.text());
      dispatch(importBoard(imported));
      dispatch(showToast(`Imported "${imported.board.name}"`));
      navigate(`/board/${imported.board.id}`);
    } catch (error) {
      dispatch(showToast(error.message || 'Could not import that file.', 'error'));
    }
  };

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
        <Upload size={16} aria-hidden="true" />
        Import
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
        aria-label="Import board from JSON file"
      />
    </>
  );
}
