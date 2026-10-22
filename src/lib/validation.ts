import { Assignment, PriorityLevel, Settings, PersistState } from '../types';
import { parseDueDateTime } from './dates';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
}

export const DEFAULT_SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Languages',
  'Computer Science',
  'Other',
];

export const DEFAULT_SETTINGS: Settings = {
  sessionMinutes: 45,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  sessionsBeforeLongBreak: 4,
  dailyStudyStart: '16:00',
  dailyCapacityMinutes: 180,
  subjects: DEFAULT_SUBJECTS,
};

/**
 * Validates a single assignment object
 */
export function validateAssignment(
  input: Partial<Assignment>,
  options: { allowPastDueDate?: boolean; refDate?: Date } = {}
): ValidationResult<Assignment> {
  const errors: ValidationError[] = [];
  const refDate = options.refDate ?? new Date();

  // 1. Title validation
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) {
    errors.push({
      field: 'title',
      message: 'Enter a task title between 1 and 120 characters.',
    });
  } else if (title.length > 120) {
    errors.push({
      field: 'title',
      message: 'Shorten your title to 120 characters or fewer.',
    });
  }

  // 2. Subject validation
  const subject = typeof input.subject === 'string' ? input.subject.trim() : '';
  if (!subject) {
    errors.push({
      field: 'subject',
      message: 'Select or enter a subject for this assignment.',
    });
  } else if (subject.length > 50) {
    errors.push({
      field: 'subject',
      message: 'Subject name must be 50 characters or fewer.',
    });
  }

  // 3. Due Date validation
  const dueDate = typeof input.dueDate === 'string' ? input.dueDate.trim() : '';
  if (!dueDate) {
    errors.push({
      field: 'dueDate',
      message: 'Choose a due date in YYYY-MM-DD format.',
    });
  } else {
    // Check YYYY-MM-DD format
    const match = /^\d{4}-\d{2}-\d{2}$/.test(dueDate);
    const parsed = parseDueDateTime(dueDate, input.dueTime);
    if (!match || !parsed || isNaN(parsed.getTime())) {
      errors.push({
        field: 'dueDate',
        message: 'Provide a valid calendar due date.',
      });
    } else if (!options.allowPastDueDate) {
      // Check if past
      if (parsed.getTime() < refDate.getTime()) {
        errors.push({
          field: 'dueDate',
          message: 'This due date is in the past. Confirm if you wish to save anyway.',
        });
      }
    }
  }

  // 4. Due Time validation
  const dueTime = typeof input.dueTime === 'string' && input.dueTime.trim() !== ''
    ? input.dueTime.trim()
    : '23:59';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime)) {
    errors.push({
      field: 'dueTime',
      message: 'Enter a valid time in 24-hour format (HH:mm).',
    });
  }

  // 5. Priority validation
  const priority = input.priority as PriorityLevel;
  if (!['low', 'medium', 'high'].includes(priority)) {
    errors.push({
      field: 'priority',
      message: 'Select a priority level: Low, Medium, or High.',
    });
  }

  // 6. Estimated Minutes validation (5-600 in steps of 5)
  const est = Number(input.estimatedMinutes);
  if (isNaN(est) || est < 5 || est > 600 || est % 5 !== 0) {
    errors.push({
      field: 'estimatedMinutes',
      message: 'Enter an estimated duration between 5 and 600 minutes (in 5-minute increments).',
    });
  }

  // 7. Notes validation
  const notes = typeof input.notes === 'string' ? input.notes : '';
  if (notes.length > 1000) {
    errors.push({
      field: 'notes',
      message: 'Keep notes within 1,000 characters.',
    });
  }

  const isValid = errors.length === 0;

  let validatedData: Assignment | undefined = undefined;
  if (isValid) {
    const nowIso = new Date().toISOString();
    validatedData = {
      id: input.id && typeof input.id === 'string' ? input.id : generateUUID(),
      title,
      subject,
      dueDate,
      dueTime,
      priority,
      estimatedMinutes: est,
      notes,
      completed: Boolean(input.completed),
      completedAt: input.completed ? (input.completedAt || nowIso) : null,
      createdAt: input.createdAt || nowIso,
      updatedAt: nowIso,
    };
  }

  return {
    isValid,
    errors,
    data: validatedData,
  };
}

