import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Sparkles,
  Trash2,
  HardDrive,
  AlertTriangle,
  Plus,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateSettings, ValidationError } from '../lib/validation';
import { exportBackup, previewBackupData, ImportPreview } from '../lib/backup';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    assignments,
    completedSessionIds,
    loadSampleData,
    clearAllData,
    importState,
    storageAvailable,
    isQuotaExceeded,
    lastSavedAt,
    addToast,
  } = useApp();

  // Settings form local state
  const [sessionMinutes, setSessionMinutes] = useState(settings.sessionMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(settings.sessionsBeforeLongBreak);
  const [dailyStudyStart, setDailyStudyStart] = useState(settings.dailyStudyStart);
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(settings.dailyCapacityMinutes);
  const [subjects, setSubjects] = useState<string[]>(settings.subjects);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [settingsErrors, setSettingsErrors] = useState<ValidationError[]>([]);

  // Dialogs
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isSecondClearConfirmOpen, setIsSecondClearConfirmOpen] = useState(false);

  // Backup import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Handle saving general study settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = {
      sessionMinutes: Number(sessionMinutes),
      shortBreakMinutes: Number(shortBreakMinutes),
      longBreakMinutes: Number(longBreakMinutes),
      sessionsBeforeLongBreak: Number(sessionsBeforeLongBreak),
      dailyStudyStart,
      dailyCapacityMinutes: Number(dailyCapacityMinutes),
      subjects,
    };

    const res = validateSettings(candidate);
    if (!res.isValid || !res.data) {
      setSettingsErrors(res.errors);
      return;
    }

    setSettingsErrors([]);
    updateSettings(res.data);
  };

  const handleAddSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;
    if (subjects.includes(trimmed)) {
      addToast({ type: 'warning', message: `"${trimmed}" is already in your subjects list.` });
      return;
    }
    const updated = [...subjects, trimmed];
    setSubjects(updated);
    setNewSubjectInput('');
    updateSettings({ subjects: updated });
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    if (subjects.length <= 1) {
      addToast({ type: 'warning', message: 'You must keep at least one subject category.' });
      return;
    }
    const updated = subjects.filter((s) => s !== subjectToRemove);
    setSubjects(updated);
    updateSettings({ subjects: updated });
  };

  // Export JSON backup
  const handleExport = () => {
    exportBackup({
      version: 1,
      assignments,
      settings,
      completedSessionIds,
    });
    addToast({
      type: 'success',
      title: 'Backup Downloaded',
      message: 'Export file saved to your device.',
    });
  };

  // Trigger file selection
  const handleSelectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const preview = previewBackupData(parsed);
        setImportPreview(preview);
        setIsImportModalOpen(true);
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: 'Selected file is not valid JSON.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleConfirmImport = (mode: 'replace' | 'merge') => {
    if (importPreview && importPreview.importedState) {
      importState(importPreview.importedState, mode);
      setIsImportModalOpen(false);
      setImportPreview(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize study session parameters, manage subjects, and control data backups.
        </p>
      </div>

      {/* Storage Limit Notice & Persistence Banner */}
      <section
        aria-labelledby="storage-notice-heading"
        className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <h2 id="storage-notice-heading" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Browser Storage Architecture & Limits
            </h2>
            <p className="leading-relaxed">
              StudySOS runs 100% locally on your device using your browser's <code className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-teal-200 dark:border-teal-900 font-mono text-[11px]">localStorage</code>.
              Your data is completely private—no tracking, no paid server databases, and no login required.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div>
                • <strong>Per-Device & Per-Browser:</strong> Data created in Safari will not appear in Chrome or on another computer.
              </div>
              <div>
                • <strong>~5 MB Storage Quota:</strong> Standard browser limit; plenty for hundreds of homework entries and notes.
              </div>
              <div>
                • <strong>Clearing Cache:</strong> Clearing browser history or website data will wipe local storage.
              </div>
              <div>
                • <strong>Backup Protection:</strong> Use the Export button below regularly to maintain offline JSON backups.
              </div>
            </div>
            {lastSavedAt && (
              <p className="text-teal-700 dark:text-teal-300 font-semibold pt-1">
                Last auto-saved to local storage at {lastSavedAt}.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Study Session Configuration Form */}
      <section
        aria-labelledby="study-parameters-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="study-parameters-heading" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Study Session & Capacity Rules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure how the automatic planner divides assignments and spaces out rest breaks.
            </p>
          </div>
        </div>

        {settingsErrors.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            <ul className="list-disc list-inside space-y-1">
              {settingsErrors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Session Length (10–180m)
              </label>
              <input
                type="number"
                min={10}
                max={180}
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Short Break (1–60m)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Long Break (5–90m)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Sessions Before Long Break (2–8)
              </label>
              <input
                type="number"
                min={2}
                max={8}
                value={sessionsBeforeLongBreak}
                onChange={(e) => setSessionsBeforeLongBreak(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Study Start (HH:mm)
              </label>
              <input
                type="time"
                value={dailyStudyStart}
                onChange={(e) => setDailyStudyStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Capacity (30–720m)
              </label>
              <input
                type="number"
                min={30}
                max={720}
                step={15}
                value={dailyCapacityMinutes}
                onChange={(e) => setDailyCapacityMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors min-h-[44px]"
            >
              Save Study Parameters
            </button>
          </div>
        </form>
      </section>

      {/* Coursework Subjects Management */}
      <section
        aria-labelledby="subjects-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
      >
        <div>
          <h2 id="subjects-heading" className="text-base font-bold text-slate-900 dark:text-slate-100">
            Subject Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add or remove subjects displayed in the assignment form and filter chips.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {subjects.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => handleRemoveSubject(s)}
                aria-label={`Remove subject ${s}`}
                className="text-slate-400 hover:text-rose-500 rounded p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 max-w-sm">
          <input
            type="text"
            placeholder="New subject (e.g. Psychology)..."
            value={newSubjectInput}
            onChange={(e) => setNewSubjectInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 min-h-[40px]"
          />
          <button
            type="button"
            onClick={handleAddSubject}
            className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold min-h-[40px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </section>

      {/* Backup, Import & Reset Controls */}
      <section
        aria-labelledby="backup-heading"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6"
      >
        <div>
          <h2 id="backup-heading" className="text-base font-bold text-slate-900 dark:text-slate-100">
            Backup & Data Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export a full JSON copy of your coursework, restore from a file, or reset your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Export Backup</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Save an offline JSON snapshot of your {assignments.length} assignments and settings.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              Download JSON File
            </button>
          </div>

          {/* Import */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Import Backup</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Restore or merge assignments from a previously exported StudySOS backup file.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSelectImportFile}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              Choose Backup File
            </button>
          </div>

          {/* Load Sample / Reset */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Demo Sample Data</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Populate your workspace with 7 realistic coursework tasks across subjects.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSampleData}
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition-colors min-h-[44px]"
            >
              Load Sample Coursework
            </button>
          </div>
        </div>

        {/* Danger Zone: Clear Data */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Danger Zone: Clear All Local Data</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently delete all assignments, planner checkmarks, and saved preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-xl transition-colors min-h-[44px] shrink-0"
          >
            Clear All Data...
          </button>
        </div>
      </section>

      {/* Clear Confirmation 1 */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => setIsSecondClearConfirmOpen(true)}
        title="Clear All StudySOS Data?"
        message="This action will delete all assignments and session marks. Are you sure you want to proceed?"
        confirmLabel="Next Step"
        isDestructive={true}
      />

      {/* Clear Confirmation 2 (Double Confirmation) */}
      <ConfirmDialog
        isOpen={isSecondClearConfirmOpen}
        onClose={() => setIsSecondClearConfirmOpen(false)}
        onConfirm={() => clearAllData()}
        title="Final Confirmation"
        message="This cannot be undone unless you previously exported a JSON backup. Permanently erase all local data now?"
        confirmLabel="Erase Everything"
        isDestructive={true}
      />

      {/* Import Preview Modal */}
      {importPreview && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Backup Preview"
          description="Validate file contents before applying changes."
          maxWidth="md"
        >
          <div className="space-y-4">
            {!importPreview.valid ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                <p className="font-bold">Invalid Backup File</p>
                <p className="mt-1">{importPreview.errorMessage || 'The selected file is not a valid StudySOS backup.'}</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">File Schema Version:</span>
                  <span className="font-bold">v{importPreview.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Valid Tasks in File:</span>
                  <span className="font-bold">{importPreview.validAssignmentsCount}</span>
                </div>
                {importPreview.skippedCorruptedCount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Skipped Corrupt Entries:</span>
                    <span className="font-bold">{importPreview.skippedCorruptedCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Settings Found:</span>
                  <span className="font-bold">{importPreview.hasSettings ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Choose how to apply this backup:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Replace:</strong> Completely replace current workspace with backup data.</li>
                <li><strong>Merge:</strong> Keep existing tasks and combine imported tasks (matching ids resolve by newest updated timestamp).</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!importPreview.valid}
                onClick={() => handleConfirmImport('merge')}
                className="px-4 py-2 text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 rounded-xl hover:bg-teal-100 min-h-[44px] disabled:opacity-50"
              >
                Merge with Existing
              </button>
              <button
                type="button"
                disabled={!importPreview.valid}
                onClick={() => handleConfirmImport('replace')}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs min-h-[44px] disabled:opacity-50"
              >
                Replace Workspace
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
