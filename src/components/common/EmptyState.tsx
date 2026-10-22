import React from 'react';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showLoadSample?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No assignments found',
  description = 'Add your school coursework, homework, or exam prep to calculate priorities and plan your study time.',
  icon,
  showLoadSample = true,
  actionText = 'Add Assignment',
  onAction,
}) => {
  const { openNewTaskModal, loadSampleData } = useApp();

  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-6">
      <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
        {icon || <BookOpen className="w-8 h-8" aria-hidden="true" />}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onAction || openNewTaskModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {actionText}
        </button>

        {showLoadSample && (
          <button
            type="button"
            onClick={loadSampleData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-400 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Load Sample Data
          </button>
        )}
      </div>
    </div>
  );
};
