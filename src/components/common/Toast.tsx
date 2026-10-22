import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />,
          info: <Info className="w-5 h-5 text-sky-500 shrink-0" aria-hidden="true" />,
        };

        const borderMap = {
          success: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-slate-900/95',
          error: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-slate-900/95',
          warning: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-slate-900/95',
          info: 'border-sky-200 dark:border-sky-900/50 bg-sky-50/90 dark:bg-slate-900/95',
        };

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {toast.title}
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 break-words mt-0.5">
                {toast.message}
              </p>
              {toast.action && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="inline-flex items-center px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-900 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[32px]"
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
