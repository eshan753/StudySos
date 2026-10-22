import { Assignment, PersistState } from '../types';
import { getTodayDateString } from './dates';
import { validateAndRepairPersistData } from './validation';

export interface ImportPreview {
  valid: boolean;
  version: number;
  totalAssignmentsInFile: number;
  validAssignmentsCount: number;
  skippedCorruptedCount: number;
  hasSettings: boolean;
  importedState?: PersistState;
  errorMessage?: string;
}

/**
 * Generates and triggers download of a JSON backup file
 */
export function exportBackup(state: PersistState): void {
  const dateStr = getTodayDateString();
  const filename = `studysos-backup-${dateStr}.json`;
  const jsonContent = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and previews a parsed JSON backup
 */
export function previewBackupData(parsedJson: unknown): ImportPreview {
  try {
    if (!parsedJson || typeof parsedJson !== 'object') {
      return {
        valid: false,
        version: 0,
        totalAssignmentsInFile: 0,
        validAssignmentsCount: 0,
        skippedCorruptedCount: 0,
        hasSettings: false,
        errorMessage: 'Invalid file format: JSON root must be an object.',
      };
    }

    const { repairedState, skippedCorruptedCount } = validateAndRepairPersistData(parsedJson);
    const rawObj = parsedJson as Record<string, unknown>;
    const rawAssignmentsCount = Array.isArray(rawObj.assignments) ? rawObj.assignments.length : 0;

    return {
      valid: true,
      version: repairedState.version,
      totalAssignmentsInFile: rawAssignmentsCount,
      validAssignmentsCount: repairedState.assignments.length,
      skippedCorruptedCount,
      hasSettings: Boolean(rawObj.settings),
      importedState: repairedState,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      version: 0,
      totalAssignmentsInFile: 0,
      validAssignmentsCount: 0,
      skippedCorruptedCount: 0,
      hasSettings: false,
      errorMessage: err instanceof Error ? err.message : 'Failed to parse backup data.',
    };
  }
}

/**
 * Merges imported assignments with existing assignments:
 * matches by id; newer updatedAt wins. Any new id is added.
 */
export function mergeAssignments(
  currentAssignments: Assignment[],
  importedAssignments: Assignment[]
): Assignment[] {
  const map = new Map<string, Assignment>();

  // Add existing
  for (const task of currentAssignments) {
    map.set(task.id, task);
  }

  // Merge imported
  for (const imp of importedAssignments) {
    const existing = map.get(imp.id);
    if (!existing) {
      map.set(imp.id, imp);
    } else {
      const existingTime = new Date(existing.updatedAt || 0).getTime();
      const importedTime = new Date(imp.updatedAt || 0).getTime();
      // Newer updatedAt wins
      if (importedTime >= existingTime) {
        map.set(imp.id, imp);
      }
    }
  }

  return Array.from(map.values());
}
