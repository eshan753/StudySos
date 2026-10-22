import React, { useState, useRef, useEffect } from 'react';
import { Flame, AlertTriangle, Clock, HelpCircle, CheckCircle, Info } from 'lucide-react';
import { PriorityBreakdown, PriorityScoreLabel } from '../../types';

interface PriorityBadgeProps {
  breakdown: PriorityBreakdown;
  size?: 'sm' | 'md';
  showDetailsButton?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  breakdown,
  size = 'md',
  showDetailsButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicked outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const configMap: Record<
    PriorityScoreLabel,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    Urgent: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <Flame className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    High: {
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    Medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Clock className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    Low: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <Info className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    Completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    },
  };

  const current = configMap[breakdown.label] || configMap.Low;

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-colors ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${current.bg} ${current.text} ${current.border}`}
      >
        {current.icon}
        <span>{breakdown.label}</span>
        {breakdown.score > 0 && (
          <span className="opacity-75 font-mono text-[11px] font-normal">
            ({breakdown.score} pts)
          </span>
        )}

        {showDetailsButton && breakdown.label !== 'Completed' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            aria-label={`View priority score calculation breakdown for ${breakdown.label} priority`}
            aria-expanded={isOpen}
            className="ml-0.5 text-current opacity-60 hover:opacity-100 focus:outline-hidden rounded p-0.5"
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </span>

      {/* Popover explaining score calculation */}
      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-40 top-full left-0 mt-2 w-72 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs text-slate-700 dark:text-slate-300 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Deterministic Priority Score
            </span>
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
              Total: {breakdown.score} pts
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
            Calculated algorithmically to prevent bias and ensure critical coursework is completed first:
          </p>

          <ul className="space-y-1.5">
            <li className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Importance Level:
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                +{breakdown.importancePoints} pts
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {breakdown.urgencyReason}:
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                +{breakdown.urgencyPoints} pts
              </span>
            </li>
            {breakdown.effortPoints > 0 && (
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  Large task bonus (≥120 min):
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +{breakdown.effortPoints} pts
                </span>
              </li>
            )}
          </ul>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Scale: Urgent (≥70) · High (50–69) · Medium (30–49) · Low (&lt;30)
          </div>
        </div>
      )}
    </div>
  );
};
