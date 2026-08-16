import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import type { FilterState } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

interface MyComplaintsProps {
  onNavigate: (path: string) => void;
  initialTab?: string;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({ onNavigate, initialTab = 'all' }) => {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints();

  // Active student complaints only
  const studentComplaints = complaints.filter(
    (c) => c.studentId === user?.id || user?.role === 'admin'
  );

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    status: 'ALL',
    priority: 'ALL',
  });

  // Tab filtering
  let tabFiltered = studentComplaints;
  if (activeTab === 'pending') {
    tabFiltered = studentComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review');
  } else if (activeTab === 'in_progress') {
    tabFiltered = studentComplaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress');
  } else if (activeTab === 'resolved') {
    tabFiltered = studentComplaints.filter((c) => c.status === 'Resolved');
  } else if (activeTab === 'closed') {
    tabFiltered = studentComplaints.filter((c) => c.status === 'Closed');
  }

  // Search & secondary filter chips
  const filteredComplaints = tabFiltered.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filters.category === 'ALL' || c.category === filters.category;
    const matchesStatus = filters.status === 'ALL' || c.status === filters.status;
    const matchesPriority = filters.priority === 'ALL' || c.priority === filters.priority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const tabCounts = {
    all: studentComplaints.length,
    pending: studentComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length,
    in_progress: studentComplaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length,
    resolved: studentComplaints.filter((c) => c.status === 'Resolved').length,
    closed: studentComplaints.filter((c) => c.status === 'Closed').length,
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'ALL',
      status: 'ALL',
      priority: 'ALL',
    });
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Quick Action */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Reported Complaints</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
            Monitor lifecycle status, field assignments, and officer updates in real time.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate('/student/submit')}
          leftIcon={<PlusCircle size={18} />}
        >
          Submit New Complaint
        </Button>
      </div>

      {/* Tabs Row */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'all', label: 'All Complaints', count: tabCounts.all },
          { key: 'pending', label: 'Pending Review', count: tabCounts.pending },
          { key: 'in_progress', label: 'In Progress', count: tabCounts.in_progress },
          { key: 'resolved', label: 'Resolved', count: tabCounts.resolved },
          { key: 'closed', label: 'Closed', count: tabCounts.closed },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: `2.5px solid ${isActive ? 'var(--pup-maroon)' : 'transparent'}`,
                color: isActive ? 'var(--pup-maroon)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? 'var(--pup-maroon-subtle)' : 'var(--bg-main)',
                  color: isActive ? 'var(--pup-maroon)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, ID, category, or location..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Grid vs Table View Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? 'var(--pup-maroon)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 8px',
                cursor: 'pointer',
                color: viewMode === 'table' ? 'var(--pup-maroon)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Table view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List / Grid */}
      {loading && studentComplaints.length === 0 ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={
            studentComplaints.length === 0
              ? 'You have not submitted any complaints yet.'
              : 'No complaints match your current search and filter settings.'
          }
          actionText={studentComplaints.length === 0 ? 'Report an Issue' : 'Reset Filters'}
          onAction={studentComplaints.length === 0 ? () => onNavigate('/student/submit') : handleResetFilters}
          actionIcon={<PlusCircle size={16} />}
        />
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onOpen={(id) => onNavigate(`/student/complaints/${id}`)}
            />
          ))}
        </div>
      ) : (
        <ComplaintTable
          complaints={filteredComplaints}
          onOpenComplaint={(id) => onNavigate(`/student/complaints/${id}`)}
        />
      )}
    </div>
  );
};
