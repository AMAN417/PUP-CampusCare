import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import type { FilterState } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { Download } from 'lucide-react';
import type { ComplaintStatus } from '../../types';

interface ComplaintsManagementProps {
  onNavigate: (path: string) => void;
  initialStatus?: ComplaintStatus | 'ALL';
}

export const ComplaintsManagement: React.FC<ComplaintsManagementProps> = ({
  onNavigate,
  initialStatus = 'ALL',
}) => {
  const { complaints, exportCSV, updateStatus } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    status: initialStatus,
    priority: 'ALL',
  });

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.studentName && c.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.studentRollNo && c.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filters.category === 'ALL' || c.category === filters.category;
    const matchesStatus = filters.status === 'ALL' || c.status === filters.status;
    const matchesPriority = filters.priority === 'ALL' || c.priority === filters.priority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

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
      {/* Header & Controls */}
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Complaints Management Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
            Comprehensive directory of all student and campus complaints across university divisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={() => exportCSV(filteredComplaints)}
            leftIcon={<Download size={16} />}
          >
            Export to CSV ({filteredComplaints.length})
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ID, title, student name, roll number, or location..."
          />
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Table */}
      <ComplaintTable
        complaints={filteredComplaints}
        onOpenComplaint={(id) => onNavigate(`/admin/complaints/${id}`)}
        onQuickStatusChange={(id, newStatus) => updateStatus(id, newStatus, 'Status updated via table')}
        onExportCSV={() => exportCSV(filteredComplaints)}
      />
    </div>
  );
};
