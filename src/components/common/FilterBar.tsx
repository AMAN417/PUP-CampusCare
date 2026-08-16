import React from 'react';
import type { ComplaintCategory, ComplaintStatus, Priority } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  category: ComplaintCategory | 'ALL';
  status: ComplaintStatus | 'ALL';
  priority: Priority | 'ALL';
}

export interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const CATEGORIES: (ComplaintCategory | 'ALL')[] = [
  'ALL',
  'Hostel',
  'Classroom',
  'Electricity',
  'Water',
  'Sanitation',
  'Internet',
  'Transportation',
  'Infrastructure',
  'Security',
  'Other',
];

const STATUSES: (ComplaintStatus | 'ALL')[] = [
  'ALL',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

const PRIORITIES: (Priority | 'ALL')[] = ['ALL', 'Low', 'Medium', 'High', 'Urgent'];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const isFiltered =
    filters.category !== 'ALL' || filters.status !== 'ALL' || filters.priority !== 'ALL';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginRight: '0.25rem',
        }}
      >
        <Filter size={16} />
        <span>Filters:</span>
      </div>

      {/* Category Dropdown */}
      <select
        className="form-select"
        style={{ width: 'auto', minWidth: '130px', height: '38px', fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
        value={filters.category}
        onChange={(e) =>
          onFilterChange({ ...filters, category: e.target.value as ComplaintCategory | 'ALL' })
        }
      >
        <option value="ALL">All Categories</option>
        {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Status Dropdown */}
      <select
        className="form-select"
        style={{ width: 'auto', minWidth: '120px', height: '38px', fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
        value={filters.status}
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value as ComplaintStatus | 'ALL' })
        }
      >
        <option value="ALL">All Statuses</option>
        {STATUSES.filter((s) => s !== 'ALL').map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Priority Dropdown */}
      <select
        className="form-select"
        style={{ width: 'auto', minWidth: '120px', height: '38px', fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
        value={filters.priority}
        onChange={(e) =>
          onFilterChange({ ...filters, priority: e.target.value as Priority | 'ALL' })
        }
      >
        <option value="ALL">All Priorities</option>
        {PRIORITIES.filter((p) => p !== 'ALL').map((pri) => (
          <option key={pri} value={pri}>
            {pri} Priority
          </option>
        ))}
      </select>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-sm"
          style={{ height: '38px', color: 'var(--pup-maroon)' }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
