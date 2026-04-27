import { format } from 'date-fns';
import { buildMonthGrid, type CalendarCell } from './buildMonthGrid';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarViewProps {
  /** 표시할 달의 임의 일자 (보통 매달 1일). 미지정 시 today. */
  anchor?: Date;
  /** 오늘 강조 기준. 테스트에서 주입 가능. */
  today?: Date;
}

export function CalendarView({ anchor, today }: CalendarViewProps) {
  const todayDate = today ?? new Date();
  const anchorDate = anchor ?? todayDate;
  const cells = buildMonthGrid(anchorDate, todayDate);

  return (
    <section
      aria-label={`${format(anchorDate, 'yyyy년 M월')} 달력`}
      className="rounded-card bg-surface shadow-card p-4"
    >
      <header className="flex items-baseline justify-between mb-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          {format(anchorDate, 'yyyy년 M월')}
        </h2>
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
          <DateCell key={cell.key} cell={cell} />
        ))}
      </div>
    </section>
  );
}

interface DateCellProps {
  cell: CalendarCell;
}

function DateCell({ cell }: DateCellProps) {
  const base = 'bg-surface min-h-[5.5rem] p-2 text-left flex flex-col';
  const dayClass = cell.isToday
    ? 'text-sm font-bold text-brand-700'
    : cell.inCurrentMonth
      ? 'text-sm font-medium text-ink'
      : 'text-sm text-ink-faint';

  return (
    <div
      role="gridcell"
      aria-label={`${cell.key}${cell.isToday ? ', 오늘' : ''}`}
      aria-current={cell.isToday ? 'date' : undefined}
      data-date={cell.key}
      data-today={cell.isToday || undefined}
      data-out-of-month={!cell.inCurrentMonth || undefined}
      className={base}
    >
      <span className={dayClass}>{cell.day}</span>
    </div>
  );
}
