import { describe, it, expect } from 'vitest';
import { previewBackupData, mergeAssignments } from '../src/lib/backup';
import { Assignment } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/lib/validation';

describe('Backup and Merge Subsystem', () => {
  it('previews valid backup JSON correctly', () => {
    const validPayload = {
      version: 1,
      assignments: [
        {
          id: 'task-1',
          title: 'Math Set',
          subject: 'Math',
          dueDate: '2026-10-30',
          dueTime: '23:59',
          priority: 'high',
          estimatedMinutes: 60,
          completed: false,
        },
      ],
      settings: DEFAULT_SETTINGS,
    };

    const preview = previewBackupData(validPayload);
    expect(preview.valid).toBe(true);
    expect(preview.validAssignmentsCount).toBe(1);
    expect(preview.hasSettings).toBe(true);
    expect(preview.skippedCorruptedCount).toBe(0);
  });

  it('rejects completely invalid JSON data', () => {
    const preview = previewBackupData('not an object');
    expect(preview.valid).toBe(false);
    expect(preview.errorMessage).toContain('Invalid file format');
  });

  it('merges assignments by ID with newer updatedAt winning', () => {
    const existing: Assignment[] = [
      {
        id: 't-1',
        title: 'Original Title',
        subject: 'Math',
        dueDate: '2026-10-25',
        dueTime: '12:00',
        priority: 'low',
        estimatedMinutes: 30,
        notes: '',
        completed: false,
        completedAt: null,
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-10T12:00:00Z', // older
      },
      {
        id: 't-2',
        title: 'Keep Existing',
        subject: 'Science',
        dueDate: '2026-10-28',
        dueTime: '12:00',
        priority: 'high',
        estimatedMinutes: 45,
        notes: '',
        completed: true,
        completedAt: '2026-10-15T00:00:00Z',
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-15T12:00:00Z', // newer than incoming
      },
    ];

    const imported: Assignment[] = [
      {
        id: 't-1',
        title: 'Updated Title From Backup', // Should win because updatedAt is newer!
        subject: 'Math',
        dueDate: '2026-10-25',
        dueTime: '12:00',
        priority: 'high',
        estimatedMinutes: 60,
        notes: 'Merged notes',
        completed: true,
        completedAt: '2026-10-14T00:00:00Z',
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-14T12:00:00Z', // newer than 2026-10-10
      },
      {
        id: 't-2',
        title: 'Outdated Title',
        subject: 'Science',
        dueDate: '2026-10-28',
        dueTime: '12:00',
        priority: 'medium',
        estimatedMinutes: 45,
        notes: '',
        completed: false,
        completedAt: null,
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-11T00:00:00Z', // older than existing 2026-10-15
      },
      {
        id: 't-3',
        title: 'Brand New Task From Backup', // New ID
        subject: 'English',
        dueDate: '2026-10-29',
        dueTime: '18:00',
        priority: 'low',
        estimatedMinutes: 30,
        notes: '',
        completed: false,
        completedAt: null,
        createdAt: '2026-10-12T00:00:00Z',
        updatedAt: '2026-10-12T00:00:00Z',
      },
    ];

    const merged = mergeAssignments(existing, imported);
    expect(merged.length).toBe(3);

    const mergedT1 = merged.find((t) => t.id === 't-1');
    expect(mergedT1?.title).toBe('Updated Title From Backup');

    const mergedT2 = merged.find((t) => t.id === 't-2');
    expect(mergedT2?.title).toBe('Keep Existing');

    const mergedT3 = merged.find((t) => t.id === 't-3');
    expect(mergedT3?.title).toBe('Brand New Task From Backup');
  });
});
