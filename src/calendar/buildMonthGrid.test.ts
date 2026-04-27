import { describe, expect, it } from 'vitest';
import { buildMonthGrid, toDateKey } from './buildMonthGrid';

describe('buildMonthGrid', () => {
  it('returns exactly 42 cells (6 weeks)', () => {
    const cells = buildMonthGrid(new Date(2026, 3, 15), new Date(2026, 3, 27));
    expect(cells).toHaveLength(42);
  });

  it('marks today correctly when in the displayed month', () => {
    const today = new Date(2026, 3, 27);
    const cells = buildMonthGrid(today, today);
    const todayCells = cells.filter((c) => c.isToday);
    expect(todayCells).toHaveLength(1);
    expect(todayCells[0]?.key).toBe('2026-04-27');
    expect(todayCells[0]?.inCurrentMonth).toBe(true);
  });

  it('does not mark anything as today when anchor and today differ in month', () => {
    const cells = buildMonthGrid(new Date(2026, 5, 15), new Date(2026, 3, 27));
    expect(cells.some((c) => c.isToday)).toBe(false);
  });

  it('flags out-of-month leading/trailing cells', () => {
    // 2026-04 starts on Wednesday (Apr 1) → leading 3 cells (Sun-Tue) belong to March
    const cells = buildMonthGrid(new Date(2026, 3, 15), new Date(2026, 3, 27));
    const outOfMonth = cells.filter((c) => !c.inCurrentMonth);
    expect(outOfMonth.length).toBeGreaterThan(0);
    // 첫 칸은 일요일이며, 표시 중인 달(4월)에 속하지 않아야 한다
    expect(cells[0]?.inCurrentMonth).toBe(false);
    expect(cells[0]?.date.getDay()).toBe(0);
  });

  it('uses YYYY-MM-DD format for date keys', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});
