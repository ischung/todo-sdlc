import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarView } from './CalendarView';
import { TodoProvider } from '../state/TodoContext';
import { STORAGE_KEY, type StorageLike } from '../infra/TodoRepository';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  };
}

describe('Add-todo flow (#11)', () => {
  it('날짜 클릭 → 패널 열림 → Enter → 목록 갱신 + 입력창 비워짐 + 카운트 증가', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    const storage = memoryStorage();

    render(
      <TodoProvider storage={storage} generateId={() => 'id-1'} now={() => today}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    // 진입 LOAD 완료 기다림 (셀이 렌더 끝날 때까지)
    const todayCell = await screen.findByLabelText(/2026-04-27, 오늘/);
    await user.click(todayCell);

    const panel = await screen.findByTestId('day-detail-panel');
    const input = within(panel).getByTestId('todo-input') as HTMLInputElement;

    await user.type(input, '집중 시간 90분{enter}');

    await waitFor(() => {
      expect(within(panel).getByTestId('todo-list')).toBeInTheDocument();
    });
    expect(within(panel).getAllByTestId('todo-item')).toHaveLength(1);
    expect(within(panel).getByTestId('todo-item').textContent).toBe('집중 시간 90분');
    expect(input.value).toBe('');
    expect(input).toHaveFocus();

    // localStorage 영속 확인 — 새로고침에도 살아남아야 한다
    const persisted = storage.getItem(STORAGE_KEY);
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted!).todosByDate['2026-04-27']).toHaveLength(1);
  });

  it('빈 입력은 차단되고 에러 메시지가 노출된다', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={memoryStorage()}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    await user.click(await screen.findByLabelText(/2026-04-27, 오늘/));
    const panel = await screen.findByTestId('day-detail-panel');
    const addBtn = within(panel).getByTestId('todo-add');
    await user.click(addBtn);
    expect(within(panel).getByTestId('todo-input-error')).toBeInTheDocument();
    expect(within(panel).queryByTestId('todo-list')).not.toBeInTheDocument();
  });

  it('입력 maxLength=100 으로 100자 초과 입력이 차단된다', async () => {
    const user = userEvent.setup();
    const today = new Date(2026, 3, 27);
    render(
      <TodoProvider storage={memoryStorage()}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );
    await user.click(await screen.findByLabelText(/2026-04-27, 오늘/));
    const panel = await screen.findByTestId('day-detail-panel');
    const input = within(panel).getByTestId('todo-input') as HTMLInputElement;
    expect(input.maxLength).toBe(100);
  });

  it('초기 시드 데이터가 있을 때 셀에 카운트 배지가 표시된다', async () => {
    const today = new Date(2026, 3, 27);
    const seeded = {
      schemaVersion: 1,
      todosByDate: {
        '2026-04-27': [
          {
            id: 'a',
            date: '2026-04-27',
            title: '운동',
            done: false,
            createdAt: today.toISOString(),
            updatedAt: today.toISOString(),
          },
          {
            id: 'b',
            date: '2026-04-27',
            title: '독서',
            done: true,
            createdAt: today.toISOString(),
            updatedAt: today.toISOString(),
          },
        ],
      },
    };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(seeded) });

    render(
      <TodoProvider storage={storage}>
        <CalendarView anchor={today} today={today} />
      </TodoProvider>,
    );

    // done=true 인 '독서' 는 카운트에서 제외 → 미완료 1개
    const todayCell = await screen.findByLabelText(/2026-04-27.*미완료 1개/);
    expect(within(todayCell).getByTestId('todo-count').textContent).toBe('1');
  });
});
