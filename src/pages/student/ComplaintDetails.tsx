import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Timeline } from '../../components/complaints/Timeline';
import { CommentSection } from '../../components/complaints/CommentSection';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CATEGORY_METADATA } from '../../data/mockData';
import type { Complaint, ComplaintCategory, Priority } from '../../types';

interface ComplaintDetailsProps {
  complaintId: string;
  onNavigate: (path: string) => void;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaintId,
  onNavigate,
}) => {
  const { getComplaintById, fetchComplaintById, addComment, updateStatus, editComplaint, deleteComplaint } = useComplaints();
  const { user } = useAuth();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [complaint, setComplaint] = useState<Complaint | undefined>(() =>
    getComplaintById(complaintId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!complaint);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '' as ComplaintCategory,
    priority: '' as Priority,
    location: '',
  });

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const fetched = await fetchComplaintById(complaintId);
        if (isMounted && fetched) {
          setComplaint(fetched);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [complaintId, fetchComplaintById]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <LoadingSkeleton type="text" count={3} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <Card style={{ padding: '2.5rem' }}>
          <AlertCircle size={48} style={{ color: '#DC2626', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Complaint Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
            The complaint reference ID "{complaintId}" could not be located in records.
          </p>
          <Button
            variant="primary"
            onClick={() => onNavigate('/student/complaints')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Complaints
          </Button>
        </Card>
      </div>
    );
  }

  const catMeta = CATEGORY_METADATA[complaint.category] || {
    color: '#6B7280',
    description: '',
  };

  const handleCloseComplaint = async () => {
    if (confirm('Are you satisfied and want to mark this complaint as Closed?')) {
      setIsClosing(true);
      try {
        const success = await updateStatus(
          complaint.id,
          'Closed',
          'Student confirmed resolution and closed ticket.'
        );
        if (success) {
          const fresh = await fetchComplaintById(complaint.id);
          if (fresh) setComplaint(fresh);
        }
      } finally {
        setIsClosing(false);
      }
    }
  };

  const handleAddComment = async (msg: string, isInternal?: boolean): Promise<boolean> => {
    const success = await addComment(complaint.id, msg, isInternal);
    if (success) {
      const fresh = await fetchComplaintById(complaint.id);
      if (fresh) setComplaint(fresh);
    }
    return success;
  };

  // Determine if current user owns this complaint
  const isOwner =
    !!user &&
    user.role === 'student' &&
    (complaint.studentId === user.id ||
      (complaint.studentId === 'user-student-1' && user.id === 'user-student-1'));

  // Editable statuses: not Closed
  const canEdit = isOwner && complaint.status !== 'Closed';

  const handleOpenEdit = () => {
    setEditForm({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      location: complaint.location,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.location.trim()) return;
    setIsSaving(true);
    try {
      const updated = await editComplaint(complaint.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        priority: editForm.priority,
        location: editForm.location.trim(),
      });
      if (updated) {
        setComplaint(updated);
        setShowEditModal(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const ok = await deleteComplaint(complaint.id);
      if (ok) {
        onNavigate('/student/complaints');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Breadcrumb & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('/student/complaints')}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Complaints</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {complaint.status === 'Resolved' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isClosing}
              onClick={handleCloseComplaint}
              leftIcon={<CheckCircle2 size={15} />}
            >
              Confirm & Close Complaint
            </Button>
          )}

          {/* Edit & Delete — only for complaint owner, non-closed */}
          {canEdit && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenEdit}
                leftIcon={<Pencil size={14} />}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            </>
          )}

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
              onClick={() => setTimelineMode('horizontal')}
              style={{
                border: 'none',
                background: timelineMode === 'horizontal' ? '#FFFFFF' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: timelineMode === 'horizontal' ? 'var(--pup-maroon)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Step View
            </button>
            <button
              type="button"
              onClick={() => setTimelineMode('vertical')}
              style={{
                border: 'none',
                background: timelineMode === 'vertical' ? '#FFFFFF' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: timelineMode === 'vertical' ? 'var(--pup-maroon)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Detailed Log
            </button>
          </div>
        </div>
      </div>

      {/* Main Complaint Header Card */}
      <Card style={{ padding: '1.75rem', borderTop: `4px solid ${catMeta.color}` }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--pup-maroon)',
                background: 'var(--pup-maroon-subtle)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(122, 18, 40, 0.2)',
              }}
            >
              {complaint.id}
            </span>

            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: catMeta.color,
                background: `${catMeta.color}15`,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {complaint.category}
            </span>

            <PriorityBadge priority={complaint.priority} />
          </div>

          <StatusBadge status={complaint.status} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {complaint.title}
        </h1>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} style={{ color: 'var(--pup-maroon)' }} />
            <strong style={{ color: 'var(--text-primary)' }}>Location:</strong>
            <span>{complaint.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} />
            <strong>Reported:</strong>
            <span>{new Date(complaint.createdAt).toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} />
            <strong>Last Updated:</strong>
            <span>{new Date(complaint.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* 2. ANIMATED COMPLAINT TIMELINE SECTION */}
      <Card style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Resolution Lifecycle Progress
        </h3>
        <Timeline
          currentStatus={complaint.status}
          history={complaint.statusHistory}
          orientation={timelineMode}
        />
      </Card>

      {/* 3. DETAILS & ATTACHMENTS & ASSIGNEE GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Full Description & Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Issue Description
            </h4>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                margin: 0,
              }}
            >
              {complaint.description}
            </p>
          </Card>

          {/* Photo Attachments */}
          {complaint.attachments.length > 0 && (
            <Card style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '1rem',
                }}
              >
                <Paperclip size={16} style={{ color: 'var(--pup-maroon)' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Attachments & Photos ({complaint.attachments.length})
                </h4>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {complaint.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewImage(att.url)}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      background: 'var(--bg-main)',
                    }}
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        padding: '4px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {att.name}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Assigned Division & Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assignment Box */}
          <Card style={{ padding: '1.5rem', background: 'var(--bg-surface-subtle)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--pup-navy)' }}>
              Assigned Maintenance Desk
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} style={{ color: 'var(--pup-maroon)' }} />
                <span>
                  <strong>Department:</strong> {complaint.assignedDepartment || 'Pending Triage'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} style={{ color: 'var(--pup-maroon)' }} />
                <span>
                  <strong>Lead Officer:</strong> {complaint.assignedTo || 'Assigning soon...'}
                </span>
              </div>
            </div>
          </Card>

          {/* Comment & Activity Section */}
          <Card style={{ padding: '1.5rem' }}>
            <CommentSection
              complaintId={complaint.id}
              comments={complaint.comments}
              onAddComment={handleAddComment}
            />
          </Card>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Attachment Evidence Viewer"
        maxWidth="750px"
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="Complaint Attachment"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: 'var(--radius-md)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </Modal>

      {/* Edit Complaint Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !isSaving && setShowEditModal(false)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pencil size={18} style={{ color: 'var(--pup-maroon)' }} />
            Edit Complaint
          </span>
        }
        maxWidth="600px"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              isLoading={isSaving}
              disabled={
                isSaving ||
                !editForm.title.trim() ||
                !editForm.description.trim() ||
                !editForm.location.trim()
              }
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={editForm.title}
              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Brief description of the issue"
              maxLength={120}
              disabled={isSaving}
            />
          </div>

          {/* Category & Priority — 2 columns */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, category: e.target.value as ComplaintCategory }))
                }
                disabled={isSaving}
              >
                {(
                  [
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
                  ] as ComplaintCategory[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, priority: e.target.value as Priority }))
                }
                disabled={isSaving}
              >
                {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={editForm.location}
              onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Building A, Room 203"
              disabled={isSaving}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={5}
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              disabled={isSaving}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
            <Trash2 size={18} />
            Delete Complaint
          </span>
        }
        maxWidth="460px"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              disabled={isDeleting}
              leftIcon={<Trash2 size={14} />}
            >
              Yes, Delete
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <Trash2 size={28} style={{ color: '#DC2626' }} />
          </div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Are you sure you want to permanently delete complaint{' '}
            <strong style={{ color: 'var(--pup-maroon)', fontFamily: 'monospace' }}>
              {complaint.id}
            </strong>
            ? This action <strong>cannot be undone</strong>.
          </p>
        </div>
      </Modal>
    </div>
  );
};
