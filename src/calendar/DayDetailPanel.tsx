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
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="w-full max-w-md rounded-t-card bg-surface-subtle p-4 shadow-card sm:rounded-card">
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
