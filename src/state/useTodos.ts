import { useContext } from 'react';
import { TodoContext, type TodoContextValue } from './todoContextValue';

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('useTodos 는 <TodoProvider> 내부에서만 사용할 수 있어요.');
  }
  return ctx;
}
