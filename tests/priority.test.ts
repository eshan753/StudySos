import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, compareAssignmentsByPriority } from '../src/lib/priority';
import { Assignment } from '../src/types';

describe('Priority Scoring System', () => {
  const fixedNow = new Date('2026-10-20T12:00:00.000Z');

  const baseTask: Assignment = {
    id: 'test-1',
    title: 'Calculus Assignment',
    subject: 'Math',
    dueDate: '2026-10-21',
    dueTime: '12:00',
    priority: 'high', // +30
    estimatedMinutes: 60, // < 120, so 0 effort bonus
    notes: '',
    completed: false,
    completedAt: null,
    createdAt: '2026-10-19T00:00:00.000Z',
    updatedAt: '2026-10-19T00:00:00.000Z',
  };

  it('scores exactly 24 hours until due as within 24h (+45 points)', () => {
    // Exactly 24h from 2026-10-20T12:00:00.000Z
    const task: Assignment = {
      ...baseTask,
      dueDate: '2026-10-21',
      dueTime: '12:00',
      priority: 'high', // 30
      estimatedMinutes: 60, // 0
    };
    const breakdown = calculatePriorityScore(task, fixedNow);
    // 30 (high) + 45 (<=24h) + 0 = 75
    expect(breakdown.urgencyPoints).toBe(45);
    expect(breakdown.score).toBe(75);
    expect(breakdown.label).toBe('Urgent');
    expect(breakdown.isOverdue).toBe(false);
  });

  it('scores overdue by one minute (+60 points)', () => {
    // 12:00 - 1 minute = 11:59
    const task: Assignment = {
      ...baseTask,
      dueDate: '2026-10-20',
      dueTime: '11:59',
      priority: 'medium', // 20
      estimatedMinutes: 30, // 0
    };
    const breakdown = calculatePriorityScore(task, fixedNow);
    // 20 (medium) + 60 (overdue) + 0 = 80
    expect(breakdown.urgencyPoints).toBe(60);
    expect(breakdown.score).toBe(80);
    expect(breakdown.label).toBe('Urgent');
    expect(breakdown.isOverdue).toBe(true);
  });

  it('returns 0 score and Completed label for completed task', () => {
    const task: Assignment = {
      ...baseTask,
      completed: true,
      completedAt: '2026-10-20T10:00:00.000Z',
    };
    const breakdown = calculatePriorityScore(task, fixedNow);
    expect(breakdown.score).toBe(0);
    expect(breakdown.label).toBe('Completed');
    expect(breakdown.urgencyPoints).toBe(0);
  });

  it('handles invalid due date gracefully without crashing', () => {
    const task: Assignment = {
      ...baseTask,
      dueDate: 'invalid-date',
      dueTime: '99:99',
      priority: 'low', // 10
    };
    const breakdown = calculatePriorityScore(task, fixedNow);
    expect(breakdown.urgencyPoints).toBe(0);
    expect(breakdown.score).toBe(10);
    expect(breakdown.label).toBe('Low');
  });

  it('adds effort bonus of +5 points when estimatedMinutes >= 120', () => {
    const taskSmall: Assignment = {
      ...baseTask,
      dueDate: '2026-10-25', // > 3 days, <= 7 days -> +15
      dueTime: '12:00',
      priority: 'medium', // 20
      estimatedMinutes: 115,
    };
    const breakdownSmall = calculatePriorityScore(taskSmall, fixedNow);
    // 20 + 15 + 0 = 35
    expect(breakdownSmall.effortPoints).toBe(0);
    expect(breakdownSmall.score).toBe(35);

    const taskLarge: Assignment = {
      ...taskSmall,
      estimatedMinutes: 120, // Threshold met!
    };
    const breakdownLarge = calculatePriorityScore(taskLarge, fixedNow);
    // 20 + 15 + 5 = 40
    expect(breakdownLarge.effortPoints).toBe(5);
    expect(breakdownLarge.score).toBe(40);
  });

  it('breaks ties first by earlier due date, then alphabetically by title', () => {
    const taskA: Assignment = {
      ...baseTask,
      id: 'a',
      title: 'Biology Lab',
      dueDate: '2026-10-25',
      priority: 'medium',
      estimatedMinutes: 60,
    };
    const taskB: Assignment = {
      ...baseTask,
      id: 'b',
      title: 'Art Essay',
      dueDate: '2026-10-24', // Due earlier!
      priority: 'medium',
      estimatedMinutes: 60,
    };
    // Both have same importance and urgency bracket (3-7 days = +15) -> same score
    const cmp = compareAssignmentsByPriority(taskA, taskB, fixedNow);
    expect(cmp).toBeGreaterThan(0); // taskB should come first (so taskA > taskB)

    // Same due date, test alphabetical by title
    const taskC: Assignment = { ...taskA, id: 'c', title: 'Calculus' };
    const taskD: Assignment = { ...taskA, id: 'd', title: 'Algebra' };
    const cmpTitle = compareAssignmentsByPriority(taskC, taskD, fixedNow);
    expect(cmpTitle).toBeGreaterThan(0); // 'Algebra' comes before 'Calculus'
  });
});