/**
 * Validates settings configuration
 */
export function validateSettings(input: Partial<Settings>): ValidationResult<Settings> {
  const errors: ValidationError[] = [];

  const sessionMinutes = Number(input.sessionMinutes);
  if (isNaN(sessionMinutes) || sessionMinutes < 10 || sessionMinutes > 180) {
    errors.push({
      field: 'sessionMinutes',
      message: 'Set session length between 10 and 180 minutes.',
    });
  }

  const shortBreakMinutes = Number(input.shortBreakMinutes);
  if (isNaN(shortBreakMinutes) || shortBreakMinutes < 1 || shortBreakMinutes > 60) {
    errors.push({
      field: 'shortBreakMinutes',
      message: 'Set short break between 1 and 60 minutes.',
    });
  }

  const longBreakMinutes = Number(input.longBreakMinutes);
  if (isNaN(longBreakMinutes) || longBreakMinutes < 5 || longBreakMinutes > 90) {
    errors.push({
      field: 'longBreakMinutes',
      message: 'Set long break between 5 and 90 minutes.',
    });
  }

  const sessionsBeforeLongBreak = Number(input.sessionsBeforeLongBreak);
  if (isNaN(sessionsBeforeLongBreak) || sessionsBeforeLongBreak < 2 || sessionsBeforeLongBreak > 8) {
    errors.push({
      field: 'sessionsBeforeLongBreak',
      message: 'Set sessions before long break between 2 and 8.',
    });
  }

  const dailyStudyStart = typeof input.dailyStudyStart === 'string' ? input.dailyStudyStart.trim() : '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(dailyStudyStart)) {
    errors.push({
      field: 'dailyStudyStart',
      message: 'Specify study start time in 24-hour format (e.g. 16:00).',
    });
  }

  const dailyCapacityMinutes = Number(input.dailyCapacityMinutes);
  if (isNaN(dailyCapacityMinutes) || dailyCapacityMinutes < 30 || dailyCapacityMinutes > 720) {
    errors.push({
      field: 'dailyCapacityMinutes',
      message: 'Set daily study capacity between 30 and 720 minutes (0.5 to 12 hours).',
    });
  }

  const subjects = Array.isArray(input.subjects)
    ? input.subjects.filter((s) => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim())
    : DEFAULT_SUBJECTS;

  if (subjects.length === 0) {
    errors.push({
      field: 'subjects',
      message: 'Provide at least one subject category.',
    });
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          sessionMinutes,
          shortBreakMinutes,
          longBreakMinutes,
          sessionsBeforeLongBreak,
          dailyStudyStart,
          dailyCapacityMinutes,
          subjects,
        }
      : undefined,
  };
}

/**
 * Validates and repairs persisted data from localStorage or backup imports.
 * Discards unrepairable items and collects how many corrupted items were skipped.
 */
