import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { PlannerPage } from './pages/PlannerPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const AppRoutes: React.FC = () => {
  // Activate global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
