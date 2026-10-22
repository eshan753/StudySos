import React from 'react';

interface SubjectChipProps {
  subject: string;
  size?: 'sm' | 'md';
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Math: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  Science: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  English: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  History: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  Languages: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  'Computer Science': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  Other: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

export const SubjectChip: React.FC<SubjectChipProps> = ({ subject, size = 'md' }) => {
  const palette = SUBJECT_COLORS[subject] || {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${palette.bg} ${palette.text} ${palette.border}`}
    >
      {subject}
    </span>
  );
};
