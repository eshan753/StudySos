import { Assignment } from '../types';
import { getTodayDateString, pad2 } from './dates';

/**
 * Creates 7 realistic sample assignments with dates relative to today
 */
export function generateSampleAssignments(refDate: Date = new Date()): Assignment[] {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  const makeDateOffset = (dayOffset: number): string => {
    const target = new Date(year, month, day + dayOffset);
    return `${target.getFullYear()}-${pad2(target.getMonth() + 1)}-${pad2(target.getDate())}`;
  };

  const nowIso = refDate.toISOString();
  const yesterdayIso = new Date(refDate.getTime() - 24 * 3600 * 1000).toISOString();

  return [
    {
      id: 'sample-math-calculus',
      title: 'AP Calculus: Optimization & Related Rates Problem Set',
      subject: 'Math',
      dueDate: makeDateOffset(0), // Due today
      dueTime: '17:00',
      priority: 'high',
      estimatedMinutes: 90,
      notes: 'Complete problems 12 to 28 on Chapter 4. Show all derivative step work.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-science-lab',
      title: 'Organic Chemistry: Esterification Lab Report & Analysis',
      subject: 'Science',
      dueDate: makeDateOffset(1), // Due tomorrow
      dueTime: '23:59',
      priority: 'high',
      estimatedMinutes: 120, // >= 120 gets effort bonus!
      notes: 'Include percent yield calculation, IR spectra graphs, and error analysis section.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-english-essay',
      title: 'Literature: Macbeth Thematic Essay 2nd Draft',
      subject: 'English',
      dueDate: makeDateOffset(3), // Due in 3 days
      dueTime: '20:00',
      priority: 'medium',
      estimatedMinutes: 75,
      notes: 'Incorporate peer review edits regarding Lady Macbeth’s soliloquy in Act 1.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-cs-algorithm',
      title: 'CS 101: Implement Red-Black Balanced Binary Search Tree',
      subject: 'Computer Science',
      dueDate: makeDateOffset(4), // Due in 4 days
      dueTime: '23:59',
      priority: 'medium',
      estimatedMinutes: 150, // >= 120 gets effort bonus
      notes: 'Implement left/right rotations and insertion color flip rebalancing. Pass all 14 unit tests.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-history-primary',
      title: 'World History: Cold War Primary Source Document Synthesis',
      subject: 'History',
      dueDate: makeDateOffset(6), // Due in 6 days
      dueTime: '18:00',
      priority: 'low',
      estimatedMinutes: 45,
      notes: 'Compare telegrams from 1962 Cuban Missile Crisis. 500-word response.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-lang-vocab',
      title: 'Spanish III: Subjunctive Mood Conjugation & Audio Record',
      subject: 'Languages',
      dueDate: makeDateOffset(8), // Due in 8 days
      dueTime: '23:59',
      priority: 'low',
      estimatedMinutes: 30,
      notes: 'Record 2-minute dialogue describing future college plans with subjunctive clauses.',
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'sample-physics-quiz',
      title: 'Physics: Kinematics & Vector Resolution Review Sheet',
      subject: 'Science',
      dueDate: makeDateOffset(-1), // Due yesterday, marked completed!
      dueTime: '15:30',
      priority: 'medium',
      estimatedMinutes: 60,
      notes: 'Reviewed friction formulas and projectile motion trajectories.',
      completed: true,
      completedAt: yesterdayIso,
      createdAt: yesterdayIso,
      updatedAt: yesterdayIso,
    },
  ];
}
