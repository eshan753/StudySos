import { Assignment, PriorityBreakdown, PriorityLevel, PriorityScoreLabel } from '../types';
import { parseDueDateTime } from './dates';

export const IMPORTANCE_WEIGHTS: Record<PriorityLevel, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

export const URGENCY_POINTS = {
  OVERDUE: 60,
  WITHIN_24_HOURS: 45,
  WITHIN_3_DAYS: 30,
  WITHIN_7_DAYS: 15,
  LATER: 0,
};

export const EFFORT_BONUS_THRESHOLD_MINUTES = 120;
export const EFFORT_BONUS_POINTS = 5;

/**
 * Pure function to calculate deterministic priority score and breakdown for an assignment
 * @param assignment The assignment to score
 * @param refDate Optional reference date (defaults to new Date())
 */
export function calculatePriorityScore(
  assignment: Assignment,
  refDate: Date = new Date()
): PriorityBreakdown {
  if (assignment.completed) {
    return {
      score: 0,
      label: 'Completed',
      importancePoints: 0,
      urgencyPoints: 0,
      effortPoints: 0,
      urgencyReason: 'Completed task',
      isOverdue: false,
      hoursRemaining: 0,
    };
  }

  // 1. Importance points
  const importancePoints = IMPORTANCE_WEIGHTS[assignment.priority] ?? 10;

  // 2. Urgency points
  const dueDate = parseDueDateTime(assignment.dueDate, assignment.dueTime);
  let urgencyPoints = 0;
  let urgencyReason = 'Due later than 7 days';
  let isOverdue = false;
  let hoursRemaining = Infinity;

  if (!dueDate || isNaN(dueDate.getTime())) {
    urgencyPoints = 0;
    urgencyReason = 'Invalid or missing due date';
  } else {
    const diffMs = dueDate.getTime() - refDate.getTime();
    hoursRemaining = diffMs / (1000 * 60 * 60);

    const msInHour = 60 * 60 * 1000;
    const msInDay = 24 * msInHour;

    if (diffMs < 0) {
      isOverdue = true;
      urgencyPoints = URGENCY_POINTS.OVERDUE;
      urgencyReason = 'Overdue (+60 pts)';
    } else if (diffMs <= 1 * msInDay) {
      // Exactly 24 hours falls here
      urgencyPoints = URGENCY_POINTS.WITHIN_24_HOURS;
      urgencyReason = 'Due within 24 hours (+45 pts)';
    } else if (diffMs <= 3 * msInDay) {
      urgencyPoints = URGENCY_POINTS.WITHIN_3_DAYS;
      urgencyReason = 'Due within 3 days (+30 pts)';
    } else if (diffMs <= 7 * msInDay) {
      urgencyPoints = URGENCY_POINTS.WITHIN_7_DAYS;
      urgencyReason = 'Due within 7 days (+15 pts)';
    } else {
      urgencyPoints = URGENCY_POINTS.LATER;
      urgencyReason = 'Due later (+0 pts)';
    }
  }

  // 3. Effort bonus
  const effortPoints =
    typeof assignment.estimatedMinutes === 'number' &&
    assignment.estimatedMinutes >= EFFORT_BONUS_THRESHOLD_MINUTES
      ? EFFORT_BONUS_POINTS
      : 0;

  const totalScore = importancePoints + urgencyPoints + effortPoints;

  // Label assignment based on total score
  let label: PriorityScoreLabel = 'Low';
  if (totalScore >= 70) {
    label = 'Urgent';
  } else if (totalScore >= 50) {
    label = 'High';
  } else if (totalScore >= 30) {
    label = 'Medium';
  } else {
    label = 'Low';
  }

  return {
    score: totalScore,
    label,
    importancePoints,
    urgencyPoints,
    effortPoints,
    urgencyReason,
    isOverdue,
    hoursRemaining: isFinite(hoursRemaining) ? Math.round(hoursRemaining * 10) / 10 : 0,
  };
}

/**
 * Deterministic comparator for ordering tasks by priority score, with ties broken by due date, then title
 */
export function compareAssignmentsByPriority(
  a: Assignment,
  b: Assignment,
  refDate: Date = new Date()
): number {
  // Incomplete tasks before completed tasks
  if (a.completed && !b.completed) return 1;
  if (!a.completed && b.completed) return -1;
  if (a.completed && b.completed) {
    // If both completed, order by completedAt desc
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  }

  const scoreA = calculatePriorityScore(a, refDate).score;
  const scoreB = calculatePriorityScore(b, refDate).score;

  // Higher score first
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // Tie-breaker 1: earlier due date first
  const dueA = parseDueDateTime(a.dueDate, a.dueTime)?.getTime() ?? Infinity;
  const dueB = parseDueDateTime(b.dueDate, b.dueTime)?.getTime() ?? Infinity;
  if (dueA !== dueB) {
    return dueA - dueB;
  }

  // Tie-breaker 2: title alphabetical
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}
