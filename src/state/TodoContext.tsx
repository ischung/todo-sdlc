import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DateKey, PersistRoot, Result, Todo } from '../domain/types';
import { TodoRepository, detectBrowserStorage, type StorageLike } from '../infra/TodoRepository';
import {
  TodoContext,
  type AddTodoInput,
  type PendingRemoval,
  type TodoContextValue,
} from './todoContextValue';
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
  /** 5초 undo 토스트의 만료 시간(ms). 테스트에서 짧게 줄일 수 있다. */
  undoWindowMs?: number;
}

const TITLE_MAX = 100;

const DEFAULT_UNDO_MS = 5000;

export function TodoProvider({
  children,
  storage,
  generateId,
  now,
  undoWindowMs = DEFAULT_UNDO_MS,
}: TodoProviderProps) {
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

  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const expireTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (expireTimerRef.current !== null) {
      window.clearTimeout(expireTimerRef.current);
      expireTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const persistRemoval = useCallback(
    (date: DateKey, id: string): Result<PersistRoot> => {
      const prev = stateRef.current;
      const list = prev.root.todosByDate[date] ?? [];
      const next = list.filter((t) => t.id !== id);
      const nextRoot: PersistRoot = {
        ...prev.root,
        todosByDate: { ...prev.root.todosByDate, [date]: next },
      };
      const saved = repository.save(nextRoot);
      return saved.ok ? { ok: true, data: nextRoot } : saved;
    },
    [repository],
  );

  const removeTodo = useCallback(
    ({ date, id }: { date: DateKey; id: string }): Result<PendingRemoval> => {
      const prev = stateRef.current;
      const list = prev.root.todosByDate[date];
      if (!list) {
        return { ok: false, error: { code: 'NOT_FOUND', message: '항목을 찾을 수 없어요.' } };
      }
      const index = list.findIndex((t) => t.id === id);
      if (index < 0) {
        return { ok: false, error: { code: 'NOT_FOUND', message: '항목을 찾을 수 없어요.' } };
      }
      const target = list[index]!;

      const saved = persistRemoval(date, id);
      if (!saved.ok) return saved;

      dispatch({ type: 'REMOVE', payload: { date, id } });

      const removal: PendingRemoval = { date, todo: target, index };
      // 이전 대기건이 있다면 즉시 만료(영속은 이미 끝나 있음).
      clearTimer();
      setPendingRemoval(removal);
      expireTimerRef.current = window.setTimeout(() => {
        setPendingRemoval((cur) => (cur === removal ? null : cur));
        expireTimerRef.current = null;
      }, undoWindowMs);

      return { ok: true, data: removal };
    },
    [persistRemoval, clearTimer, undoWindowMs],
  );

  const undoRemove = useCallback((): Result<void> => {
    const removal = pendingRemoval;
    if (!removal) {
      return { ok: false, error: { code: 'NOT_FOUND', message: '되돌릴 항목이 없어요.' } };
    }
    const prev = stateRef.current;
    const list = prev.root.todosByDate[removal.date] ?? [];
    const idx = Math.max(0, Math.min(removal.index, list.length));
    const nextList = [...list.slice(0, idx), removal.todo, ...list.slice(idx)];
    const nextRoot: PersistRoot = {
      ...prev.root,
      todosByDate: { ...prev.root.todosByDate, [removal.date]: nextList },
    };
    const saved = repository.save(nextRoot);
    if (!saved.ok) return saved;
    dispatch({ type: 'RESTORE', payload: { date: removal.date, index: idx, todo: removal.todo } });
    clearTimer();
    setPendingRemoval(null);
    return { ok: true, data: undefined };
  }, [pendingRemoval, repository, clearTimer]);

  const value = useMemo<TodoContextValue>(
    () => ({
      state,
      listByDate: (date) => selectListByDate(state, date),
      countByDate: (date) => selectCountByDate(state, date),
      addTodo,
      toggleTodo,
      removeTodo,
      undoRemove,
      pendingRemoval,
    }),
    [state, addTodo, toggleTodo, removeTodo, undoRemove, pendingRemoval],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
