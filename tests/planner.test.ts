import { describe, it, expect } from 'vitest';
import { generateStudySchedule } from '../src/lib/planner';
import { Assignment, Settings } from '../src/types';

describe('Study Planner Scheduling Engine', () => {
  const defaultSettings: Settings = {
    sessionMinutes: 45,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 2, // Every 2 sessions get a long break
    dailyStudyStart: '16:00',
    dailyCapacityMinutes: 90, // Capacity for 2 x 45min sessions per day
    subjects: ['Math', 'Science'],
  };

  it('splits task into chunks of up to sessionMinutes', () => {
    const task: Assignment = {
      id: 'task-long',
      title: 'Long Chemistry Project',
      subject: 'Science',
      dueDate: '2026-10-30',
      dueTime: '23:59',
      priority: 'high',
      estimatedMinutes: 100, // 45 + 45 + 10 = 3 sessions
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };

    const result = generateStudySchedule([task], { ...defaultSettings, dailyCapacityMinutes: 300 }, '2026-10-21', 1);
    const sessionBlocks = result.schedules[0].blocks.filter((b) => b.type === 'session');
    expect(sessionBlocks.length).toBe(3);
    expect(sessionBlocks[0].durationMinutes).toBe(45);
    expect(sessionBlocks[1].durationMinutes).toBe(45);
    expect(sessionBlocks[2].durationMinutes).toBe(10);
    expect(result.totalPlannedMinutes).toBe(100);
  });

  it('inserts short and long breaks correctly according to cycle', () => {
    const task1: Assignment = {
      id: 't1',
      title: 'Task 1',
      subject: 'Math',
      dueDate: '2026-10-30',
      dueTime: '23:59',
      priority: 'high',
      estimatedMinutes: 45,
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };
    const task2: Assignment = {
      ...task1,
      id: 't2',
      title: 'Task 2',
      estimatedMinutes: 45,
    };
    const task3: Assignment = {
      ...task1,
      id: 't3',
      title: 'Task 3',
      estimatedMinutes: 45,
    };

    // sessionsBeforeLongBreak = 2
    // Day 1 capacity = 300m so all fit today
    const customSettings: Settings = {
      ...defaultSettings,
      dailyCapacityMinutes: 300,
      sessionsBeforeLongBreak: 2,
      shortBreakMinutes: 10,
      longBreakMinutes: 25,
    };

    const result = generateStudySchedule([task1, task2, task3], customSettings, '2026-10-21', 1);
    const blocks = result.schedules[0].blocks;

    // Block 0: Session 1
    expect(blocks[0].type).toBe('session');
    // Block 1: Break after 1 session -> short break (10m)
    expect(blocks[1].type).toBe('shortBreak');
    expect(blocks[1].durationMinutes).toBe(10);
    // Block 2: Session 2
    expect(blocks[2].type).toBe('session');
    // Block 3: Break after 2 sessions -> long break (25m)!
    expect(blocks[3].type).toBe('longBreak');
    expect(blocks[3].durationMinutes).toBe(25);
  });

  it('stops scheduling when dailyCapacityMinutes is reached and carries overflow to next day', () => {
    const task: Assignment = {
      id: 'overflow-task',
      title: 'Big Paper',
      subject: 'History',
      dueDate: '2026-10-30',
      dueTime: '23:59',
      priority: 'medium',
      estimatedMinutes: 180, // Needs 4 sessions of 45m
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };

    // dailyCapacityMinutes = 90m (2 sessions per day)
    const result = generateStudySchedule([task], defaultSettings, '2026-10-21', 2);
    expect(result.schedules.length).toBe(2);

    // Day 1 should have exactly 90 minutes of study
    expect(result.schedules[0].totalStudyMinutes).toBe(90);
    // Day 2 should have the remaining 90 minutes of study
    expect(result.schedules[1].totalStudyMinutes).toBe(90);
  });

  it('flags sessions as at-risk if scheduled after the deadline', () => {
    const tightTask: Assignment = {
      id: 'urgent-tight',
      title: 'Past Due Homework',
      subject: 'English',
      dueDate: '2026-10-21',
      dueTime: '16:30', // Starts at 16:00, needs 45 min -> ends at 16:45, AFTER 16:30!
      priority: 'high',
      estimatedMinutes: 45,
      notes: '',
      completed: false,
      completedAt: null,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };

    const result = generateStudySchedule([tightTask], defaultSettings, '2026-10-21', 1);
    const session = result.schedules[0].blocks.find((b) => b.type === 'session');
    expect(session?.isAtRisk).toBe(true);
    expect(session?.atRiskReason).toContain('Session ends after deadline');
    expect(result.atRiskCount).toBeGreaterThan(0);
  });
});
