import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Flame,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Plus,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAcademicStats } from '../lib/stats';
import { compareAssignmentsByPriority, calculatePriorityScore } from '../lib/priority';
import { generateStudySchedule } from '../lib/planner';
import { getTodayDateString, formatFriendlyDate, formatFriendlyTime } from '../lib/dates';
import { StatCard } from '../components/common/StatCard';
import { ProgressRing } from '../components/common/ProgressRing';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SubjectChip } from '../components/common/SubjectChip';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard: React.FC = () => {
  const { assignments, settings, completedSessionIds, toggleComplete, openNewTaskModal, loadSampleData } = useApp();
  const [showGuide, setShowGuide] = useState(false);

  const stats = calculateAcademicStats(assignments);
  const todayStr = getTodayDateString();

  // Top 5 pending tasks by priority score
  const upNextTasks = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => compareAssignmentsByPriority(a, b, new Date()))
    .slice(0, 5);

  // Today's study plan
  const todaySchedule = generateStudySchedule(
    assignments,
    settings,
    todayStr,
    1,
    completedSessionIds
  );

  const todayBlocks = todaySchedule.schedules[0]?.blocks.filter((b) => b.type === 'session') || [];
  const todayStudyMinutes = todaySchedule.schedules[0]?.totalStudyMinutes || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Study Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Focus on what matters most. Deterministic homework prioritization and time-boxed schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>60s Guide</span>
          </button>

          <button
            type="button"
            onClick={openNewTaskModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* 60-Second Onboarding / Guide Banner */}
      {showGuide && (
        <section
          aria-labelledby="guide-heading"
          className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-5 sm:p-6 shadow-xs relative"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="guide-heading" className="text-base font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                How to use StudySOS in 60 Seconds
              </h2>
              <p className="text-xs sm:text-sm text-teal-800/90 dark:text-teal-300/90 mt-1 max-w-2xl">
                Built for students balancing deadlines and burnout. Here is your daily loop:
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-teal-700 dark:text-teal-300 text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 1: Log Homework</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Record your assignment with due date, time, and estimated minutes.
              </p>
            </div>
            <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 2: Smart Priority</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                StudySOS scores urgency deterministically (Importance + Time remaining + Effort).
              </p>
            </div>
            <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Step 3: Study with Breaks</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Open Planner to follow interval study chunks with automatic breaks that prevent fatigue.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Top Stat Cards */}
      <section aria-label="Key Academic Metrics" className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.totalCount}
          subtext="Coursework tracked"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="Pending"
          value={stats.pendingCount}
          subtext="Awaiting completion"
          icon={<Clock className="w-5 h-5" />}
          iconColorClass="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueCount}
          subtext={stats.overdueCount > 0 ? 'Needs immediate focus' : 'All caught up!'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColorClass="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60"
          badge={stats.overdueCount > 0 ? { text: 'Action Needed', type: 'danger' } : undefined}
        />
        <StatCard
          label="Completed"
          value={stats.completedCount}
          subtext={`${stats.completedThisWeekCount} this week`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
        />

        {/* Completion Ring Card */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col items-center justify-center text-center">
          <ProgressRing
            percentage={stats.completionRate}
            size={90}
            strokeWidth={8}
            subLabel="done"
          />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Overall Completion
          </span>
        </div>
      </section>

      {/* Main Grid: "Up Next" & "Today's Plan" */}
      {assignments.length === 0 ? (
        <EmptyState
          title="Welcome to StudySOS!"
          description="You don't have any assignments yet. Get started by adding your first homework task, or load realistic sample coursework to see the smart priority score and planner in action."
          showLoadSample={true}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Up Next Panel (2 Columns on Large Screens) */}
          <section aria-labelledby="up-next-heading" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <h2 id="up-next-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Up Next (Priority Ranking)
                </h2>
              </div>
              <Link
                to="/assignments"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <span>View all ({stats.pendingCount})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upNextTasks.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  All caught up!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You have no pending assignments right now. Enjoy your free time or prep ahead!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upNextTasks.map((task) => {
                  const breakdown = calculatePriorityScore(task, new Date());
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleComplete(task.id)}
                          aria-label={`Mark "${task.title}" as complete`}
                          className="mt-0.5 w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-teal-500 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 transition-colors focus:ring-2 focus:ring-teal-500"
                        >
                          <span className="sr-only">Complete</span>
                        </button>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <SubjectChip subject={task.subject} size="sm" />
                            <PriorityBadge breakdown={breakdown} size="sm" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>Due {formatFriendlyDate(task.dueDate)} at {formatFriendlyTime(task.dueTime)}</span>
                            <span>·</span>
                            <span>{task.estimatedMinutes}m est.</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleComplete(task.id)}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 rounded-xl transition-colors shrink-0 min-h-[36px]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Today's Plan Summary (1 Column) */}
          <section aria-labelledby="today-plan-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h2 id="today-plan-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Today's Study Plan
                </h2>
              </div>
              <Link
                to="/planner"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <span>Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Today's Target
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {todayStudyMinutes} minutes
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Sessions
                  </span>
                  <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                    {todayBlocks.length} planned
                  </p>
                </div>
              </div>

              {todayBlocks.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-slate-400">
                  No sessions planned for today. Add assignments to populate your automatic schedule!
                </div>
              ) : (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Next Focus Blocks
                  </span>
                  {todayBlocks.slice(0, 3).map((block) => (
                    <div
                      key={block.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                          {block.taskTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {block.startTime.split(' ')[1]} – {block.endTime.split(' ')[1]} ({block.durationMinutes}m)
                        </span>
                      </div>
                      {block.subject && <SubjectChip subject={block.subject} size="sm" />}
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/planner"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
              >
                <span>Open Full Daily & Weekly Planner</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
