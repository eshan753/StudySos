import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Assignment } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculatePriorityScore } from '../../lib/priority';
import { formatFriendlyDate, formatFriendlyTime, getRelativeDueDescription } from '../../lib/dates';
import { PriorityBadge } from '../common/PriorityBadge';
import { SubjectChip } from '../common/SubjectChip';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TaskRowProps {
  task: Assignment;
  onEdit?: (task: Assignment) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onEdit }) => {
  const { toggleComplete, deleteAssignment, openEditTaskModal } = useApp();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityBreakdown = calculatePriorityScore(task, new Date());
  const relativeDue = getRelativeDueDescription(task.dueDate, task.dueTime);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(task);
    } else {
      openEditTaskModal(task);
    }
  };

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-md ${
          task.completed
            ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80 bg-slate-50/50 dark:bg-slate-900/40'
            : priorityBreakdown.isOverdue
            ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-200/50 dark:ring-rose-950/30'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {/* Checkbox toggle with accessible focus */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={
              task.completed
                ? `Mark "${task.title}" as incomplete`
                : `Mark "${task.title}" as complete`
            }
            onClick={() => toggleComplete(task.id)}
            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
              task.completed
                ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-600 hover:border-teal-500 bg-white dark:bg-slate-800'
            }`}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />}
          </button>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <SubjectChip subject={task.subject} size="sm" />
              <PriorityBadge breakdown={priorityBreakdown} size="sm" />

              {priorityBreakdown.isOverdue && !task.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  Overdue
                </span>
              )}
            </div>

            {/* Title & strike-through */}
            <h3
              className={`text-base font-semibold text-slate-900 dark:text-slate-100 break-words ${
                task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Meta info: Due date, time, duration */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  {formatFriendlyDate(task.dueDate)} at {formatFriendlyTime(task.dueTime)}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  ({relativeDue})
                </span>
              </span>

              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{task.estimatedMinutes}m est.</span>
              </span>

              {task.completed && task.completedAt && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Done on {formatFriendlyDate(task.completedAt.slice(0, 10))}
                </span>
              )}
            </div>

            {/* Notes preview or expanded */}
            {task.notes && (
              <div className="mt-2.5">
                <p
                  className={`text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed ${
                    !isExpanded ? 'line-clamp-2' : ''
                  }`}
                >
                  {task.notes}
                </p>
                {task.notes.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline mt-1"
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Show full notes <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleEditClick}
              aria-label={`Edit assignment "${task.title}"`}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              aria-label={`Delete assignment "${task.title}"`}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => deleteAssignment(task.id)}
        title="Delete Assignment?"
        message={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-slate-100 font-semibold">"{task.title}"</strong>?
            You will have 5 seconds to undo this action.
          </>
        }
        confirmLabel="Delete Task"
        isDestructive={true}
      />
    </>
  );
};
