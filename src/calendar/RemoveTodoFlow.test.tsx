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

const t = (over: Partial<Todo>): Todo => ({
  id: over.id ?? 'x',
  date: over.date ?? '2026-04-27',
  title: over.title ?? 't',
  done: over.done ?? false,
  createdAt: '2026-04-27T00:00:00Z',
  updatedAt: '2026-04-27T00:00:00Z',
  ...over,
});

function seed(items: Todo[]) {
  return memoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      schemaVersion: 1,
      todosByDate: { '2026-04-27': items },
    }),
  });
}

describe('Remove + undo flow (#13)', () => {
  it('삭제 즉시 목록에서 사라지고 undo 토스트가 노출된다 (AC-1)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={seed([t({ id: '1', title: '운동' })])} undoWindowMs={5000}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    await user.click(await screen.findByLabelText(/2026-04-27.*미완료 1개/));
    const panel = await screen.findByTestId('day-detail-panel');
    await user.click(within(panel).getByTestId('todo-remove'));

    await waitFor(() => expect(within(panel).queryByTestId('todo-item')).not.toBeInTheDocument());
    expect(screen.getByTestId('undo-toast')).toBeInTheDocument();
  });

  it('되돌리기 → 같은 인덱스로 복원 (AC-2)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    const storage = seed([
      t({ id: '1', title: '운동' }),
      t({ id: '2', title: '독서' }),
      t({ id: '3', title: '글쓰기' }),
    ]);
    render(
      <TodoProvider storage={storage} undoWindowMs={5000}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    await user.click(await screen.findByLabelText(/2026-04-27.*미완료 3개/));
    const panel = await screen.findByTestId('day-detail-panel');
    const items = within(panel).getAllByTestId('todo-item');
    await user.click(within(items[1]!).getByTestId('todo-remove'));

    await waitFor(() => expect(within(panel).getAllByTestId('todo-item')).toHaveLength(2));
    await user.click(screen.getByTestId('undo-button'));

    await waitFor(() => expect(within(panel).getAllByTestId('todo-item')).toHaveLength(3));
    const titles = within(panel)
      .getAllByTestId('todo-item')
      .map((li) => within(li).getByTestId('todo-title').textContent);
    expect(titles).toEqual(['운동', '독서', '글쓰기']);
    const persisted = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(persisted.todosByDate['2026-04-27'].map((x: Todo) => x.id)).toEqual(['1', '2', '3']);
  });

  it('undo 윈도우 만료 시 토스트가 사라지고 영속이 확정 유지된다 (AC-3)', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    const storage = seed([t({ id: '1', title: '운동' })]);
    // 테스트는 짧은 윈도우(50ms)로 같은 동작을 검증한다 — 5초의 의미 동일.
    render(
      <TodoProvider storage={storage} undoWindowMs={50}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    await user.click(await screen.findByLabelText(/2026-04-27.*미완료 1개/));
    const panel = await screen.findByTestId('day-detail-panel');
    await user.click(within(panel).getByTestId('todo-remove'));
    expect(screen.getByTestId('undo-toast')).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByTestId('undo-toast')).not.toBeInTheDocument(), {
      timeout: 1000,
    });

    const persisted = JSON.parse(storage.getItem(STORAGE_KEY)!);
    expect(persisted.todosByDate['2026-04-27']).toEqual([]);
  });
});
