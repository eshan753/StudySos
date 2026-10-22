import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Assignment, PersistState, Settings, ToastMessage } from '../types';
import { DEFAULT_SETTINGS, generateUUID } from '../lib/validation';
import { loadPersistState, savePersistState, clearPersistState } from '../lib/storage';
import { generateSampleAssignments } from '../lib/sampleData';
import { mergeAssignments } from '../lib/backup';
import { formatFriendlyTime } from '../lib/dates';

interface AppContextType {
  assignments: Assignment[];
  settings: Settings;
  completedSessionIds: string[];
  storageAvailable: boolean;
  isQuotaExceeded: boolean;
  lastSavedAt: string | null;
  darkMode: boolean;
  toasts: ToastMessage[];
  isNewTaskModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  editingTask: Assignment | null;
  
  // Actions
  addAssignment: (task: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleSessionCompleted: (sessionId: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  importState: (newState: PersistState, mode: 'replace' | 'merge') => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  openNewTaskModal: () => void;
  closeNewTaskModal: () => void;
  openEditTaskModal: (task: Assignment) => void;
  closeEditTaskModal: () => void;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [completedSessionIds, setCompletedSessionIds] = useState<string[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Assignment | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Undo memory buffer
  const undoBufferRef = useRef<Map<string, { task: Assignment; timer: ReturnType<typeof setTimeout> }>>(new Map());

  // Dark mode
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studysos:theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = generateUUID();
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.durationMs ?? 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize from storage on mount
  useEffect(() => {
    const { state, storageAvailable: isAvail, errorNotice } = loadPersistState();
    setAssignments(state.assignments || []);
    setSettings(state.settings || DEFAULT_SETTINGS);
    setCompletedSessionIds(state.completedSessionIds || []);
    setStorageAvailable(isAvail);
    setInitialized(true);

    if (errorNotice) {
      addToast({
        type: 'warning',
        title: 'Storage Notice',
        message: errorNotice,
        durationMs: 7000,
      });
    }
  }, [addToast]);

  // Persist state when changes occur
  useEffect(() => {
    if (!initialized) return;

    const payload: PersistState = {
      version: 1,
      assignments,
      settings,
      completedSessionIds,
    };

    const result = savePersistState(payload);
    if (!result.success) {
      setIsQuotaExceeded(result.isQuotaExceeded);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: result.error || 'Changes could not be saved to your browser.',
      });
    } else {
      setIsQuotaExceeded(false);
      const now = new Date();
      setLastSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [assignments, settings, completedSessionIds, initialized, addToast]);

  // Sync dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('studysos:theme', 'dark');
      } catch {
        // ignore
      }
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('studysos:theme', 'light');
      } catch {
        // ignore
      }
    }
  }, [darkMode]);

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => !prev);
  };

  const addAssignment = (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment => {
    const nowIso = new Date().toISOString();
    const newTask: Assignment = {
      ...data,
      id: generateUUID(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setAssignments((prev) => [newTask, ...prev]);
    addToast({
      type: 'success',
      title: 'Assignment Added',
      message: `"${newTask.title}" added to your homework list.`,
    });
    return newTask;
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const nowIso = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: nowIso } : task))
    );
    addToast({
      type: 'info',
      title: 'Assignment Updated',
      message: 'Changes saved successfully.',
    });
  };

  const deleteAssignment = (id: string) => {
    const taskToDelete = assignments.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Remove from active list
    setAssignments((prev) => prev.filter((t) => t.id !== id));

    // Clear any previous undo timer for this id
    const existing = undoBufferRef.current.get(id);
    if (existing) clearTimeout(existing.timer);

    // Save in memory for 5-second undo
    const timer = setTimeout(() => {
      undoBufferRef.current.delete(id);
    }, 5000);

    undoBufferRef.current.set(id, { task: taskToDelete, timer });

    addToast({
      type: 'warning',
      title: 'Assignment Deleted',
      message: `"${taskToDelete.title}" was removed.`,
      action: {
        label: 'Undo',
        onClick: () => {
          const buffered = undoBufferRef.current.get(id);
          if (buffered) {
            clearTimeout(buffered.timer);
            undoBufferRef.current.delete(id);
            setAssignments((prev) => [buffered.task, ...prev]);
            addToast({
              type: 'success',
              message: `Restored "${buffered.task.title}".`,
            });
          }
        },
      },
      durationMs: 5000,
    });
  };

  const toggleComplete = (id: string) => {
    const nowIso = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const willBeComplete = !task.completed;
        return {
          ...task,
          completed: willBeComplete,
          completedAt: willBeComplete ? nowIso : null,
          updatedAt: nowIso,
        };
      })
    );
  };

  const toggleSessionCompleted = (sessionId: string) => {
    setCompletedSessionIds((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else {
        return [...prev, sessionId];
      }
    });
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Study planner preferences updated.',
    });
  };

  const loadSampleData = () => {
    const samples = generateSampleAssignments();
    setAssignments(samples);
    addToast({
      type: 'success',
      title: 'Sample Data Loaded',
      message: '7 realistic coursework assignments added across subjects.',
    });
  };

  const clearAllData = () => {
    clearPersistState();
    setAssignments([]);
    setCompletedSessionIds([]);
    addToast({
      type: 'info',
      title: 'Data Cleared',
      message: 'All local assignments and session plans have been erased.',
    });
  };

  const importState = (imported: PersistState, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setAssignments(imported.assignments);
      if (imported.settings) setSettings(imported.settings);
      if (imported.completedSessionIds) setCompletedSessionIds(imported.completedSessionIds);
      addToast({
        type: 'success',
        title: 'Backup Restored',
        message: `Replaced workspace with ${imported.assignments.length} assignments.`,
      });
    } else {
      // Merge mode: matches by id, newer updatedAt wins
      const merged = mergeAssignments(assignments, imported.assignments);
      setAssignments(merged);
      if (imported.settings) {
        setSettings((prev) => ({
          ...prev,
          ...imported.settings,
          subjects: Array.from(new Set([...prev.subjects, ...(imported.settings.subjects || [])])),
        }));
      }
      addToast({
        type: 'success',
        title: 'Backup Merged',
        message: `Successfully merged backup. Total tasks: ${merged.length}.`,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        assignments,
        settings,
        completedSessionIds,
        storageAvailable,
        isQuotaExceeded,
        lastSavedAt,
        darkMode,
        toasts,
        isNewTaskModalOpen,
        isShortcutsModalOpen,
        editingTask,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleComplete,
        toggleSessionCompleted,
        updateSettings,
        loadSampleData,
        clearAllData,
        importState,
        setDarkMode,
        toggleDarkMode,
        addToast,
        removeToast,
        openNewTaskModal: () => setIsNewTaskModalOpen(true),
        closeNewTaskModal: () => setIsNewTaskModalOpen(false),
        openEditTaskModal: (task) => setEditingTask(task),
        closeEditTaskModal: () => setEditingTask(null),
        openShortcutsModal: () => setIsShortcutsModalOpen(true),
        closeShortcutsModal: () => setIsShortcutsModalOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
