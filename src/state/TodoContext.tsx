import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { Result, Todo } from '../domain/types';
import { TodoRepository, detectBrowserStorage, type StorageLike } from '../infra/TodoRepository';
import { TodoContext, type AddTodoInput, type TodoContextValue } from './todoContextValue';
import {
  initialTodosState,
  selectCountByDate,
  selectListByDate,
  todosReducer,
  type TodosState,
} from './todosReducer';

export interface TodoProviderProps {
  children: ReactNode;
  /** 테스트용 저장소 주입. 미지정 시 window.localStorage 자동 감지. */
  storage?: StorageLike | null;
  /** 테스트용 ID 주입. 미지정 시 crypto.randomUUID. */
  generateId?: () => string;
  /** 테스트용 시각 주입. 미지정 시 new Date(). */
  now?: () => Date;
}

const TITLE_MAX = 100;

export function TodoProvider({ children, storage, generateId, now }: TodoProviderProps) {
  const repository = useMemo(
    () => new TodoRepository(storage === undefined ? detectBrowserStorage() : storage),
    [storage],
  );
  const [state, dispatch] = useReducer(todosReducer, initialTodosState);

  // reducer 최신 state 를 effect 외부 콜백에서 안전하게 읽기 위해 ref 동기화.
  const stateRef = useRef<TodosState>(state);
  stateRef.current = state;

  useEffect(() => {
    const result = repository.load();
    if (result.ok) {
      dispatch({ type: 'LOAD', payload: result.data });
    } else {
      dispatch({ type: 'LOAD', payload: { schemaVersion: 1, todosByDate: {} } });
    }
  }, [repository]);

  const addTodo = useCallback(
    ({ date, title }: AddTodoInput): Result<Todo> => {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return { ok: false, error: { code: 'VALIDATION_EMPTY_TITLE', message: '내용을 입력해주세요.' } };
      }
      if (trimmed.length > TITLE_MAX) {
        return {
          ok: false,
          error: { code: 'VALIDATION_TITLE_TOO_LONG', message: `최대 ${TITLE_MAX}자까지 입력할 수 있어요.` },
        };
      }

      const ts = (now?.() ?? new Date()).toISOString();
      const todo: Todo = {
        id: generateId?.() ?? crypto.randomUUID(),
        date,
        title: trimmed,
        done: false,
        createdAt: ts,
        updatedAt: ts,
      };

      // 상태 우선 갱신, 그 다음 영속.
      const prev = stateRef.current;
      const list = prev.root.todosByDate[date] ?? [];
      const nextRoot = {
        ...prev.root,
        todosByDate: { ...prev.root.todosByDate, [date]: [...list, todo] },
      };

      const saved = repository.save(nextRoot);
      if (!saved.ok) {
        return saved;
      }

      dispatch({ type: 'ADD', payload: todo });
      return { ok: true, data: todo };
    },
    [repository, generateId, now],
  );

  const toggleTodo = useCallback(
    ({ date, id }: { date: import('../domain/types').DateKey; id: string }): Result<void> => {
      const prev = stateRef.current;
      const list = prev.root.todosByDate[date];
      if (!list) {
        return { ok: false, error: { code: 'NOT_FOUND', message: '항목을 찾을 수 없어요.' } };
      }
      const target = list.find((t) => t.id === id);
      if (!target) {
        return { ok: false, error: { code: 'NOT_FOUND', message: '항목을 찾을 수 없어요.' } };
      }
      const ts = (now?.() ?? new Date()).toISOString();
      const nextList = list.map((t) => (t.id === id ? { ...t, done: !t.done, updatedAt: ts } : t));
      const nextRoot = {
        ...prev.root,
        todosByDate: { ...prev.root.todosByDate, [date]: nextList },
      };
      const saved = repository.save(nextRoot);
      if (!saved.ok) return saved;
      dispatch({ type: 'TOGGLE', payload: { date, id, updatedAt: ts } });
      return { ok: true, data: undefined };
    },
    [repository, now],
  );

  const value = useMemo<TodoContextValue>(
    () => ({
      state,
      listByDate: (date) => selectListByDate(state, date),
      countByDate: (date) => selectCountByDate(state, date),
      addTodo,
      toggleTodo,
    }),
    [state, addTodo, toggleTodo],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
