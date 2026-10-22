import React, { useState, useEffect, useId } from 'react';
import { AlertCircle, Clock, Calendar, Bookmark, FileText } from 'lucide-react';
import { Assignment, PriorityLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { validateAssignment, ValidationError } from '../../lib/validation';
import { getTodayDateString } from '../../lib/dates';
import { Modal } from '../common/Modal';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Assignment | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, initialTask }) => {
  const { addAssignment, updateAssignment, settings } = useApp();

  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;
  const subjectId = `${idPrefix}-subject`;
  const customSubjectId = `${idPrefix}-customSubject`;
  const dueDateId = `${idPrefix}-dueDate`;
  const dueTimeId = `${idPrefix}-dueTime`;
  const priorityId = `${idPrefix}-priority`;
  const estId = `${idPrefix}-est`;
  const notesId = `${idPrefix}-notes`;

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [notes, setNotes] = useState('');

  // Validation state
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pastDateWarningConfirmed, setPastDateWarningConfirmed] = useState(false);
  const [showPastDateConfirmPrompt, setShowPastDateConfirmPrompt] = useState(false);

  // Sync initialTask on open or change
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      const isKnown = settings.subjects.includes(initialTask.subject);
      if (isKnown) {
        setSubject(initialTask.subject);
        setIsCustomSubject(false);
        setCustomSubject('');
      } else {
        setSubject('Other');
        setIsCustomSubject(true);
        setCustomSubject(initialTask.subject);
      }
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime || '23:59');
      setPriority(initialTask.priority);
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setNotes(initialTask.notes || '');
      setPastDateWarningConfirmed(true);
    } else {
      // Default new task
      setTitle('');
      setSubject(settings.subjects[0] || 'Math');
      setIsCustomSubject(false);
      setCustomSubject('');
      setDueDate(getTodayDateString());
      setDueTime('23:59');
      setPriority('medium');
      setEstimatedMinutes(45);
      setNotes('');
      setPastDateWarningConfirmed(false);
    }
    setErrors([]);
    setTouched({});
    setShowPastDateConfirmPrompt(false);
  }, [initialTask, isOpen, settings.subjects]);

  const activeSubject = isCustomSubject ? customSubject : subject;

  const runFieldValidation = (fieldKey: string, customAllowPast = pastDateWarningConfirmed) => {
    const candidate: Partial<Assignment> = {
      title,
      subject: activeSubject,
      dueDate,
      dueTime,
      priority,
      estimatedMinutes,
      notes,
    };

    const res = validateAssignment(candidate, { allowPastDueDate: customAllowPast });
    setErrors(res.errors);
    return res;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runFieldValidation(field);
  };

  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    return errors.find((e) => e.field === fieldName)?.message;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      title: true,
      subject: true,
      dueDate: true,
      dueTime: true,
      priority: true,
      estimatedMinutes: true,
      notes: true,
    });

    const res = runFieldValidation('all', pastDateWarningConfirmed);

    // If only error is past date, prompt confirmation
    const pastError = res.errors.find(
      (e) => e.field === 'dueDate' && e.message.includes('in the past')
    );

    if (pastError && res.errors.length === 1 && !pastDateWarningConfirmed) {
      setShowPastDateConfirmPrompt(true);
      return;
    }

    if (!res.isValid || !res.data) {
      return;
    }

    if (initialTask) {
      updateAssignment(initialTask.id, {
        title: res.data.title,
        subject: res.data.subject,
        dueDate: res.data.dueDate,
        dueTime: res.data.dueTime,
        priority: res.data.priority,
        estimatedMinutes: res.data.estimatedMinutes,
        notes: res.data.notes,
      });
    } else {
      addAssignment({
        title: res.data.title,
        subject: res.data.subject,
        dueDate: res.data.dueDate,
        dueTime: res.data.dueTime,
        priority: res.data.priority,
        estimatedMinutes: res.data.estimatedMinutes,
        notes: res.data.notes,
        completed: false,
        completedAt: null,
      });
    }

    onClose();
  };

  const handleConfirmPastDate = () => {
    setPastDateWarningConfirmed(true);
    setShowPastDateConfirmPrompt(false);

    // Re-validate and submit directly
    const candidate: Partial<Assignment> = {
      title,
      subject: activeSubject,
      dueDate,
      dueTime,
      priority,
      estimatedMinutes,
      notes,
    };

    const res = validateAssignment(candidate, { allowPastDueDate: true });
    if (res.isValid && res.data) {
      if (initialTask) {
        updateAssignment(initialTask.id, res.data);
      } else {
        addAssignment(res.data);
      }
      onClose();
    }
  };

  const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Assignment' : 'Add New Assignment'}
      description="Record homework with deadline and estimated duration for deterministic priority scheduling."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Error summary */}
        {errors.length > 0 && Object.keys(touched).length > 0 && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-200 text-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Please address the following before saving:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Past due date confirmation banner */}
        {showPastDateConfirmPrompt && (
          <div
            role="alert"
            className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-2"
          >
            <p className="font-semibold">
              This due date is in the past. Are you logging a retroactive or overdue task?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmPastDate}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Save anyway
              </button>
              <button
                type="button"
                onClick={() => setShowPastDateConfirmPrompt(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
              >
                Change date
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor={titleId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Assignment Title <span className="text-rose-500">*</span>
          </label>
          <input
            id={titleId}
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            placeholder="e.g. Calculus Chapter 4 Problem Set"
            aria-describedby={getFieldError('title') ? `${titleId}-err` : undefined}
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 transition-colors min-h-[44px] ${
              getFieldError('title')
                ? 'border-rose-400 focus:ring-rose-400'
                : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
            }`}
          />
          {getFieldError('title') && (
            <p id={`${titleId}-err`} className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {getFieldError('title')}
            </p>
          )}
        </div>

        {/* Subject & Custom Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={subjectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id={subjectId}
                value={isCustomSubject ? '__custom__' : subject}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomSubject(true);
                  } else {
                    setIsCustomSubject(false);
                    setSubject(e.target.value);
                  }
                }}
                onBlur={() => handleBlur('subject')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              >
                {settings.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom__">+ Custom Subject...</option>
              </select>
            </div>
          </div>

          {isCustomSubject && (
            <div>
              <label htmlFor={customSubjectId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Subject Name <span className="text-rose-500">*</span>
              </label>
              <input
                id={customSubjectId}
                type="text"
                maxLength={50}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onBlur={() => handleBlur('subject')}
                placeholder="e.g. Economics, Art History"
                aria-describedby={getFieldError('subject') ? `${subjectId}-err` : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
              />
            </div>
          )}
        </div>
        {getFieldError('subject') && (
          <p id={`${subjectId}-err`} className="text-xs text-rose-600 dark:text-rose-400">
            {getFieldError('subject')}
          </p>
        )}

        {/* Due Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={dueDateId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id={dueDateId}
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={() => handleBlur('dueDate')}
                aria-describedby={getFieldError('dueDate') ? `${dueDateId}-err` : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 min-h-[44px] ${
                  getFieldError('dueDate')
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
            </div>
            {getFieldError('dueDate') && (
              <p id={`${dueDateId}-err`} className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {getFieldError('dueDate')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={dueTimeId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Due Time (24h)
            </label>
            <input
              id={dueTimeId}
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              onBlur={() => handleBlur('dueTime')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Priority & Estimated Minutes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={priorityId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Importance Level <span className="text-rose-500">*</span>
            </label>
            <select
              id={priorityId}
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              onBlur={() => handleBlur('priority')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
            >
              <option value="high">High Importance (Major Exam / Heavy Project, +30 pts)</option>
              <option value="medium">Medium Importance (Regular Homework, +20 pts)</option>
              <option value="low">Low Importance (Quick Reading / Optional, +10 pts)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={estId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Estimated Duration (min) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {estimatedMinutes} min ({Math.floor(estimatedMinutes / 60)}h {estimatedMinutes % 60}m)
              </span>
            </div>
            <input
              id={estId}
              type="number"
              min={5}
              max={600}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              onBlur={() => handleBlur('estimatedMinutes')}
              aria-describedby={getFieldError('estimatedMinutes') ? `${estId}-err` : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 min-h-[44px] ${
                getFieldError('estimatedMinutes')
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
              }`}
            />
            {getFieldError('estimatedMinutes') && (
              <p id={`${estId}-err`} className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {getFieldError('estimatedMinutes')}
              </p>
            )}

            {/* Quick duration presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEstimatedMinutes(m)}
                  className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    estimatedMinutes === m
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes with live counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={notesId} className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Notes & Guidelines
            </label>
            <span
              className={`text-xs ${
                notes.length > 900
                  ? 'text-rose-500 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {notes.length} / 1000
            </span>
          </div>
          <textarea
            id={notesId}
            rows={3}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => handleBlur('notes')}
            placeholder="Key rubric details, textbook pages, links, or sub-tasks..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 resize-y"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          >
            {initialTask ? 'Save Changes' : 'Add Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
