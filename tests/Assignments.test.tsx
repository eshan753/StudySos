import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from '../src/context/AppContext';
import { AssignmentsPage } from '../src/pages/AssignmentsPage';
import { STORAGE_KEY } from '../src/lib/storage';
import { DEFAULT_SETTINGS } from '../src/lib/validation';

describe('AssignmentsPage Component and Search/Filter behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';

    const testState = {
      version: 1,
      assignments: [
        {
          id: 'task-chem',
          title: 'Chemistry Lab Analysis',
          subject: 'Science',
          dueDate: '2026-10-25',
          dueTime: '23:59',
          priority: 'high',
          estimatedMinutes: 90,
          notes: 'Prepare safety goggles and beaker',
          completed: false,
          completedAt: null,
          createdAt: '2026-10-18T00:00:00Z',
          updatedAt: '2026-10-18T00:00:00Z',
        },
        {
          id: 'task-calc',
          title: 'Calculus Derivatives Problem Set',
          subject: 'Math',
          dueDate: '2026-10-26',
          dueTime: '17:00',
          priority: 'medium',
          estimatedMinutes: 45,
          notes: 'Chain rule exercise',
          completed: false,
          completedAt: null,
          createdAt: '2026-10-19T00:00:00Z',
          updatedAt: '2026-10-19T00:00:00Z',
        },
        {
          id: 'task-hist',
          title: 'History Cold War Essay',
          subject: 'History',
          dueDate: '2026-10-27',
          dueTime: '23:59',
          priority: 'low',
          estimatedMinutes: 60,
          notes: 'Source synthesis',
          completed: true,
          completedAt: '2026-10-20T10:00:00Z',
          createdAt: '2026-10-17T00:00:00Z',
          updatedAt: '2026-10-20T10:00:00Z',
        },
      ],
      settings: DEFAULT_SETTINGS,
      completedSessionIds: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testState));
  });

  const renderPage = () => {
    return render(
      <AppProvider>
        <HashRouter>
          <AssignmentsPage />
        </HashRouter>
      </AppProvider>
    );
  };

  it('renders all assignments and displays total count', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Chemistry Lab Analysis')).toBeInTheDocument();
      expect(screen.getByText('Calculus Derivatives Problem Set')).toBeInTheDocument();
      expect(screen.getByText('History Cold War Essay')).toBeInTheDocument();
      expect(screen.getByText(/Showing/i).parentElement).toHaveTextContent(/Showing 3 of 3 assignments/i);
    });
  });

  it('filters assignments based on search keyword in title or notes', async () => {
    renderPage();

    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    fireEvent.change(searchInput, { target: { value: 'Chemistry' } });

    await waitFor(() => {
      expect(screen.getByText('Chemistry Lab Analysis')).toBeInTheDocument();
      expect(screen.queryByText('Calculus Derivatives Problem Set')).not.toBeInTheDocument();
      expect(screen.queryByText('History Cold War Essay')).not.toBeInTheDocument();
      expect(screen.getByText(/Showing/i).parentElement).toHaveTextContent(/Showing 1 of 3 assignments/i);
    });
  });

  it('filters assignments by status (Completed Only)', async () => {
    renderPage();

    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    await waitFor(() => {
      expect(screen.getByText('History Cold War Essay')).toBeInTheDocument();
      expect(screen.queryByText('Chemistry Lab Analysis')).not.toBeInTheDocument();
      expect(screen.queryByText('Calculus Derivatives Problem Set')).not.toBeInTheDocument();
      expect(screen.getByText(/Showing/i).parentElement).toHaveTextContent(/Showing 1 of 3 assignments/i);
    });
  });
});
