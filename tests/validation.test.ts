import { describe, it, expect } from 'vitest';
import {
  validateAssignment,
  validateSettings,
  validateAndRepairPersistData,
  DEFAULT_SETTINGS,
} from '../src/lib/validation';

describe('Validation and Data Repair Engine', () => {
  it('validates assignment title length and presence', () => {
    // Empty title
    const resEmpty = validateAssignment({ title: '' });
    expect(resEmpty.isValid).toBe(false);
    expect(resEmpty.errors.some((e) => e.field === 'title')).toBe(true);

    // Title over 120 chars
    const longTitle = 'A'.repeat(125);
    const resLong = validateAssignment({ title: longTitle });
    expect(resLong.isValid).toBe(false);
    expect(resLong.errors.some((e) => e.field === 'title' && e.message.includes('120 characters'))).toBe(true);
  });

  it('validates estimated minutes must be 5-600 in steps of 5', () => {
    const resLow = validateAssignment({ estimatedMinutes: 2 });
    expect(resLow.isValid).toBe(false);
    expect(resLow.errors.some((e) => e.field === 'estimatedMinutes')).toBe(true);

    const resHigh = validateAssignment({ estimatedMinutes: 700 });
    expect(resHigh.isValid).toBe(false);

    const resNotStep5 = validateAssignment({ estimatedMinutes: 47 });
    expect(resNotStep5.isValid).toBe(false);

    // Valid step 5
    const resValid = validateAssignment({
      title: 'Valid Task',
      subject: 'Math',
      dueDate: '2026-12-01',
      dueTime: '23:59',
      priority: 'medium',
      estimatedMinutes: 50,
    });
    expect(resValid.isValid).toBe(true);
  });

  it('flags past due date unless allowPastDueDate option is enabled', () => {
    const fixedRef = new Date('2026-10-20T12:00:00.000Z');
    const pastTask = {
      title: 'Past Task',
      subject: 'Science',
      dueDate: '2026-10-15',
      dueTime: '12:00',
      priority: 'low' as const,
      estimatedMinutes: 30,
    };

    const resDisallow = validateAssignment(pastTask, { allowPastDueDate: false, refDate: fixedRef });
    expect(resDisallow.isValid).toBe(false);
    expect(resDisallow.errors.some((e) => e.field === 'dueDate' && e.message.includes('in the past'))).toBe(true);

    const resAllow = validateAssignment(pastTask, { allowPastDueDate: true, refDate: fixedRef });
    expect(resAllow.isValid).toBe(true);
  });

  it('validates settings boundaries and ranges', () => {
    // Session minutes outside 10-180
    const resSession = validateSettings({ sessionMinutes: 5 });
    expect(resSession.isValid).toBe(false);
    expect(resSession.errors.some((e) => e.field === 'sessionMinutes')).toBe(true);

    // Capacity outside 30-720
    const resCap = validateSettings({ dailyCapacityMinutes: 900 });
    expect(resCap.isValid).toBe(false);
    expect(resCap.errors.some((e) => e.field === 'dailyCapacityMinutes')).toBe(true);

    // Valid settings
    const resValid = validateSettings(DEFAULT_SETTINGS);
    expect(resValid.isValid).toBe(true);
  });

  it('safely repairs corrupted persisted data without crashing', () => {
    const corruptData = {
      version: 1,
      assignments: [
        null, // totally invalid
        'some random string', // totally invalid
        {
          title: 'Valid Task 1',
          subject: 'Math',
          dueDate: '2026-11-01',
          dueTime: '18:00',
          priority: 'high',
          estimatedMinutes: 45,
        },
        {
          title: 'Task with unrounded minutes',
          subject: 'History',
          dueDate: '2026-11-02',
          estimatedMinutes: 43, // needs repair to 45
        },
        {
          // Missing title and due date -> unrepairable
          notes: 'Just notes without a title',
        },
      ],
      settings: {
        sessionMinutes: 9999, // Should be clamped
      },
    };

    const { repairedState, skippedCorruptedCount, notice } = validateAndRepairPersistData(corruptData);

    // Should have skipped 3 corrupted entries (null, string, task missing title/date)
    expect(skippedCorruptedCount).toBe(3);
    expect(notice).toContain('3 corrupted tasks were skipped');

    // Should have repaired the 2 salvageable tasks
    expect(repairedState.assignments.length).toBe(2);
    expect(repairedState.assignments[0].title).toBe('Valid Task 1');
    expect(repairedState.assignments[1].estimatedMinutes).toBe(45); // Rounded to 45

    // Settings clamped safely
    expect(repairedState.settings.sessionMinutes).toBe(180);
  });
});
