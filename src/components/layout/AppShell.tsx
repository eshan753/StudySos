import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings as SettingsIcon,
  Plus,
  Moon,
  Sun,
  Keyboard,
  HardDrive,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer } from '../common/Toast';
import { TaskForm } from '../tasks/TaskForm';
import { ShortcutsDialog } from '../common/ShortcutsDialog';

export const AppShell: React.FC = () => {
  const {
    openNewTaskModal,
    isNewTaskModalOpen,
    closeNewTaskModal,
    editingTask,
    closeEditTaskModal,
    darkMode,
    toggleDarkMode,
    openShortcutsModal,
    lastSavedAt,
    storageAvailable,
    isQuotaExceeded,
  } = useApp();

  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
    { name: 'Assignments', path: '/assignments', icon: <CheckSquare className="w-5 h-5" aria-hidden="true" /> },
    { name: 'Study Planner', path: '/planner', icon: <CalendarDays className="w-5 h-5" aria-hidden="true" /> },
    { name: 'Progress', path: '/progress', icon: <BarChart3 className="w-5 h-5" aria-hidden="true" /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon className="w-5 h-5" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      {/* Skip to Content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 px-4 py-2 bg-teal-600 text-white font-medium rounded-xl shadow-lg ring-2 ring-teal-400"
      >
        Skip to main content
      </a>

      {/* Storage Alert Banner if quota exceeded or disabled */}
      {(!storageAvailable || isQuotaExceeded) && (
        <div
          role="alert"
          className="bg-rose-600 text-white text-xs sm:text-sm font-medium px-4 py-2 flex items-center justify-center gap-2 text-center"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {!storageAvailable
              ? 'Local storage is disabled in this browser. Assignments will not persist after closing.'
              : 'Local storage quota exceeded (~5 MB limit). Please export a backup and delete completed tasks.'}
          </span>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop & Tablet Sidebar */}
        <aside
          aria-label="Main Navigation"
          className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky top-0 h-screen overflow-y-auto"
        >
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  StudySOS
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Hackathon 2026
                </span>
              </div>
            </div>
          </div>

          {/* New Assignment Quick Button */}
          <div className="p-4">
            <button
              type="button"
              onClick={openNewTaskModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
              <span>New Assignment</span>
              <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-teal-700 text-teal-100 px-1.5 py-0.5 rounded font-mono">
                n
              </kbd>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Persistence & System Status Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            {/* Storage Save Status */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Saved locally</span>
              </span>
              {lastSavedAt && <span className="font-mono text-[11px]">{lastSavedAt}</span>}
            </div>

            {/* Utility Controls: Theme & Shortcuts */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={openShortcutsModal}
                aria-label="View keyboard shortcuts"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[36px]"
              >
                <Keyboard className="w-4 h-4" />
                <span>Shortcuts</span>
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
          {/* Mobile Top Bar */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                StudySOS
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={openNewTaskModal}
                aria-label="New Assignment"
                className="p-2 bg-teal-600 text-white rounded-xl shadow-xs hover:bg-teal-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </header>

          {/* Main Outlet */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full focus:outline-hidden" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (<= 640px) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1 safe-area-bottom"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 rounded-xl min-h-[48px] min-w-[48px] text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Global Modals & Toasts */}
      <ToastContainer />
      <TaskForm
        isOpen={isNewTaskModalOpen || Boolean(editingTask)}
        onClose={() => {
          closeNewTaskModal();
          closeEditTaskModal();
        }}
        initialTask={editingTask}
      />
      <ShortcutsDialog />
    </div>
  );
};
