import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TodoProvider } from './TodoContext';
import { CalendarView } from '../calendar/CalendarView';
import { STORAGE_KEY, type StorageLike } from '../infra/TodoRepository';
import type { Todo } from '../domain/types';

function memStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  };
}

const mk = (over: Partial<Todo>): Todo => ({
  id: over.id ?? 'x',
  date: '2026-04-27',
  title: over.title ?? 't',
  done: false,
  createdAt: '2026-04-27T00:00:00Z',
  updatedAt: '2026-04-27T00:00:00Z',
  ...over,
});

describe('Storage sync + error toast (#15)', () => {
  it('다른 탭에서 storage 이벤트가 발사되면 LOAD 가 재실행된다 (AC-1)', async () => {
    const today = new Date(2026, 3, 27);
    const storage = memStorage();

    render(
      <TodoProvider storage={storage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    // 처음에는 미완료 0
    const cellInit = await screen.findByLabelText(/2026-04-27, 오늘$/);
    expect(within(cellInit).queryByTestId('todo-count')).not.toBeInTheDocument();

    // 다른 탭이 같은 storage 에 추가했다고 가정 — 직접 setItem 후 storage 이벤트 발사
    const next = {
      schemaVersion: 1,
      todosByDate: { '2026-04-27': [mk({ id: '1', title: '운동' })] },
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(next));

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(next),
        }),
      );
    });

    // 미완료 1 로 갱신
    await waitFor(() => {
      expect(screen.getByLabelText(/2026-04-27.*미완료 1개/)).toBeInTheDocument();
    });
  });

  it('관계없는 key 의 storage 이벤트는 무시한다', async () => {
    const today = new Date(2026, 3, 27);
    const storage = memStorage();
    render(
      <TodoProvider storage={storage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    await screen.findByLabelText(/2026-04-27, 오늘$/);

    // 다른 키 변화 → 무시되어야 한다
    storage.setItem('unrelated', 'x');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated', newValue: 'x' }));
    });
    // 여전히 미완료 배지 없음
    const cell = screen.getByLabelText(/2026-04-27, 오늘$/);
    expect(within(cell).queryByTestId('todo-count')).not.toBeInTheDocument();
  });

  it('localStorage 비활성(시크릿 모드) 시 배너가 노출된다 (AC-2)', async () => {
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={null}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    expect(await screen.findByTestId('storage-unavailable-banner')).toBeInTheDocument();
  });

  it('저장 실패 시 친근한 에러 토스트가 노출된다', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);

    // setItem 이 항상 QuotaExceeded 를 던지는 storage
    const failingStorage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        const err = new Error('quota');
        (err as Error & { name: string }).name = 'QuotaExceededError';
        throw err;
      },
      removeItem: () => undefined,
    };

    render(
      <TodoProvider storage={failingStorage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    await user.click(await screen.findByLabelText(/2026-04-27, 오늘/));
    const panel = await screen.findByTestId('day-detail-panel');
    await user.type(within(panel).getByTestId('todo-input'), '운동{enter}');

    const toast = await screen.findByTestId('error-toast');
    expect(toast).toHaveTextContent('앗, 저장하지 못했어요. 다시 시도해주세요.');

    await user.click(within(toast).getByTestId('error-toast-close'));
    await waitFor(() => expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument());
  });
});
