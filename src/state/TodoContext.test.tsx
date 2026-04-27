import { act, render, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { TodoProvider } from './TodoContext';
import { useTodos } from './useTodos';
import { STORAGE_KEY, type StorageLike } from '../infra/TodoRepository';
import type { PersistRoot } from '../domain/types';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, v),
    removeItem: (k) => void store.delete(k),
  };
}

const wrap =
  (storage: StorageLike | null) =>
  ({ children }: { children: ReactNode }) => <TodoProvider storage={storage}>{children}</TodoProvider>;

describe('<TodoProvider />', () => {
  it('useTodos 가 Provider 밖에서 호출되면 친절한 오류를 던진다', () => {
    expect(() => renderHook(() => useTodos())).toThrow(/TodoProvider/);
  });

  it('진입 시 LOAD 가 1회 디스패치되어 loaded=true 가 된다', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(memoryStorage()) });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
  });

  it('listByDate 가 빈 저장소일 때 빈 배열을 반환한다', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(memoryStorage()) });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    expect(result.current.listByDate('2026-04-27')).toEqual([]);
    expect(result.current.countByDate('2026-04-27')).toBe(0);
  });

  it('저장된 데이터가 있으면 listByDate 가 그 배열을 정확히 반환한다', async () => {
    const seeded: PersistRoot = {
      schemaVersion: 1,
      todosByDate: {
        '2026-04-27': [
          {
            id: 'a',
            date: '2026-04-27',
            title: '집중 시간 90분',
            done: false,
            createdAt: '2026-04-27T09:00:00.000Z',
            updatedAt: '2026-04-27T09:00:00.000Z',
          },
        ],
      },
    };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(seeded) });
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(storage) });

    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    expect(result.current.listByDate('2026-04-27')).toHaveLength(1);
    expect(result.current.listByDate('2026-04-27')[0]?.title).toBe('집중 시간 90분');
    expect(result.current.countByDate('2026-04-27')).toBe(1);
    expect(result.current.listByDate('2026-04-28')).toEqual([]);
  });

  it('storage=null (시크릿 모드 등) 이어도 충돌 없이 빈 트리로 LOAD 된다', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(null) });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    expect(result.current.listByDate('2026-04-27')).toEqual([]);
  });

  it('addTodo 는 trim 후 저장하고 영속한다 (#11 ADD)', async () => {
    const storage = memoryStorage();
    const { result } = renderHook(() => useTodos(), {
      wrapper: ({ children }) => (
        <TodoProvider
          storage={storage}
          generateId={() => 'id-1'}
          now={() => new Date('2026-04-27T09:00:00Z')}
        >
          {children}
        </TodoProvider>
      ),
    });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));

    let res!: ReturnType<typeof result.current.addTodo>;
    act(() => {
      res = result.current.addTodo({ date: '2026-04-27', title: '  집중 90분  ' });
    });
    expect(res.ok).toBe(true);
    expect(result.current.listByDate('2026-04-27')).toHaveLength(1);
    expect(result.current.listByDate('2026-04-27')[0]?.title).toBe('집중 90분');

    // 영속까지 갔는지 확인 — storage 에 직렬화되어 있어야 새로고침 후에도 유지됨
    const persisted = storage.getItem(STORAGE_KEY);
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted!).todosByDate['2026-04-27']).toHaveLength(1);
  });

  it('addTodo 는 빈/공백 입력을 거부한다', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(memoryStorage()) });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    const res = result.current.addTodo({ date: '2026-04-27', title: '   ' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('VALIDATION_EMPTY_TITLE');
  });

  it('addTodo 는 100자 초과를 거부한다', async () => {
    const { result } = renderHook(() => useTodos(), { wrapper: wrap(memoryStorage()) });
    await waitFor(() => expect(result.current.state.loaded).toBe(true));
    const res = result.current.addTodo({ date: '2026-04-27', title: 'x'.repeat(101) });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('VALIDATION_TITLE_TOO_LONG');
  });

  it('Provider 가 자식 트리를 그대로 렌더링한다', () => {
    const { getByText } = render(
      <TodoProvider storage={memoryStorage()}>
        <p>child</p>
      </TodoProvider>,
    );
    expect(getByText('child')).toBeInTheDocument();
  });
});
