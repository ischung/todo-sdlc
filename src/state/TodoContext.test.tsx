import { render, renderHook, waitFor } from '@testing-library/react';
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

  it('Provider 가 자식 트리를 그대로 렌더링한다', () => {
    const { getByText } = render(
      <TodoProvider storage={memoryStorage()}>
        <p>child</p>
      </TodoProvider>,
    );
    expect(getByText('child')).toBeInTheDocument();
  });
});
