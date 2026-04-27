import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { TodoRepository, detectBrowserStorage, type StorageLike } from '../infra/TodoRepository';
import { TodoContext, type TodoContextValue } from './todoContextValue';
import {
  initialTodosState,
  selectCountByDate,
  selectListByDate,
  todosReducer,
} from './todosReducer';

export interface TodoProviderProps {
  children: ReactNode;
  /** 테스트용 저장소 주입. 미지정 시 window.localStorage 자동 감지. */
  storage?: StorageLike | null;
}

export function TodoProvider({ children, storage }: TodoProviderProps) {
  const repository = useMemo(
    () => new TodoRepository(storage === undefined ? detectBrowserStorage() : storage),
    [storage],
  );
  const [state, dispatch] = useReducer(todosReducer, initialTodosState);

  useEffect(() => {
    const result = repository.load();
    if (result.ok) {
      dispatch({ type: 'LOAD', payload: result.data });
    } else {
      dispatch({ type: 'LOAD', payload: { schemaVersion: 1, todosByDate: {} } });
    }
  }, [repository]);

  const value = useMemo<TodoContextValue>(
    () => ({
      state,
      listByDate: (date) => selectListByDate(state, date),
      countByDate: (date) => selectCountByDate(state, date),
    }),
    [state],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
