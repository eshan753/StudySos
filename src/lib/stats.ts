import { Assignment, DailyCompletionCount, SubjectProgress } from '../types';
import { parseDueDateTime, getTodayDateString } from './dates';

export interface ComprehensiveStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  completionRate: number; // 0-100
  onTimeCompletedCount: number;
  onTimeCompletionRate: number; // 0-100
  completedThisWeekCount: number;
  averageEstimatedMinutes: number;
  totalEstimatedMinutes: number;
  subjectProgress: SubjectProgress[];
  last7DaysCompletions: DailyCompletionCount[];
  upcomingDeadlines: Assignment[];
}

/**
 * Calculates academic progress statistics from the list of assignments
 */
export function calculateAcademicStats(
  assignments: Assignment[],
  refDate: Date = new Date()
): ComprehensiveStats {
  const totalCount = assignments.length;
  const completedTasks = assignments.filter((a) => a.completed);
  const pendingTasks = assignments.filter((a) => !a.completed);

  // Overdue incomplete tasks
  const overdueTasks = pendingTasks.filter((a) => {
    const due = parseDueDateTime(a.dueDate, a.dueTime);
    return due ? due.getTime() < refDate.getTime() : false;
  });

  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const overdueCount = overdueTasks.length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // On-time completion calculation
  let onTimeCompletedCount = 0;
  for (const task of completedTasks) {
    if (task.completedAt) {
      const completedTime = new Date(task.completedAt).getTime();
      const dueTime = parseDueDateTime(task.dueDate, task.dueTime)?.getTime() ?? Infinity;
      if (completedTime <= dueTime) {
        onTimeCompletedCount++;
      }
    } else {
      onTimeCompletedCount++;
    }
  }

  const onTimeCompletionRate =
    completedCount > 0 ? Math.round((onTimeCompletedCount / completedCount) * 100) : 100;

  // Completed in the past 7 days
  const sevenDaysAgo = new Date(refDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = completedTasks.filter((task) => {
    if (!task.completedAt) return false;
    const cDate = new Date(task.completedAt);
    return cDate >= sevenDaysAgo && cDate <= refDate;
  });

  // Average estimated duration
  const totalEstimatedMinutes = assignments.reduce(
    (acc, task) => acc + (task.estimatedMinutes || 0),
    0
  );
  const averageEstimatedMinutes =
    totalCount > 0 ? Math.round(totalEstimatedMinutes / totalCount) : 0;

  // Per-subject progress breakdown
  const subjectsMap = new Map<string, { total: number; completed: number; estTotal: number; estDone: number }>();
  for (const task of assignments) {
    const subj = task.subject || 'Other';
    const entry = subjectsMap.get(subj) || { total: 0, completed: 0, estTotal: 0, estDone: 0 };
    entry.total++;
    entry.estTotal += task.estimatedMinutes || 0;
    if (task.completed) {
      entry.completed++;
      entry.estDone += task.estimatedMinutes || 0;
    }
    subjectsMap.set(subj, entry);
  }

  const subjectProgress: SubjectProgress[] = Array.from(subjectsMap.entries())
    .map(([subject, data]) => ({
      subject,
      total: data.total,
      completed: data.completed,
      pending: data.total - data.completed,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      estimatedMinutesTotal: data.estTotal,
      estimatedMinutesCompleted: data.estDone,
    }))
    .sort((a, b) => b.total - a.total);

  // 7-day completion chart (from 6 days ago up to today)
  const last7DaysCompletions: DailyCompletionCount[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

    const countOnThisDay = completedTasks.filter((task) => {
      if (!task.completedAt) return false;
      const cDate = new Date(task.completedAt);
      return (
        cDate.getFullYear() === d.getFullYear() &&
        cDate.getMonth() === d.getMonth() &&
        cDate.getDate() === d.getDate()
      );
    }).length;

    last7DaysCompletions.push({
      date: dateStr,
      dayLabel,
      count: countOnThisDay,
    });
  }

  // Upcoming deadlines in next 7 days
  const sevenDaysAhead = new Date(refDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = pendingTasks
    .filter((task) => {
      const due = parseDueDateTime(task.dueDate, task.dueTime);
      if (!due) return false;
      return due.getTime() >= refDate.getTime() && due.getTime() <= sevenDaysAhead.getTime();
    })
    .sort((a, b) => {
      const aTime = parseDueDateTime(a.dueDate, a.dueTime)?.getTime() ?? 0;
      const bTime = parseDueDateTime(b.dueDate, b.dueTime)?.getTime() ?? 0;
      return aTime - bTime;
    });

  return {
    totalCount,
    completedCount,
    pendingCount,
    overdueCount,
    completionRate,
    onTimeCompletedCount,
    onTimeCompletionRate,
    completedThisWeekCount: completedThisWeek.length,
    averageEstimatedMinutes,
    totalEstimatedMinutes,
    subjectProgress,
    last7DaysCompletions,
    upcomingDeadlines,
  };
}
