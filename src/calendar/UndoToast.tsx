import { useTodos } from '../state/useTodos';

export function UndoToast() {
  const { pendingRemoval, undoRemove } = useTodos();
  if (!pendingRemoval) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="undo-toast"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-sm text-white shadow-card flex items-center gap-3"
    >
      <span>
        “{truncate(pendingRemoval.todo.title, 24)}” 삭제됨
      </span>
      <button
        type="button"
        onClick={() => undoRemove()}
        data-testid="undo-button"
        className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        되돌리기
      </button>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
