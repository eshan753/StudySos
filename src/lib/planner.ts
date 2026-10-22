import { Assignment, DailySchedule, Settings, StudySessionBlock } from '../types';
import { addMinutesToDate, formatFriendlyDate, formatFriendlyTime, formatHoursMinutes, parseDueDateTime } from './dates';
import { compareAssignmentsByPriority } from './priority';

interface ChunkItem {
  assignment: Assignment;
  sessionIndex: number;
  totalSessions: number;
  durationMinutes: number;
}

/**
 * Splits pending assignments into scheduled daily blocks with breaks,
 * respecting daily study capacity and detecting at-risk deadlines.
 */
export function generateStudySchedule(
  assignments: Assignment[],
  settings: Settings,
  startDateStr: string,
  daysCount: number = 7,
  completedSessionIds: string[] = []
): {
  schedules: DailySchedule[];
  totalPlannedMinutes: number;
  totalPlannedSessions: number;
  atRiskCount: number;
} {
  // 1. Filter only incomplete assignments and sort by deterministic priority
  const incompleteTasks = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => compareAssignmentsByPriority(a, b, new Date()));

  // 2. Break tasks into session chunks of up to settings.sessionMinutes
  const sessionQueue: ChunkItem[] = [];
  const sessionLength = Math.max(10, settings.sessionMinutes || 45);

  for (const task of incompleteTasks) {
    let remaining = task.estimatedMinutes;
    const taskChunks: number[] = [];

    while (remaining > 0) {
      if (remaining <= sessionLength) {
        taskChunks.push(remaining);
        remaining = 0;
      } else {
        taskChunks.push(sessionLength);
        remaining -= sessionLength;
      }
    }

    const totalSessions = taskChunks.length;
    taskChunks.forEach((chunkDuration, index) => {
      sessionQueue.push({
        assignment: task,
        sessionIndex: index + 1,
        totalSessions,
        durationMinutes: chunkDuration,
      });
    });
  }

  // 3. Prepare days
  const completedSet = new Set(completedSessionIds);
  const schedules: DailySchedule[] = [];
  let queuePointer = 0;
  let globalSessionCounter = 0;
  let totalPlannedMinutes = 0;
  let totalPlannedSessions = 0;
  let atRiskCount = 0;

  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const baseDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);

  const [startHour, startMin] = (settings.dailyStudyStart || '16:00')
    .split(':')
    .map((v) => parseInt(v, 10) || 0);

  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDay = new Date(baseDate);
    currentDay.setDate(baseDate.getDate() + dayOffset);

    const year = currentDay.getFullYear();
    const month = (currentDay.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDay.getDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayName = currentDay.toLocaleDateString(undefined, { weekday: 'long' });
    const formattedDate = formatFriendlyDate(dateKey);

    const blocks: StudySessionBlock[] = [];
    let dayStudyMinutesUsed = 0;
    let dayBreakMinutesUsed = 0;

    // Time cursor for this day
    let timeCursor = new Date(year, currentDay.getMonth(), currentDay.getDate(), startHour, startMin, 0, 0);

    while (queuePointer < sessionQueue.length && dayStudyMinutesUsed < settings.dailyCapacityMinutes) {
      const remainingCapacity = settings.dailyCapacityMinutes - dayStudyMinutesUsed;
      const currentChunk = sessionQueue[queuePointer];

      // If chunk is larger than remaining capacity, check if we should split or push to tomorrow
      let allocMinutes = currentChunk.durationMinutes;
      let isPartial = false;

      if (allocMinutes > remainingCapacity) {
        if (remainingCapacity >= 15) {
          // Split chunk
          allocMinutes = remainingCapacity;
          isPartial = true;
        } else {
          // Not enough time today for a meaningful block, stop today
          break;
        }
      }

      // Schedule this study session
      const blockStartTime = new Date(timeCursor);
      const blockEndTime = addMinutesToDate(blockStartTime, allocMinutes);
      timeCursor = blockEndTime;

      dayStudyMinutesUsed += allocMinutes;
      totalPlannedMinutes += allocMinutes;
      totalPlannedSessions++;
      globalSessionCounter++;

      const blockId = `session-${currentChunk.assignment.id}-${currentChunk.sessionIndex}${isPartial ? '-part' : ''}`;
      const isDone = completedSet.has(blockId);

      // Deadline check
      let isAtRisk = false;
      let atRiskReason: string | undefined;

      const dueDateTime = parseDueDateTime(currentChunk.assignment.dueDate, currentChunk.assignment.dueTime);
      if (dueDateTime) {
        if (blockEndTime.getTime() > dueDateTime.getTime()) {
          isAtRisk = true;
          atRiskReason = `Session ends after deadline (${formatFriendlyDate(currentChunk.assignment.dueDate)} ${formatFriendlyTime(currentChunk.assignment.dueTime)})`;
          atRiskCount++;
        }
      }

      blocks.push({
        id: blockId,
        type: 'session',
        assignmentId: currentChunk.assignment.id,
        taskTitle: currentChunk.assignment.title,
        subject: currentChunk.assignment.subject,
        sessionNumber: currentChunk.sessionIndex,
        totalSessionsForTask: currentChunk.totalSessions,
        durationMinutes: allocMinutes,
        startTime: `${dateKey} ${formatHoursMinutes(blockStartTime)}`,
        endTime: `${dateKey} ${formatHoursMinutes(blockEndTime)}`,
        date: dateKey,
        isAtRisk,
        atRiskReason,
        completed: isDone,
      });

      if (isPartial) {
        // Adjust the chunk in-place for tomorrow
        currentChunk.durationMinutes -= allocMinutes;
        // Day capacity is now full
        break;
      } else {
        queuePointer++;
      }

      // Check if more work can fit today; if so, insert a break
      if (queuePointer < sessionQueue.length && dayStudyMinutesUsed < settings.dailyCapacityMinutes) {
        const isLongBreak =
          settings.sessionsBeforeLongBreak > 0 &&
          globalSessionCounter % settings.sessionsBeforeLongBreak === 0;

        const breakDuration = isLongBreak
          ? settings.longBreakMinutes
          : settings.shortBreakMinutes;

        if (breakDuration > 0) {
          const breakStart = new Date(timeCursor);
          const breakEnd = addMinutesToDate(breakStart, breakDuration);
          timeCursor = breakEnd;
          dayBreakMinutesUsed += breakDuration;

          blocks.push({
            id: `break-${dateKey}-${blocks.length + 1}`,
            type: isLongBreak ? 'longBreak' : 'shortBreak',
            durationMinutes: breakDuration,
            startTime: `${dateKey} ${formatHoursMinutes(breakStart)}`,
            endTime: `${dateKey} ${formatHoursMinutes(breakEnd)}`,
            date: dateKey,
          });
        }
      }
    }

    schedules.push({
      date: dateKey,
      dayName,
      formattedDate,
      blocks,
      totalStudyMinutes: dayStudyMinutesUsed,
      totalBreakMinutes: dayBreakMinutesUsed,
      capacityMinutes: settings.dailyCapacityMinutes,
    });
  }

  // Check if any remaining items in sessionQueue couldn't fit into the scheduled days
  if (queuePointer < sessionQueue.length) {
    const unallocatedCount = sessionQueue.length - queuePointer;
    atRiskCount += unallocatedCount;
  }

  return {
    schedules,
    totalPlannedMinutes,
    totalPlannedSessions,
    atRiskCount,
  };
}
