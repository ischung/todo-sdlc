import type { PersistRoot, Todo, DateKey } from '../domain/types';

export interface TodosState {
  /** 진입 시 LOAD 디스패치 전까지는 false */
  loaded: boolean;
  root: PersistRoot;
}

export type TodosAction =
  | { type: 'LOAD'; payload: PersistRoot }
  | { type: 'ADD'; payload: Todo };

export const initialTodosState: TodosState = {
  loaded: false,
  root: { schemaVersion: 1, todosByDate: {} },
};

export function todosReducer(state: TodosState, action: TodosAction): TodosState {
  switch (action.type) {
    case 'LOAD':
      return { loaded: true, root: action.payload };
    case 'ADD': {
      const { date } = action.payload;
      const list = state.root.todosByDate[date] ?? [];
      return {
        ...state,
        root: {
          ...state.root,
          todosByDate: { ...state.root.todosByDate, [date]: [...list, action.payload] },
        },
      };
    }
    default:
      return state;
  }
}

export function selectListByDate(state: TodosState, date: DateKey): Todo[] {
  return state.root.todosByDate[date] ?? [];
}

export function selectCountByDate(state: TodosState, date: DateKey): number {
  return selectListByDate(state, date).length;
}
