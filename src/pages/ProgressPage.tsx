import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAcademicStats } from '../lib/stats';
import { formatFriendlyDate, formatFriendlyTime } from '../lib/dates';
import { StatCard } from '../components/common/StatCard';
import { ProgressRing } from '../components/common/ProgressRing';
import { SubjectChip } from '../components/common/SubjectChip';

export const ProgressPage: React.FC = () => {
  const { assignments, settings } = useApp();
  const stats = calculateAcademicStats(assignments);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Maximum completions in a single day for scaling 7-day chart
  const maxDayCount = Math.max(1, ...stats.last7DaysCompletions.map((d) => d.count));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Academic Progress & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time completion analytics, on-time delivery rates, and deadline radar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
        >
          <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>How Priority & Planner Work</span>
        </button>
      </div>

      {/* "How It Works" Explanation Panel */}
      {showHowItWorks && (
        <section
          aria-labelledby="how-it-works-heading"
          className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 id="how-it-works-heading" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Algorithm Transparency & Design Logic
            </h2>
            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                1. The Deterministic Priority Formula
              </h3>
              <p>Every incomplete assignment is scored according to three transparent factors:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                <li><strong>Importance:</strong> High (+30 pts), Medium (+20 pts), Low (+10 pts).</li>
                <li><strong>Urgency:</strong> Overdue (+60 pts), &le;24h (+45 pts), &le;3 days (+30 pts), &le;7 days (+15 pts), later (+0 pts).</li>
                <li><strong>Effort Buffer:</strong> +5 pts for tasks &ge; 120 minutes so large papers and projects start early.</li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                Ties are broken first by earliest deadline, then alphabetically by title.
              </p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                2. The Interval Planner Engine
              </h3>
              <p>The study schedule is generated sequentially without guesswork:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                <li>Splits assignments into focused blocks (e.g. 45 min).</li>
                <li>Inserts short pauses between sessions and a longer recharge break after every 4 intervals.</li>
                <li>Enforces your daily study capacity limit to prevent burnout, carrying overflow to tomorrow.</li>
                <li>Flags tasks as <strong>At Risk</strong> if available capacity runs out before a deadline.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Key Metric Cards */}
      <section aria-label="Summary Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="On-Time Rate"
          value={`${stats.onTimeCompletionRate}%`}
          subtext={`${stats.onTimeCompletedCount} of ${stats.completedCount} on time`}
          icon={<Award className="w-5 h-5" />}
          iconColorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
        />
        <StatCard
          label="Done This Week"
          value={stats.completedThisWeekCount}
          subtext="Past 7 days completions"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Task Length"
          value={`${stats.averageEstimatedMinutes}m`}
          subtext={`Total: ${(stats.totalEstimatedMinutes / 60).toFixed(1)}h logged`}
          icon={<Clock className="w-5 h-5" />}
          iconColorClass="text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60"
        />
        <StatCard
          label="Overdue Count"
          value={stats.overdueCount}
          subtext={stats.overdueCount > 0 ? 'Requires attention' : 'Zero overdue!'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColorClass="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60"
        />
      </section>

      {/* Charts Section: 7-Day Velocity & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Completion Velocity Chart */}
        <section
          aria-labelledby="velocity-chart-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h2 id="velocity-chart-heading" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>7-Day Completion Velocity</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Number of assignments completed per day over the past week.
            </p>
          </div>

          {/* Visual SVG / CSS Bar Chart */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800" aria-hidden="true">
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {stats.last7DaysCompletions.map((d) => {
                const heightPercent = d.count > 0 ? Math.max(16, (d.count / maxDayCount) * 100) : 4;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {d.count > 0 ? d.count : ''}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl flex items-end h-32 overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          d.count > 0
                            ? 'bg-gradient-to-t from-teal-600 to-teal-400'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessible Table for Screen Readers */}
          <table className="sr-only">
            <caption>Past 7 days task completion counts</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Day</th>
                <th scope="col">Completed Tasks</th>
              </tr>
            </thead>
            <tbody>
              {stats.last7DaysCompletions.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.dayLabel}</td>
                  <td>{d.count} tasks</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Per-Subject Progress */}
        <section
          aria-labelledby="subject-progress-heading"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h2 id="subject-progress-heading" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Completion by Academic Subject</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track balance across STEM, humanities, and language courses.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {stats.subjectProgress.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No subjects recorded yet. Add assignments to visualize course breakdown.
              </p>
            ) : (
              stats.subjectProgress.map((sub) => (
                <div key={sub.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sub.subject}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-900 dark:text-slate-100">{sub.completed}</strong> of{' '}
                      {sub.total} done ({sub.completionRate}%)
                    </span>
                  </div>

                  {/* Accessible progress bar */}
                  <div
                    className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={sub.completionRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${sub.subject} completion rate`}
                  >
                    <div
                      style={{ width: `${sub.completionRate}%` }}
                      className="h-full bg-teal-500 dark:bg-teal-400 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Accessible Table for Subject Progress */}
          <table className="sr-only">
            <caption>Subject completion details</caption>
            <thead>
              <tr>
                <th scope="col">Subject</th>
                <th scope="col">Completed</th>
                <th scope="col">Total</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {stats.subjectProgress.map((s) => (
                <tr key={s.subject}>
                  <td>{s.subject}</td>
                  <td>{s.completed}</td>
                  <td>{s.total}</td>
                  <td>{s.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Upcoming Deadlines (Next 7 Days) */}
      <section
        aria-labelledby="upcoming-deadlines-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="upcoming-deadlines-heading" className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Upcoming Deadlines Radar (Next 7 Days)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pending assignments due within the coming week.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
            {stats.upcomingDeadlines.length} due soon
          </span>
        </div>

        {stats.upcomingDeadlines.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            No deadlines scheduled for the next 7 days.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <SubjectChip subject={task.subject} size="sm" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Due {formatFriendlyDate(task.dueDate)} at {formatFriendlyTime(task.dueTime)}
                  </span>
                  <span className="font-medium text-teal-600 dark:text-teal-400">
                    {task.estimatedMinutes}m est.
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
