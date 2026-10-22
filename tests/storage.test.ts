import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  loadPersistState,
  savePersistState,
  clearPersistState,
} from '../src/lib/storage';
import { PersistState } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/lib/validation';

describe('Storage Persistence Layer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads clean default state when localStorage is empty', () => {
    const { state, storageAvailable, errorNotice } = loadPersistState();
    expect(storageAvailable).toBe(true);
    expect(errorNotice).toBeNull();
    expect(state.assignments).toEqual([]);
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reloads state properly from localStorage', () => {
    const mockState: PersistState = {
      version: 1,
      assignments: [
        {
          id: 'test-id-1',
          title: 'Essay Draft',
          subject: 'English',
          dueDate: '2026-10-25',
          dueTime: '23:59',
          priority: 'medium',
          estimatedMinutes: 60,
          notes: 'Revision 1',
          completed: false,
          completedAt: null,
          createdAt: '2026-10-20T00:00:00Z',
          updatedAt: '2026-10-20T00:00:00Z',
        },
      ],
      settings: DEFAULT_SETTINGS,
      completedSessionIds: ['session-1'],
    };

    const saveResult = savePersistState(mockState);
    expect(saveResult.success).toBe(true);
    expect(saveResult.isQuotaExceeded).toBe(false);

    const { state, errorNotice } = loadPersistState();
    expect(errorNotice).toBeNull();
    expect(state.assignments.length).toBe(1);
    expect(state.assignments[0].title).toBe('Essay Draft');
    expect(state.completedSessionIds).toContain('session-1');
  });

  it('handles corrupted JSON in storage without throwing an exception', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid corrupted JSON syntax ...');
    const { state, errorNotice } = loadPersistState();

    expect(state.assignments).toEqual([]);
    expect(errorNotice).toContain('corrupted');
  });

  it('detects quota exceeded errors properly', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key) => {
      if (key === '__studysos_test__') return;
      const err = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw err;
    });

    const mockState: PersistState = {
      version: 1,
      assignments: [],
      settings: DEFAULT_SETTINGS,
    };

    const saveResult = savePersistState(mockState);
    expect(saveResult.success).toBe(false);
    expect(saveResult.isQuotaExceeded).toBe(true);
    expect(saveResult.error).toContain('quota exceeded');
  });

  it('clears state successfully', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, assignments: [] }));
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearPersistState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
