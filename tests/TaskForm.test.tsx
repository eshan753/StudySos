import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from '../src/components/tasks/TaskForm';
import { AppProvider } from '../src/context/AppContext';

describe('TaskForm Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderTaskForm = (props = { isOpen: true, onClose: vi.fn(), initialTask: null }) => {
    return render(
      <AppProvider>
        <TaskForm {...props} />
      </AppProvider>
    );
  };

  it('renders modal dialog when isOpen is true', () => {
    renderTaskForm();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Assignment Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting with empty title', () => {
    renderTaskForm();

    const titleInput = screen.getByLabelText(/Assignment Title/i);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Add Assignment/i });
    fireEvent.click(submitBtn);

    const errors = screen.getAllByText(/Enter a task title between 1 and 120 characters/i);
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors[0]).toBeInTheDocument();
  });

  it('allows selecting estimated duration from quick presets', () => {
    renderTaskForm();

    const preset60 = screen.getByRole('button', { name: '60m' });
    fireEvent.click(preset60);

    const estInput = screen.getByLabelText(/Estimated Duration/i) as HTMLInputElement;
    expect(estInput.value).toBe('60');
  });
});
