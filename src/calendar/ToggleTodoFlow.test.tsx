import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarView } from './CalendarView';
import { TodoProvider } from '../state/TodoContext';
import { STORAGE_KEY, type StorageLike } from '../infra/TodoRepository';
import type { Todo } from '../domain/types';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  };
}

function seed(items: Todo[]) {
  return memoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      schemaVersion: 1,
      todosByDate: { '2026-04-27': items },
    }),
  });
}

const t = (over: Partial<Todo>): Todo => ({
  id: 'x',
  date: '2026-04-27',
  title: 't',
  done: false,
  createdAt: '2026-04-27T00:00:00Z',
  updatedAt: '2026-04-27T00:00:00Z',
  ...over,
});

describe('Toggle todo flow (#12)', () => {
  it('체크박스 클릭 → done 전환 + 취소선 + 배지 -1 (#12 AC-1, AC-2, AC-3)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    const storage = seed([t({ id: '1', title: '운동' }), t({ id: '2', title: '독서' })]);

    render(
      <TodoProvider storage={storage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    // 미완료 2 → 배지 2
    const before = await screen.findByLabelText(/2026-04-27.*미완료 2개/);
    expect(within(before).getByTestId('todo-count').textContent).toBe('2');

    await user.click(before);
    const panel = await screen.findByTestId('day-detail-panel');
    const items = within(panel).getAllByTestId('todo-item');
    const firstToggle = within(items[0]!).getByTestId('todo-toggle');
    await user.click(firstToggle);

    // 첫 항목 done 처리
    await waitFor(() => {
      expect(within(items[0]!).getByTestId('todo-title').className).toMatch(/line-through/);
    });
    expect(items[0]!.dataset.done).toBe('true');

    // 패널 외부 셀의 배지가 1로 줄었는지
    await waitFor(() => {
      expect(screen.getByLabelText(/2026-04-27.*미완료 1개/)).toBeInTheDocument();
    });

    // localStorage 도 done=true 로 영속
    const persisted = JSON.parse(storage.getItem(STORAGE_KEY)!);
    const persistedItem = persisted.todosByDate['2026-04-27'].find((x: Todo) => x.id === '1');
    expect(persistedItem.done).toBe(true);
  });

  it('미완료 0개면 배지가 사라진다', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    const storage = seed([t({ id: '1', title: '하나만' })]);
    render(
      <TodoProvider storage={storage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    const cellBefore = await screen.findByLabelText(/2026-04-27.*미완료 1개/);
    await user.click(cellBefore);
    const panel = await screen.findByTestId('day-detail-panel');
    await user.click(within(panel).getByTestId('todo-toggle'));

    await waitFor(() => {
      const cellAfter = screen.getByLabelText('2026-04-27, 오늘');
      expect(within(cellAfter).queryByTestId('todo-count')).not.toBeInTheDocument();
    });
  });

  it('미완료가 9 초과면 배지에 9+ 가 표시된다', async () => {
    const today = new Date(2026, 3, 27);
    const many = Array.from({ length: 12 }, (_, i) => t({ id: String(i), title: `t${i}` }));
    render(
      <TodoProvider storage={seed(many)}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    const cell = await screen.findByLabelText(/2026-04-27.*미완료 12개/);
    expect(within(cell).getByTestId('todo-count').textContent).toBe('9+');
  });
});
