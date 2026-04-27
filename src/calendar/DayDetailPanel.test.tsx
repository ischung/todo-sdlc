import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarView } from './CalendarView';
import { TodoProvider } from '../state/TodoContext';
import type { StorageLike } from '../infra/TodoRepository';

function memStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

describe('<DayDetailPanel /> (#14)', () => {
  it('빈 상태 안내가 새 카피로 노출된다 (AC-2)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={memStorage()}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    await user.click(await screen.findByLabelText(/2026-04-27, 오늘/));
    const empty = await screen.findByTestId('todo-empty');
    expect(empty).toHaveTextContent(/아직 할 일이 없어요\. 첫 번째 항목을 추가해보세요!/);
  });

  it('시트는 모바일에서 fixed bottom 으로 고정되는 클래스를 갖는다 (AC-1)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={memStorage()}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    await user.click(await screen.findByLabelText(/2026-04-27, 오늘/));
    const sheet = await screen.findByTestId('day-detail-sheet');
    // 모바일 기본 클래스
    expect(sheet.className).toMatch(/fixed/);
    expect(sheet.className).toMatch(/bottom-0/);
    expect(sheet.className).toMatch(/rounded-t-card/);
    // 데스크탑 분기 (sm:) 도 함께 명시
    expect(sheet.className).toMatch(/sm:static/);
    expect(sheet.className).toMatch(/sm:max-w-md/);
  });
});
