import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import { ComplaintTable } from '../../components/complaints/ComplaintTable';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import type { FilterState } from '../../components/common/FilterBar';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import type { Complaint, ComplaintStatus, Priority } from '../../types';

interface ComplaintsManagementProps {
  onNavigate: (path: string) => void;
  initialStatus?: ComplaintStatus | 'ALL';
  initialPriority?: Priority | 'ALL';
}

export const ComplaintsManagement: React.FC<ComplaintsManagementProps> = ({
  onNavigate,
  initialStatus = 'ALL',
  initialPriority = 'ALL',
}) => {
  const { success } = useToast();
  const { complaints, exportCSV, updateStatus, deleteComplaint, refreshComplaints, loading } =
    useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    status: initialStatus,
    priority: initialPriority,
  });
  const [pendingDelete, setPendingDelete] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteRequest = (complaint: Complaint) => {
    setPendingDelete(complaint);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const ok = await deleteComplaint(pendingDelete.id);
      if (ok) {
        refreshComplaints();
        success('Complaint Deleted', `${pendingDelete.id} has been permanently removed.`);
      }
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Complaints Management Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Comprehensive directory of all student and campus complaints across university divisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem' }}>
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
      {loading && complaints.length === 0 ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <ComplaintTable
          complaints={filteredComplaints}
          onOpenComplaint={(id) => onNavigate(`/admin/complaints/${id}`)}
          onQuickStatusChange={(id, newStatus) => updateStatus(id, newStatus, 'Status updated via table')}
          onExportCSV={() => exportCSV(filteredComplaints)}
          onDeleteComplaint={handleDeleteRequest}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!pendingDelete}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={18} style={{ color: '#DC2626' }} />
            Delete Complaint
          </span>
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem',
            marginBottom: '0.75rem',
          }}
        >
          <AlertTriangle size={22} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.9rem', lineHeight: 1.55, color: '#991B1B' }}>
            Are you sure you want to delete this complaint? This action cannot be undone.
            {pendingDelete && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.825rem' }}>
                <strong>{pendingDelete.id}</strong> — {pendingDelete.title}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button
            variant="outline"
            onClick={() => setPendingDelete(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
            disabled={isDeleting}
            leftIcon={!isDeleting ? <Trash2 size={15} /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Delete Complaint'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
