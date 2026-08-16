import React, { useState } from 'react';
import type { Complaint, ComplaintStatus, Priority } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  ArrowUpDown,
  Eye,
  MapPin,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface ComplaintTableProps {
  complaints: Complaint[];
  onOpenComplaint: (id: string) => void;
  onQuickStatusChange?: (id: string, newStatus: ComplaintStatus) => void;
  onExportCSV?: () => void;
}

type SortField = 'id' | 'createdAt' | 'priority' | 'status' | 'category';
type SortOrder = 'asc' | 'desc';

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onOpenComplaint,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const priorityWeight: Record<Priority, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const sortedComplaints = [...complaints].sort((a, b) => {
    let result = 0;
    if (sortField === 'createdAt') {
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === 'priority') {
      result = priorityWeight[a.priority] - priorityWeight[b.priority];
    } else if (sortField === 'id') {
      result = a.id.localeCompare(b.id);
    } else if (sortField === 'status') {
      result = a.status.localeCompare(b.status);
    } else if (sortField === 'category') {
      result = a.category.localeCompare(b.category);
    }
    return sortOrder === 'asc' ? result : -result;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === complaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(complaints.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (complaints.length === 0) {
    return (
      <EmptyState
        title="No complaints match filters"
        description="Try adjusting your search terms or clearing the active filters."
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Table Toolbar if items selected */}
      {selectedIds.length > 0 && (
        <div
          style={{
            background: 'var(--pup-maroon-subtle)',
            border: '1px solid rgba(122, 18, 40, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pup-maroon)' }}>
            {selectedIds.length} complaint(s) selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === complaints.length && complaints.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th
                onClick={() => handleSort('id')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Complaint ID</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Issue Summary</th>
              <th
                onClick={() => handleSort('category')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Category</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Priority</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Status</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Assignee</th>
              <th
                onClick={() => handleSort('createdAt')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Submitted</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedComplaints.map((c) => {
              const isSelected = selectedIds.includes(c.id);

              return (
                <tr
                  key={c.id}
                  style={{
                    backgroundColor: isSelected ? 'var(--pup-maroon-subtle)' : undefined,
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(c.id)}
                      aria-label={`Select complaint ${c.id}`}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <span
                      onClick={() => onOpenComplaint(c.id)}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'var(--pup-maroon)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {c.id}
                    </span>
                  </td>
                  <td style={{ maxWidth: '320px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <MapPin size={11} style={{ flexShrink: 0 }} />
                      <span>{c.location}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-surface-subtle)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {c.assignedTo ? (
                        <div>
                          <div>{c.assignedTo}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {c.assignedDepartment?.split(' ')[0]}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                          Unassigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(c.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenComplaint(c.id)}
                      rightIcon={<Eye size={13} />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
