import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'danger' | 'info';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconColorClass = 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60',
  badge,
}) => {
  const badgeClasses = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl ${iconColorClass}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClasses[badge.type]}`}>
            {badge.text}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
