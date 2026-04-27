import { useEffect, useRef } from 'react';
import type { DateKey } from '../domain/types';
import { TodoInputForm } from './TodoInputForm';
import { TodoList } from './TodoList';

interface DayDetailPanelProps {
  date: DateKey;
  onClose: () => void;
}

export function DayDetailPanel({ date, onClose }: DayDetailPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${date} 할 일 패널`}
      data-testid="day-detail-panel"
      className="fixed inset-0 z-40 bg-ink/30 sm:flex sm:items-center sm:justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        data-testid="day-detail-sheet"
        className="
          fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-auto
          rounded-t-card bg-surface-subtle p-4 shadow-card
          sm:static sm:bottom-auto sm:left-auto sm:right-auto sm:w-full sm:max-w-md sm:max-h-none sm:rounded-card sm:overflow-visible
        "
      >
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">{date}</h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            data-testid="day-detail-close"
            className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-surface-muted"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-3">
          <TodoInputForm date={date} />
          <TodoList date={date} />
        </div>
      </section>
    </div>
  );
}
