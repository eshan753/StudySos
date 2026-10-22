import React, { useState } from 'react';
import { Settings } from '../../types';
import { useApp } from '../../context/AppContext';
import { validateSettings, ValidationError } from '../../lib/validation';
import { Modal } from '../common/Modal';
import { Clock, Coffee, Sparkles } from 'lucide-react';

interface PlannerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlannerSettingsModal: React.FC<PlannerSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useApp();

  const [sessionMinutes, setSessionMinutes] = useState(settings.sessionMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    settings.sessionsBeforeLongBreak
  );
  const [dailyStudyStart, setDailyStudyStart] = useState(settings.dailyStudyStart);
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(
    settings.dailyCapacityMinutes
  );

  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Calculate live preview
  const studyHours = (dailyCapacityMinutes / 60).toFixed(1);
  const [startHour, startMin] = dailyStudyStart.split(':').map(Number);
  const finishDate = new Date();
  finishDate.setHours(startHour || 16, (startMin || 0) + dailyCapacityMinutes, 0, 0);
  const approxFinishTime = `${finishDate.getHours().toString().padStart(2, '0')}:${finishDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const candidate: Partial<Settings> = {
      sessionMinutes: Number(sessionMinutes),
      shortBreakMinutes: Number(shortBreakMinutes),
      longBreakMinutes: Number(longBreakMinutes),
      sessionsBeforeLongBreak: Number(sessionsBeforeLongBreak),
      dailyStudyStart,
      dailyCapacityMinutes: Number(dailyCapacityMinutes),
      subjects: settings.subjects,
    };

    const res = validateSettings(candidate);
    if (!res.isValid || !res.data) {
      setErrors(res.errors);
      return;
    }

    updateSettings(res.data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Study Planner Settings"
      description="Fine-tune your interval study blocks, break durations, and daily capacity."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300">
            <Sparkles className="w-4 h-4" />
            <span>Live Schedule Preview</span>
          </div>
          <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
            Daily window starts at <strong>{dailyStudyStart}</strong> with up to{' '}
            <strong>{dailyCapacityMinutes}m</strong> ({studyHours}h) of focused work.
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-teal-700 dark:text-teal-300 pt-1">
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-teal-200 dark:border-teal-800">
              Study {sessionMinutes}m
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-teal-200 dark:border-teal-800">
              Break {shortBreakMinutes}m
            </span>
            <span>...</span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-teal-200 dark:border-teal-800 font-bold">
              Long Break {longBreakMinutes}m (after {sessionsBeforeLongBreak} sessions)
            </span>
          </div>
        </div>

        {/* Study Session & Short Break */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Session Length (10–180m)
            </label>
            <input
              type="number"
              min={10}
              max={180}
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Short Break (1–60m)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Long Break & Interval */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Long Break (5–90m)
            </label>
            <input
              type="number"
              min={5}
              max={90}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Sessions Before Long Break (2–8)
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={sessionsBeforeLongBreak}
              onChange={(e) => setSessionsBeforeLongBreak(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Start Time and Daily Capacity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Daily Study Start (HH:mm)
            </label>
            <input
              type="time"
              value={dailyStudyStart}
              onChange={(e) => setDailyStudyStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Daily Capacity (30–720m)
            </label>
            <input
              type="number"
              min={30}
              max={720}
              step={15}
              value={dailyCapacityMinutes}
              onChange={(e) => setDailyCapacityMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </form>
    </Modal>
  );
};
