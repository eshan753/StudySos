import React, { useEffect, useState } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { AssignmentFilterState, PriorityLevel } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

interface TaskFiltersProps {
  filterState: AssignmentFilterState;
  onChange: (newState: AssignmentFilterState) => void;
  subjects: string[];
  totalCount: number;
  filteredCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterState,
  onChange,
  subjects,
  totalCount,
  filteredCount,
}) => {
  const [localSearch, setLocalSearch] = useState(filterState.search);
  const debouncedSearch = useDebounce(localSearch, 200);

  // Sync debounced search to parent filter state
  useEffect(() => {
    if (debouncedSearch !== filterState.search) {
      onChange({ ...filterState, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Sync external search change (e.g. from URL query string) to local input
  useEffect(() => {
    setLocalSearch(filterState.search);
  }, [filterState.search]);

  const hasActiveFilters =
    filterState.search.trim() !== '' ||
    filterState.status !== 'all' ||
    filterState.priority !== 'all' ||
    filterState.subject !== 'all' ||
    filterState.sortBy !== 'priority';

  const handleClearFilters = () => {
    setLocalSearch('');
    onChange({
      search: '',
      status: 'all',
      priority: 'all',
      subject: 'all',
      sortBy: 'priority',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="assignment-search-input" className="sr-only">
          Search assignments by title, subject, or notes
        </label>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>
        <input
          id="assignment-search-input"
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by title, subject, or notes (Press / to focus)..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[44px]"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onChange({ ...filterState, search: '' });
            }}
            aria-label="Clear search input"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Status filter */}
        <div>
          <label htmlFor="filter-status" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            id="filter-status"
            value={filterState.status}
            onChange={(e) =>
              onChange({
                ...filterState,
                status: e.target.value as AssignmentFilterState['status'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[40px]"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
            <option value="overdue">Overdue Only</option>
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <label htmlFor="filter-priority" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Priority
          </label>
          <select
            id="filter-priority"
            value={filterState.priority}
            onChange={(e) =>
              onChange({
                ...filterState,
                priority: e.target.value as AssignmentFilterState['priority'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[40px]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Importance</option>
            <option value="medium">Medium Importance</option>
            <option value="low">Low Importance</option>
          </select>
        </div>

        {/* Subject filter */}
        <div>
          <label htmlFor="filter-subject" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Subject
          </label>
          <select
            id="filter-subject"
            value={filterState.subject}
            onChange={(e) =>
              onChange({
                ...filterState,
                subject: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[40px]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div>
          <label htmlFor="filter-sort" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Sort By
          </label>
          <select
            id="filter-sort"
            value={filterState.sortBy}
            onChange={(e) =>
              onChange({
                ...filterState,
                sortBy: e.target.value as AssignmentFilterState['sortBy'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 min-h-[40px]"
          >
            <option value="priority">Smart Priority Score</option>
            <option value="dueDate">Due Date (Earliest First)</option>
            <option value="title">Title (A to Z)</option>
            <option value="duration">Estimated Time (Shortest)</option>
            <option value="created">Recently Created</option>
          </select>
        </div>
      </div>

      {/* Summary count and Clear filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          Showing <strong className="text-slate-900 dark:text-slate-100">{filteredCount}</strong> of{' '}
          <strong className="text-slate-900 dark:text-slate-100">{totalCount}</strong> assignments
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline min-h-[32px] px-2 flex items-center"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
