import { render, screen, within } from '@testing-library/react';
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
