import { describe, expect, it } from 'vitest';
import {
  initialTodosState,
  selectCountByDate,
  selectListByDate,
  todosReducer,
} from './todosReducer';
import type { Todo } from '../domain/types';

const mk = (over: Partial<Todo>): Todo => ({
  id: over.id ?? 'x',
  date: over.date ?? '2026-04-27',
  title: over.title ?? 't',
  done: over.done ?? false,
  createdAt: '2026-04-27T00:00:00Z',
  updatedAt: '2026-04-27T00:00:00Z',
  ...over,
});

describe('todosReducer', () => {
  it('LOAD 는 loaded=true 와 root 를 한꺼번에 세팅한다', () => {
    const next = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: { schemaVersion: 1, todosByDate: { '2026-04-27': [mk({ id: '1' })] } },
    });
    expect(next.loaded).toBe(true);
    expect(selectListByDate(next, '2026-04-27')).toHaveLength(1);
  });

  it('ADD 는 해당 날짜 배열 끝에 추가한다 (#11)', () => {
    const seeded = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: { schemaVersion: 1, todosByDate: { '2026-04-27': [mk({ id: '1' })] } },
    });
    const next = todosReducer(seeded, { type: 'ADD', payload: mk({ id: '2', title: '두 번째' }) });
    const list = selectListByDate(next, '2026-04-27');
    expect(list).toHaveLength(2);
    expect(list[1]?.title).toBe('두 번째');
  });

  it('TOGGLE 은 done 을 뒤집고 updatedAt 을 갱신한다 (#12)', () => {
    const seeded = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: { schemaVersion: 1, todosByDate: { '2026-04-27': [mk({ id: '1', done: false })] } },
    });
    const next = todosReducer(seeded, {
      type: 'TOGGLE',
      payload: { date: '2026-04-27', id: '1', updatedAt: '2026-04-27T10:00:00Z' },
    });
    const list = selectListByDate(next, '2026-04-27');
    expect(list[0]?.done).toBe(true);
    expect(list[0]?.updatedAt).toBe('2026-04-27T10:00:00Z');
  });

  it('selectCountByDate 는 미완료만 센다 (#12 AC-3)', () => {
    const seeded = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: {
        schemaVersion: 1,
        todosByDate: {
          '2026-04-27': [
            mk({ id: '1', done: false }),
            mk({ id: '2', done: true }),
            mk({ id: '3', done: false }),
          ],
        },
      },
    });
    expect(selectCountByDate(seeded, '2026-04-27')).toBe(2);
  });

  it('REMOVE 는 해당 id 만 제거한다 (#13)', () => {
    const seeded = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: {
        schemaVersion: 1,
        todosByDate: { '2026-04-27': [mk({ id: '1' }), mk({ id: '2' }), mk({ id: '3' })] },
      },
    });
    const next = todosReducer(seeded, { type: 'REMOVE', payload: { date: '2026-04-27', id: '2' } });
    expect(selectListByDate(next, '2026-04-27').map((t) => t.id)).toEqual(['1', '3']);
  });

  it('RESTORE 는 같은 인덱스에 다시 끼워넣는다 (#13)', () => {
    const removed = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: {
        schemaVersion: 1,
        todosByDate: { '2026-04-27': [mk({ id: '1' }), mk({ id: '3' })] },
      },
    });
    const next = todosReducer(removed, {
      type: 'RESTORE',
      payload: { date: '2026-04-27', index: 1, todo: mk({ id: '2' }) },
    });
    expect(selectListByDate(next, '2026-04-27').map((t) => t.id)).toEqual(['1', '2', '3']);
  });

  it('RESTORE index 가 범위를 벗어나면 가까운 끝으로 클램핑한다', () => {
    const seeded = todosReducer(initialTodosState, {
      type: 'LOAD',
      payload: { schemaVersion: 1, todosByDate: { '2026-04-27': [mk({ id: '1' })] } },
    });
    const next = todosReducer(seeded, {
      type: 'RESTORE',
      payload: { date: '2026-04-27', index: 999, todo: mk({ id: '2' }) },
    });
    expect(selectListByDate(next, '2026-04-27').map((t) => t.id)).toEqual(['1', '2']);
  });

  it('알 수 없는 액션 타입은 state 를 그대로 돌려준다 (방어적)', () => {
    const next = todosReducer(initialTodosState, {
      // 의도적으로 비정상 액션
      type: 'NOOP' as unknown as 'LOAD',
      payload: initialTodosState.root,
    });
    expect(next).toBe(initialTodosState);
  });
});
