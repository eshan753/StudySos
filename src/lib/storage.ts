import { PersistState, Settings, Assignment } from '../types';
import { validateAndRepairPersistData, DEFAULT_SETTINGS } from './validation';

export const STORAGE_KEY = 'studysos:v1';

export interface StorageStatus {
  isAvailable: boolean;
  isQuotaExceeded: boolean;
  errorMessage?: string;
  lastSavedAt?: string;
}

/**
 * Checks if localStorage is available and working
 */
export function checkStorageAvailability(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const testKey = '__studysos_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads and validates persistent state from localStorage
 */
export function loadPersistState(): {
  state: PersistState;
  storageAvailable: boolean;
  errorNotice: string | null;
} {
  const isAvailable = checkStorageAvailability();
  if (!isAvailable) {
    return {
      state: {
        version: 1,
        assignments: [],
        settings: DEFAULT_SETTINGS,
        completedSessionIds: [],
      },
      storageAvailable: false,
      errorNotice: 'Local storage is disabled or unavailable in this browser. Changes will not be saved permanently.',
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        state: {
          version: 1,
          assignments: [],
          settings: DEFAULT_SETTINGS,
          completedSessionIds: [],
        },
        storageAvailable: true,
        errorNotice: null,
      };
    }

    const parsed = JSON.parse(raw);
    const { repairedState, notice } = validateAndRepairPersistData(parsed);

    return {
      state: repairedState,
      storageAvailable: true,
      errorNotice: notice,
    };
  } catch (err) {
    return {
      state: {
        version: 1,
        assignments: [],
        settings: DEFAULT_SETTINGS,
        completedSessionIds: [],
      },
      storageAvailable: true,
      errorNotice: 'Stored data was corrupted. Initialized with a clean state.',
    };
  }
}

/**
 * Saves state to localStorage safely
 */
export function savePersistState(state: PersistState): {
  success: boolean;
  isQuotaExceeded: boolean;
  error?: string;
} {
  if (!checkStorageAvailability()) {
    return {
      success: false,
      isQuotaExceeded: false,
      error: 'Storage is not available.',
    };
  }

  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, isQuotaExceeded: false };
  } catch (err: unknown) {
    const isQuota =
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

    return {
      success: false,
      isQuotaExceeded: isQuota,
      error: isQuota
        ? 'Browser storage quota exceeded (~5 MB limit reached). Please export and clear old tasks.'
        : 'Failed to write to local storage.',
    };
  }
}

/**
 * Clears StudySOS storage completely
 */
export function clearPersistState(): boolean {
  if (!checkStorageAvailability()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
