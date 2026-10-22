import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Coffee,
  CheckCircle,
  AlertTriangle,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStudySchedule } from '../lib/planner';
import { getTodayDateString, formatFriendlyDate } from '../lib/dates';
import { SubjectChip } from '../components/common/SubjectChip';
import { EmptyState } from '../components/common/EmptyState';
import { PlannerSettingsModal } from '../components/planner/PlannerSettingsModal';

export const PlannerPage: React.FC = () => {
  const { assignments, settings, completedSessionIds, toggleSessionCompleted } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const daysCount = viewMode === 'daily' ? 1 : 7;

  // Generate schedule
  const scheduleData = generateStudySchedule(
    assignments,
    settings,
    selectedDate,
    daysCount,
    completedSessionIds
  );

  const pendingAssignments = assignments.filter((a) => !a.completed);

  // Navigate date
  const shiftDate = (offsetDays: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    setSelectedDate(getTodayDateString(date));
  };

  const jumpToToday = () => {
    setSelectedDate(getTodayDateString());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Study Planner</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interval study blocks split by priority, bounded by daily study capacity and automated breaks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Daily / Weekly View Toggle */}
          <div className="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7-Day Weekly View
            </button>
          </div>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
          >
            <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Plan Settings</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(viewMode === 'daily' ? -1 : -7)}
            aria-label="Previous period"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={jumpToToday}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[36px]"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => shiftDate(viewMode === 'daily' ? 1 : 7)}
            aria-label="Next period"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 ml-2">
            {formatFriendlyDate(selectedDate)}
            {viewMode === 'weekly' && ` – ${formatFriendlyDate(scheduleData.schedules[scheduleData.schedules.length - 1]?.date || '')}`}
          </span>
        </div>

        {/* Schedule metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Total Study:{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">
              {scheduleData.totalPlannedMinutes}m
            </strong>{' '}
            ({(scheduleData.totalPlannedMinutes / 60).toFixed(1)}h)
          </span>

          <span className="text-slate-600 dark:text-slate-400">
            Blocks:{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">
              {scheduleData.totalPlannedSessions}
            </strong>
          </span>

          {scheduleData.atRiskCount > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{scheduleData.atRiskCount} at-risk session{scheduleData.atRiskCount > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      </div>

      {/* Info notice about session completion */}
      <div className="flex items-start gap-2.5 p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-xl text-xs text-sky-800 dark:text-sky-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Pro-Tip:</strong> Check off study blocks as you finish them during your day.
          Session checkmarks track your focus streak in the planner without prematurely marking whole assignments complete.
        </span>
      </div>

      {/* Schedule View */}
      {pendingAssignments.length === 0 ? (
        <EmptyState
          title="No pending tasks to schedule"
          description="Your planner is empty because all assignments are completed or none have been added yet. Add a homework task to generate study intervals."
          showLoadSample={true}
        />
      ) : (
        <div className="space-y-6">
          {scheduleData.schedules.map((daySchedule) => (
            <section
              key={daySchedule.date}
              aria-labelledby={`day-heading-${daySchedule.date}`}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Day Header */}
              <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2
                    id={`day-heading-${daySchedule.date}`}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
                  >
                    <span>{daySchedule.dayName}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      ({daySchedule.formattedDate})
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Study: <strong className="text-slate-800 dark:text-slate-200">{daySchedule.totalStudyMinutes}m</strong> / {daySchedule.capacityMinutes}m max
                  </span>
                  {daySchedule.totalBreakMinutes > 0 && (
                    <span>
                      Breaks: <strong className="text-slate-800 dark:text-slate-200">{daySchedule.totalBreakMinutes}m</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Blocks time list */}
              <div className="p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800">
                {daySchedule.blocks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No study sessions scheduled on this day.
                  </p>
                ) : (
                  daySchedule.blocks.map((block) => {
                    const isBreak = block.type === 'shortBreak' || block.type === 'longBreak';
                    const startTimeFormatted = block.startTime.split(' ')[1];
                    const endTimeFormatted = block.endTime.split(' ')[1];

                    if (isBreak) {
                      return (
                        <div
                          key={block.id}
                          className="py-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
                        >
                          <div className="w-24 shrink-0 font-mono text-[11px] text-slate-400">
                            {startTimeFormatted} – {endTimeFormatted}
                          </div>

                          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Coffee className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {block.type === 'longBreak' ? 'Long Recharge Break' : 'Short Break'}
                            </span>
                            <span className="ml-2 font-mono text-[11px]">
                              ({block.durationMinutes} minutes)
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Study session block
                    return (
                      <div
                        key={block.id}
                        className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          block.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Time Stamp */}
                          <div className="w-24 shrink-0 font-mono text-xs font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                            {startTimeFormatted} – {endTimeFormatted}
                          </div>

                          {/* Session checkmark button */}
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={block.completed}
                            aria-label={`Mark session for "${block.taskTitle}" as done`}
                            onClick={() => toggleSessionCompleted(block.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus:ring-2 focus:ring-teal-500 ${
                              block.completed
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {block.completed && <CheckCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Task details */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              {block.subject && <SubjectChip subject={block.subject} size="sm" />}
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Session {block.sessionNumber} of {block.totalSessionsForTask}
                              </span>
                              {block.isAtRisk && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                  <AlertTriangle className="w-3 h-3" />
                                  At Risk
                                </span>
                              )}
                            </div>

                            <p
                              className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                                block.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {block.taskTitle}
                            </p>

                            {block.isAtRisk && block.atRiskReason && (
                              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                                Warning: {block.atRiskReason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                            {block.durationMinutes} min focus
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Settings Modal */}
      <PlannerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
