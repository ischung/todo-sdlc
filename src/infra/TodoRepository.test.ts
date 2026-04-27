import { beforeEach, describe, expect, it } from 'vitest';
import {
  BACKUP_KEY,
  STORAGE_KEY,
  TodoRepository,
  detectBrowserStorage,
  type StorageLike,
} from './TodoRepository';
import type { PersistRoot, Todo } from '../domain/types';

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  /** 다음 setItem 1회를 quota 에러로 던진다 (모의용) */
  forceQuota = false;

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    if (this.forceQuota) {
      this.forceQuota = false;
      const err = new DOMException('over quota', 'QuotaExceededError');
      throw err;
    }
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  has(key: string): boolean {
    return this.map.has(key);
  }
  raw(key: string): string | null {
    return this.getItem(key);
  }
}

const sampleTodo: Todo = {
  id: '11111111-1111-1111-1111-111111111111',
  date: '2026-04-27',
  title: 'PRD 정리',
  done: false,
  createdAt: '2026-04-27T08:00:00.000Z',
  updatedAt: '2026-04-27T08:00:00.000Z',
};

const sampleRoot: PersistRoot = {
  schemaVersion: 1,
  todosByDate: { '2026-04-27': [sampleTodo] },
};

describe('TodoRepository', () => {
  let storage: MemoryStorage;
  let repo: TodoRepository;

  beforeEach(() => {
    storage = new MemoryStorage();
    repo = new TodoRepository(storage);
  });

  it('AC-1: load() returns empty tree for fresh storage', () => {
    const r = repo.load();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toEqual({ schemaVersion: 1, todosByDate: {} });
    }
  });

  it('AC-2: corrupted JSON is backed up and load() returns empty tree', () => {
    storage.setItem(STORAGE_KEY, '{ this is not json');
    const r = repo.load();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.todosByDate).toEqual({});
    expect(storage.raw(BACKUP_KEY)).toBe('{ this is not json');
    expect(storage.has(STORAGE_KEY)).toBe(false);
  });

  it('AC-2b: schema-mismatched JSON is also treated as corrupted', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, todosByDate: {} }));
    const r = repo.load();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toEqual({ schemaVersion: 1, todosByDate: {} });
    expect(storage.raw(BACKUP_KEY)).toMatch(/"schemaVersion":99/);
  });

  it('AC-3: save() then load() round-trips identical tree', () => {
    const saved = repo.save(sampleRoot);
    expect(saved.ok).toBe(true);
    const loaded = repo.load();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.data).toEqual(sampleRoot);
  });

  it('save() returns STORAGE_QUOTA_EXCEEDED on quota violation', () => {
    storage.forceQuota = true;
    const r = repo.save(sampleRoot);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('STORAGE_QUOTA_EXCEEDED');
  });

  it('returns STORAGE_UNAVAILABLE when storage is null (private mode)', () => {
    const headless = new TodoRepository(null);
    const r = headless.load();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('STORAGE_UNAVAILABLE');
    const s = headless.save(sampleRoot);
    expect(s.ok).toBe(false);
    if (!s.ok) expect(s.error.code).toBe('STORAGE_UNAVAILABLE');
  });

  it('detectBrowserStorage returns null when probe.setItem throws (private mode 시뮬)', () => {
    const broken: Storage = {
      length: 0,
      clear: () => undefined,
      getItem: () => null,
      key: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    };
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', { configurable: true, value: broken });
    try {
      expect(detectBrowserStorage()).toBeNull();
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: original });
    }
  });

  it('detectBrowserStorage returns the working storage when probe succeeds', () => {
    const memory = new MemoryStorage();
    const proxy: Storage = {
      length: 0,
      clear: () => undefined,
      getItem: (k) => memory.getItem(k),
      key: () => null,
      removeItem: (k) => memory.removeItem(k),
      setItem: (k, v) => memory.setItem(k, v),
    };
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', { configurable: true, value: proxy });
    try {
      const detected = detectBrowserStorage();
      expect(detected).toBe(proxy);
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: original });
    }
  });
});
