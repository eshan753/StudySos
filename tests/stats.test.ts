import { describe, it, expect } from 'vitest';
import { calculateAcademicStats } from '../src/lib/stats';
import { Assignment } from '../src/types';

describe('Academic Stats Calculation Engine', () => {
  const fixedNow = new Date('2026-10-20T12:00:00.000Z');

  const sampleTasks: Assignment[] = [
    {
      id: '1',
      title: 'Math HW',
      subject: 'Math',
      dueDate: '2026-10-18', // was due 2 days ago
      dueTime: '17:00',
      priority: 'high',
      estimatedMinutes: 60,
      notes: '',
      completed: true,
      completedAt: '2026-10-18T16:00:00.000Z', // Completed on time!
      createdAt: '2026-10-15T00:00:00Z',
      updatedAt: '2026-10-18T16:00:00Z',
    },
    {
      id: '2',
      title: 'Science Lab',
      subject: 'Science',
      dueDate: '2026-10-17',
      dueTime: '12:00',
      priority: 'medium',
      estimatedMinutes: 90,
      notes: '',
      completed: true,
      completedAt: '2026-10-17T15:00:00.000Z', // Completed 3h late!
      createdAt: '2026-10-15T00:00:00Z',
      updatedAt: '2026-10-17T15:00:00Z',
    },
    {
      id: '3',
      title: 'English Reading',
      subject: 'English',
      dueDate: '2026-10-22', // Due in 2 days (upcoming deadline)
      dueTime: '23:59',
      priority: 'low',
      estimatedMinutes: 30,
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-19T00:00:00Z',
      updatedAt: '2026-10-19T00:00:00Z',
    },
    {
      id: '4',
      title: 'Overdue History',
      subject: 'History',
      dueDate: '2026-10-19', // Due yesterday, not completed!
      dueTime: '23:59',
      priority: 'high',
      estimatedMinutes: 60,
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
  ];

  it('computes correct overall counts and rates', () => {
    const stats = calculateAcademicStats(sampleTasks, fixedNow);

    expect(stats.totalCount).toBe(4);
    expect(stats.completedCount).toBe(2);
    expect(stats.pendingCount).toBe(2);
    expect(stats.overdueCount).toBe(1); // Task 4 is overdue
    expect(stats.completionRate).toBe(50); // 2 of 4 = 50%
  });

  it('accurately calculates on-time completion percentage', () => {
    const stats = calculateAcademicStats(sampleTasks, fixedNow);

    // 1 of 2 completed tasks was completed before due date
    expect(stats.onTimeCompletedCount).toBe(1);
    expect(stats.onTimeCompletionRate).toBe(50);
  });

  it('computes average estimated minutes accurately', () => {
    const stats = calculateAcademicStats(sampleTasks, fixedNow);

    // (60 + 90 + 30 + 60) / 4 = 240 / 4 = 60
    expect(stats.totalEstimatedMinutes).toBe(240);
    expect(stats.averageEstimatedMinutes).toBe(60);
  });

  it('aggregates per-subject progress accurately', () => {
    const stats = calculateAcademicStats(sampleTasks, fixedNow);

    const math = stats.subjectProgress.find((s) => s.subject === 'Math');
    expect(math).toBeDefined();
    expect(math?.total).toBe(1);
    expect(math?.completed).toBe(1);
    expect(math?.completionRate).toBe(100);

    const english = stats.subjectProgress.find((s) => s.subject === 'English');
    expect(english).toBeDefined();
    expect(english?.total).toBe(1);
    expect(english?.completed).toBe(0);
    expect(english?.completionRate).toBe(0);
  });

  it('filters upcoming deadlines within 7 days', () => {
    const stats = calculateAcademicStats(sampleTasks, fixedNow);

    // Task 3 is due 2026-10-22 (within 7 days from Oct 20)
    expect(stats.upcomingDeadlines.length).toBe(1);
    expect(stats.upcomingDeadlines[0].id).toBe('3');
  });
});
