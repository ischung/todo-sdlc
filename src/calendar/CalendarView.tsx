import { useState } from 'react';
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import type { DateKey } from '../domain/types';
import { useTodos } from '../state/useTodos';
import { buildMonthGrid, type CalendarCell } from './buildMonthGrid';
import { DayDetailPanel } from './DayDetailPanel';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarViewProps {
  /** 초기 표시 달의 임의 일자. 미지정 시 today. */
  anchor?: Date;
  /** 오늘 강조 기준. 테스트에서 주입 가능. */
  today?: Date;
}

export function CalendarView({ anchor, today }: CalendarViewProps) {
  const todayDate = today ?? new Date();
  const [anchorDate, setAnchorDate] = useState<Date>(() => startOfMonth(anchor ?? todayDate));
  const [openDate, setOpenDate] = useState<DateKey | null>(null);

  const cells = buildMonthGrid(anchorDate, todayDate);
  const monthLabel = format(anchorDate, 'yyyy년 M월');
  const isCurrentMonth =
    anchorDate.getFullYear() === todayDate.getFullYear() &&
    anchorDate.getMonth() === todayDate.getMonth();

  return (
    <section
      aria-label={`${monthLabel} 달력`}
      className="rounded-card bg-surface shadow-card p-4"
    >
      <header className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{monthLabel}</h2>
        <nav aria-label="달 이동" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAnchorDate((d) => startOfMonth(subMonths(d, 1)))}
            aria-label="이전 달"
            data-testid="prev-month"
            className="rounded-md px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-subtle hover:text-ink"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate(startOfMonth(todayDate))}
            disabled={isCurrentMonth}
            aria-label="오늘로 이동"
            data-testid="today"
            className="rounded-md px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-subtle hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate((d) => startOfMonth(addMonths(d, 1)))}
            aria-label="다음 달"
            data-testid="next-month"
            className="rounded-md px-3 py-1.5 text-sm text-ink-muted hover:bg-surface-subtle hover:text-ink"
          >
            →
          </button>
        </nav>
      </header>

      <div role="grid" aria-rowcount={7} className="grid grid-cols-7 gap-px bg-surface-muted rounded-md overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="bg-surface-subtle py-2 text-center text-xs font-medium text-ink-muted"
          >
            {label}
          </div>
        ))}

        {cells.map((cell) => (
          <DateCell key={cell.key} cell={cell} onSelect={() => setOpenDate(cell.key)} />
        ))}
      </div>

      {openDate ? <DayDetailPanel date={openDate} onClose={() => setOpenDate(null)} /> : null}
    </section>
  );
}

interface DateCellProps {
  cell: CalendarCell;
  onSelect: () => void;
}

function DateCell({ cell, onSelect }: DateCellProps) {
  const { countByDate } = useTodos();
  const count = countByDate(cell.key);
  const dayClass = cell.isToday
    ? 'text-sm font-bold text-brand-700'
    : cell.inCurrentMonth
      ? 'text-sm font-medium text-ink'
      : 'text-sm text-ink-faint';

  return (
    <button
      type="button"
      role="gridcell"
      onClick={onSelect}
      aria-label={`${cell.key}${cell.isToday ? ', 오늘' : ''}${count > 0 ? `, 할 일 ${count}개` : ''}`}
      aria-current={cell.isToday ? 'date' : undefined}
      data-date={cell.key}
      data-today={cell.isToday || undefined}
      data-out-of-month={!cell.inCurrentMonth || undefined}
      className="bg-surface min-h-[5.5rem] p-2 text-left flex flex-col hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <span className={dayClass}>{cell.day}</span>
      {count > 0 ? (
        <span data-testid="todo-count" className="mt-auto text-xs text-ink-muted">
          {count}
        </span>
      ) : null}
    </button>
  );
}
