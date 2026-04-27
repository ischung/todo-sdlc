import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarView } from './CalendarView';

describe('<CalendarView />', () => {
  it('renders the month header', () => {
    const today = new Date(2026, 3, 27); // April 27, 2026
    render(<CalendarView anchor={today} today={today} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 4월');
  });

  it('renders 7 columns × 6 weeks = 42 grid cells + 7 column headers', () => {
    const today = new Date(2026, 3, 27);
    render(<CalendarView anchor={today} today={today} />);
    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7);
  });

  it('highlights today with brand-700 + bold (AC-2)', () => {
    const today = new Date(2026, 3, 27);
    render(<CalendarView anchor={today} today={today} />);
    const todayCell = screen.getByLabelText(/2026-04-27, 오늘/);
    const dayLabel = todayCell.querySelector('span');
    expect(dayLabel?.className).toMatch(/text-brand-700/);
    expect(dayLabel?.className).toMatch(/font-bold/);
    expect(todayCell.getAttribute('aria-current')).toBe('date');
  });

  it('does not highlight any cell when today is in another month', () => {
    render(
      <CalendarView anchor={new Date(2026, 5, 15)} today={new Date(2026, 3, 27)} />,
    );
    const cells = screen.getAllByRole('gridcell');
    const highlighted = cells.filter((c) => c.getAttribute('aria-current') === 'date');
    expect(highlighted).toHaveLength(0);
  });

  it('다음 달 클릭 시 헤더와 셀이 갱신된다 (#10 AC-1)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(<CalendarView anchor={today} today={today} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 4월');

    await user.click(screen.getByTestId('next-month'));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 5월');
    // 5월 1일 / 5월 31일 셀이 그리드에 포함된다
    expect(screen.getByLabelText(/^2026-05-01/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^2026-05-31/)).toBeInTheDocument();
  });

  it('이전 달 → 오늘 버튼으로 현재 월 복귀 + 오늘 강조 (#10 AC-2)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(<CalendarView anchor={today} today={today} />);

    await user.click(screen.getByTestId('prev-month'));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 3월');

    const goToday = screen.getByTestId('today');
    expect(goToday).toBeEnabled();
    await user.click(goToday);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2026년 4월');
    const todayCell = screen.getByLabelText(/2026-04-27, 오늘/);
    expect(todayCell.getAttribute('aria-current')).toBe('date');
    // 현재 월에 머물 때 오늘 버튼은 비활성
    expect(screen.getByTestId('today')).toBeDisabled();
  });

  it('marks out-of-month cells visually distinct', () => {
    const today = new Date(2026, 3, 27);
    render(<CalendarView anchor={today} today={today} />);
    const outOfMonth = screen
      .getAllByRole('gridcell')
      .filter((c) => c.dataset.outOfMonth === 'true');
    expect(outOfMonth.length).toBeGreaterThan(0);
    const span = outOfMonth[0]?.querySelector('span');
    expect(span?.className).toMatch(/text-ink-faint/);
  });
});