export function validateAndRepairPersistData(raw: unknown): {
  repairedState: PersistState;
  skippedCorruptedCount: number;
  notice: string | null;
} {
  let skippedCorruptedCount = 0;

  if (!raw || typeof raw !== 'object') {
    return {
      repairedState: {
        version: 1,
        assignments: [],
        settings: DEFAULT_SETTINGS,
        completedSessionIds: [],
      },
      skippedCorruptedCount: 0,
      notice: null,
    };
  }

  const obj = raw as Record<string, unknown>;

  // Validate or repair settings
  const rawSettings = obj.settings && typeof obj.settings === 'object' ? obj.settings : {};
  const settingsResult = validateSettings(rawSettings as Partial<Settings>);
  const settings: Settings = settingsResult.isValid && settingsResult.data
    ? settingsResult.data
    : {
        ...DEFAULT_SETTINGS,
        ...(rawSettings as Partial<Settings>),
        sessionMinutes: clamp(Number((rawSettings as Settings).sessionMinutes) || 45, 10, 180),
        shortBreakMinutes: clamp(Number((rawSettings as Settings).shortBreakMinutes) || 10, 1, 60),
        longBreakMinutes: clamp(Number((rawSettings as Settings).longBreakMinutes) || 20, 5, 90),
        sessionsBeforeLongBreak: clamp(Number((rawSettings as Settings).sessionsBeforeLongBreak) || 4, 2, 8),
        dailyStudyStart: typeof (rawSettings as Settings).dailyStudyStart === 'string' &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test((rawSettings as Settings).dailyStudyStart)
            ? (rawSettings as Settings).dailyStudyStart
            : '16:00',
        dailyCapacityMinutes: clamp(Number((rawSettings as Settings).dailyCapacityMinutes) || 180, 30, 720),
        subjects: Array.isArray((rawSettings as Settings).subjects) && (rawSettings as Settings).subjects.length > 0
          ? (rawSettings as Settings).subjects.map(String)
          : DEFAULT_SUBJECTS,
      };

  // Validate assignments list
  const assignments: Assignment[] = [];
  if (Array.isArray(obj.assignments)) {
    for (const item of obj.assignments) {
      if (!item || typeof item !== 'object') {
        skippedCorruptedCount++;
        continue;
      }
      const rawTask = item as Partial<Assignment>;
      // Allow past due dates when loading stored/persisted data
      const validation = validateAssignment(rawTask, { allowPastDueDate: true });
      if (validation.isValid && validation.data) {
        assignments.push(validation.data);
      } else {
        // Try simple auto-repair if title and dueDate exist
        if (
          typeof rawTask.title === 'string' &&
          rawTask.title.trim().length > 0 &&
          typeof rawTask.dueDate === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(rawTask.dueDate.trim())
        ) {
          const repairedTask: Assignment = {
            id: typeof rawTask.id === 'string' && rawTask.id.length > 0 ? rawTask.id : generateUUID(),
            title: rawTask.title.trim().slice(0, 120),
            subject: typeof rawTask.subject === 'string' && rawTask.subject.trim() ? rawTask.subject.trim() : 'Other',
            dueDate: rawTask.dueDate.trim(),
            dueTime: typeof rawTask.dueTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(rawTask.dueTime)
              ? rawTask.dueTime
              : '23:59',
            priority: ['low', 'medium', 'high'].includes(rawTask.priority as string)
              ? (rawTask.priority as PriorityLevel)
              : 'medium',
            estimatedMinutes: roundToNearestFive(clamp(Number(rawTask.estimatedMinutes) || 30, 5, 600)),
            notes: typeof rawTask.notes === 'string' ? rawTask.notes.slice(0, 1000) : '',
            completed: Boolean(rawTask.completed),
            completedAt: rawTask.completed ? (rawTask.completedAt || new Date().toISOString()) : null,
            createdAt: rawTask.createdAt || new Date().toISOString(),
            updatedAt: rawTask.updatedAt || new Date().toISOString(),
          };
          assignments.push(repairedTask);
        } else {
          skippedCorruptedCount++;
        }
      }
    }
  }

  const completedSessionIds = Array.isArray(obj.completedSessionIds)
    ? obj.completedSessionIds.filter((id) => typeof id === 'string')
    : [];

  const notice = skippedCorruptedCount > 0
    ? `${skippedCorruptedCount} corrupted ${skippedCorruptedCount === 1 ? 'task was' : 'tasks were'} skipped during load.`
    : null;

  return {
    repairedState: {
      version: 1,
      assignments,
      settings,
      completedSessionIds,
    },
    skippedCorruptedCount,
    notice,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundToNearestFive(num: number): number {
  return Math.round(num / 5) * 5 || 5;
}

/**
 * Standard UUID generator with crypto.randomUUID fallback
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
