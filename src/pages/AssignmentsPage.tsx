import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Sparkles, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssignmentFilterState, PriorityLevel, Assignment } from '../types';
import { compareAssignmentsByPriority, calculatePriorityScore } from '../lib/priority';
import { parseDueDateTime } from '../lib/dates';
import { TaskRow } from '../components/tasks/TaskRow';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { EmptyState } from '../components/common/EmptyState';

export const AssignmentsPage: React.FC = () => {
  const { assignments, settings, openNewTaskModal, openEditTaskModal } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filter state from URL query parameters
  const filterState: AssignmentFilterState = useMemo(() => {
    const search = searchParams.get('q') || '';
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const subjectParam = searchParams.get('subject') || 'all';
    const sortParam = searchParams.get('sort');

    const validStatus = ['all', 'pending', 'completed', 'overdue'].includes(statusParam || '')
      ? (statusParam as AssignmentFilterState['status'])
      : 'all';

    const validPriority = ['all', 'low', 'medium', 'high'].includes(priorityParam || '')
      ? (priorityParam as AssignmentFilterState['priority'])
      : 'all';

    const validSort = ['priority', 'dueDate', 'title', 'duration', 'created'].includes(sortParam || '')
      ? (sortParam as AssignmentFilterState['sortBy'])
      : 'priority';

    return {
      search,
      status: validStatus,
      priority: validPriority,
      subject: subjectParam,
      sortBy: validSort,
    };
  }, [searchParams]);

  // Update URL search parameters when filters change
  const handleFilterChange = (newState: AssignmentFilterState) => {
    const params = new URLSearchParams();
    if (newState.search.trim()) params.set('q', newState.search.trim());
    if (newState.status !== 'all') params.set('status', newState.status);
    if (newState.priority !== 'all') params.set('priority', newState.priority);
    if (newState.subject !== 'all') params.set('subject', newState.subject);
    if (newState.sortBy !== 'priority') params.set('sort', newState.sortBy);

    setSearchParams(params, { replace: true });
  };

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    const now = new Date();
    const query = filterState.search.toLowerCase().trim();

    return assignments
      .filter((task) => {
        // Status filter
        if (filterState.status === 'pending' && task.completed) return false;
        if (filterState.status === 'completed' && !task.completed) return false;
        if (filterState.status === 'overdue') {
          if (task.completed) return false;
          const due = parseDueDateTime(task.dueDate, task.dueTime);
          if (!due || due.getTime() >= now.getTime()) return false;
        }

        // Priority filter
        if (filterState.priority !== 'all' && task.priority !== filterState.priority) {
          return false;
        }

        // Subject filter
        if (filterState.subject !== 'all' && task.subject !== filterState.subject) {
          return false;
        }

        // Search text matching: title, subject, notes
        if (query) {
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchSubject = task.subject.toLowerCase().includes(query);
          const matchNotes = (task.notes || '').toLowerCase().includes(query);
          if (!matchTitle && !matchSubject && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'priority') {
          return compareAssignmentsByPriority(a, b, now);
        }
        if (filterState.sortBy === 'dueDate') {
          const dueA = parseDueDateTime(a.dueDate, a.dueTime)?.getTime() ?? Infinity;
          const dueB = parseDueDateTime(b.dueDate, b.dueTime)?.getTime() ?? Infinity;
          return dueA - dueB;
        }
        if (filterState.sortBy === 'title') {
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        }
        if (filterState.sortBy === 'duration') {
          return a.estimatedMinutes - b.estimatedMinutes;
        }
        if (filterState.sortBy === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [assignments, filterState]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span>Homework Manager</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, filter, search, and manage all your academic assignments and tests.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTaskModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors focus:ring-2 focus:ring-teal-500 min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <TaskFilters
        filterState={filterState}
        onChange={handleFilterChange}
        subjects={settings.subjects}
        totalCount={assignments.length}
        filteredCount={filteredAndSortedAssignments.length}
      />

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments recorded"
          description="Keep your assignments in one place to avoid missed deadlines and test anxiety."
          showLoadSample={true}
        />
      ) : filteredAndSortedAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No assignments match your current filter and search criteria.
          </p>
          <button
            type="button"
            onClick={() => handleFilterChange({
              search: '',
              status: 'all',
              priority: 'all',
              subject: 'all',
              sortBy: 'priority',
            })}
            className="px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 rounded-xl hover:bg-teal-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3" role="feed" aria-label="Homework list">
          {filteredAndSortedAssignments.map((task) => (
            <TaskRow key={task.id} task={task} onEdit={openEditTaskModal} />
          ))}
        </div>
      )}
    </div>
  );
};
