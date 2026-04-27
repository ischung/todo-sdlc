import type { PersistRoot, Todo, DateKey } from '../domain/types';

export interface TodosState {
  /** 진입 시 LOAD 디스패치 전까지는 false */
  loaded: boolean;
  root: PersistRoot;
}

export type TodosAction =
  | { type: 'LOAD'; payload: PersistRoot }
  | { type: 'ADD'; payload: Todo }
  | { type: 'TOGGLE'; payload: { date: DateKey; id: string; updatedAt: string } };

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
    case 'TOGGLE': {
      const { date, id, updatedAt } = action.payload;
      const list = state.root.todosByDate[date];
      if (!list) return state;
      const next = list.map((t) => (t.id === id ? { ...t, done: !t.done, updatedAt } : t));
      return {
        ...state,
        root: { ...state.root, todosByDate: { ...state.root.todosByDate, [date]: next } },
      };
    }
    default:
      return state;
  }
}

export function selectListByDate(state: TodosState, date: DateKey): Todo[] {
  return state.root.todosByDate[date] ?? [];
}

/** 미완료 todo 개수 — 셀 배지의 시각 신호. */
export function selectCountByDate(state: TodosState, date: DateKey): number {
  return selectListByDate(state, date).filter((t) => !t.done).length;
}
