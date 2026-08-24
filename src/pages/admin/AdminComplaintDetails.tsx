import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../context/ToastContext';
import type { ComplaintStatus, Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Timeline } from '../../components/complaints/Timeline';
import { CommentSection } from '../../components/complaints/CommentSection';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wrench,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { DEMO_DEPARTMENTS, CATEGORY_METADATA } from '../../data/mockData';

interface AdminComplaintDetailsProps {
  complaintId: string;
  onNavigate: (path: string) => void;
}

export const AdminComplaintDetails: React.FC<AdminComplaintDetailsProps> = ({
  complaintId,
  onNavigate,
}) => {
  const { getComplaintById, fetchComplaintById, updateStatus, assignOfficer, addComment, deleteComplaint } =
    useComplaints();
  const { success } = useToast();

  const [complaint, setComplaint] = useState<Complaint | undefined>(() =>
    getComplaintById(complaintId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!complaint);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(
    complaint?.status || 'Submitted'
  );
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(
    complaint?.assignedDepartment || DEMO_DEPARTMENTS[0].name
  );
  const [selectedOfficer, setSelectedOfficer] = useState(
    complaint?.assignedTo || DEMO_DEPARTMENTS[0].leadOfficer
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const fetched = await fetchComplaintById(complaintId);
        if (isMounted && fetched) {
          setComplaint(fetched);
          setSelectedStatus(fetched.status);
          if (fetched.assignedDepartment) {
            setSelectedDepartment(fetched.assignedDepartment);
          }
          if (fetched.assignedTo) {
            setSelectedOfficer(fetched.assignedTo);
          }
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
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            The complaint reference ID "{complaintId}" could not be found.
          </p>
          <Button
            variant="primary"
            onClick={() => onNavigate('/admin/complaints')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Complaints Hub
          </Button>
        </Card>
      </div>
    );
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      const success = await updateStatus(
        complaint.id,
        selectedStatus,
        statusNotes.trim() || undefined,
        selectedDepartment
      );
      if (success) {
        setStatusNotes('');
        const fresh = await fetchComplaintById(complaint.id);
        if (fresh) {
          setComplaint(fresh);
          setSelectedStatus(fresh.status);
        }
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const success = await assignOfficer(
        complaint.id,
        selectedDepartment,
        selectedOfficer
      );
      if (success) {
        const fresh = await fetchComplaintById(complaint.id);
        if (fresh) setComplaint(fresh);
      }
    } finally {
      setIsAssigning(false);
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

  const handleDeptChange = (deptName: string) => {
    setSelectedDepartment(deptName);
    const found = DEMO_DEPARTMENTS.find((d) => d.name === deptName);
    if (found) {
      setSelectedOfficer(found.leadOfficer);
    }
  };

  const handleConfirmDelete = async () => {
    if (!complaint || isDeleting) return;
    setIsDeleting(true);
    try {
      const ok = await deleteComplaint(complaint.id);
      if (ok) {
        success('Complaint Deleted', `${complaint.id} has been permanently removed.`);
        onNavigate('/admin/complaints');
        return;
      }
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const catMeta = CATEGORY_METADATA[complaint.category] || {
    color: '#6B7280',
    description: '',
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Bar */}
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
          onClick={() => onNavigate('/admin/complaints')}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '8px 14px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'var(--clay-btn-outline-bg)',
            boxShadow: '0 2px 5px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            color: 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints Hub</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Admin Action Console</span>
        </div>
      </div>

      {/* Main Header Card */}
      <Card style={{ padding: '2rem 2.25rem', borderLeft: `6px solid ${catMeta.color}` }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 900,
                color: 'var(--pup-maroon)',
                background: 'var(--pup-maroon-subtle)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(122, 18, 40, 0.15)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              {complaint.id}
            </span>

            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 800,
                color: catMeta.color,
                background: `${catMeta.color}15`,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              {complaint.category}
            </span>

            <PriorityBadge priority={complaint.priority} />
          </div>

          <StatusBadge status={complaint.status} />
        </div>

        <h1 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '0.85rem', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          {complaint.title}
        </h1>

        {/* Student & Location Metadata Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            background: 'var(--clay-inset-bg)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--clay-inset-shadow)',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Reported By Student</div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.studentName}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '1px' }}>
              {complaint.studentRollNo} • {complaint.studentDepartment}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Target Location</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.location}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Date & Timeline</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {new Date(complaint.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ADMIN CONTROLLER ACTIONS & TIMELINE GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Left: Administrative Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Status Update Controller */}
          <Card style={{ padding: '1.75rem', border: '1.5px solid rgba(122, 18, 40, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem', color: 'var(--pup-maroon)' }}>
              <Wrench size={20} strokeWidth={2.4} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
                Update Complaint Status
              </h3>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">New Status Stage</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                >
                  <option value="Submitted">1. Submitted</option>
                  <option value="Under Review">2. Under Review</option>
                  <option value="Assigned">3. Assigned</option>
                  <option value="In Progress">4. In Progress</option>
                  <option value="Resolved">5. Resolved (Fixed)</option>
                  <option value="Closed">6. Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Action Note / Reason</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Plumber dispatched with replacement valve. ETA 2 hours."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdatingStatus}
                disabled={isUpdatingStatus}
                style={{ width: '100%' }}
                rightIcon={!isUpdatingStatus ? <CheckCircle2 size={16} /> : undefined}
              >
                {isUpdatingStatus ? 'Saving Status...' : 'Apply Status Change'}
              </Button>
            </form>
          </Card>

          {/* Department & Officer Assignment Box */}
          <Card style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.15rem', color: 'var(--pup-navy)' }}>
              <UserCheck size={20} strokeWidth={2.4} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
                Assign Department & Lead Officer
              </h3>
            </div>

            <form onSubmit={handleAssignDepartment}>
              <div className="form-group">
                <label className="form-label">Responsible Campus Wing</label>
                <select
                  className="form-select"
                  value={selectedDepartment}
                  disabled={isAssigning}
                  onChange={(e) => handleDeptChange(e.target.value)}
                >
                  {DEMO_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Field Officer</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedOfficer}
                  disabled={isAssigning}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  placeholder="Officer Name"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                isLoading={isAssigning}
                disabled={isAssigning}
                style={{ width: '100%' }}
              >
                {isAssigning ? 'Saving Assignment...' : 'Save Officer Assignment'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Timeline & Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Timeline */}
          <Card style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.15rem', letterSpacing: '-0.01em' }}>
              Official Status History Log
            </h4>
            <Timeline
              currentStatus={complaint.status}
              history={complaint.statusHistory}
              orientation="vertical"
            />
          </Card>

          {/* Description & Attachments */}
          <Card style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>
              Student Problem Description
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
              {complaint.description}
            </p>

            {complaint.attachments.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
                  ATTACHED EVIDENCE
                </div>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {complaint.attachments.map((att) => (
                    <img
                      key={att.id}
                      src={att.url}
                      alt={att.name}
                      onClick={() => setPreviewImage(att.url)}
                      style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: 'var(--radius-lg)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: 'var(--clay-card-border)',
                        boxShadow: 'var(--clay-card-shadow)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Discussion / Internal Remarks Thread */}
          <Card style={{ padding: '1.75rem' }}>
            <CommentSection
              complaintId={complaint.id}
              comments={complaint.comments}
              onAddComment={handleAddComment}
            />
          </Card>
        </div>
      </div>

      {/* DANGER ZONE — Permanent Deletion */}
      <Card
        style={{
          padding: '1.75rem',
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          background: 'linear-gradient(145deg, #FFFDFD 0%, #FEF2F2 100%)',
          boxShadow: '0 8px 20px -3px rgba(220, 38, 38, 0.1), inset 0 1px 2px rgba(255, 255, 255, 1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#991B1B', letterSpacing: '-0.01em' }}>
                Danger Zone
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#B91C1C', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
                Permanently remove this complaint along with its comments, status history, and related
                notifications. This action cannot be undone.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 size={16} />}
          >
            Delete Complaint
          </Button>
        </div>
      </Card>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Evidence Image"
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Attachment"
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false);
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
            {complaint && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.825rem' }}>
                <strong>{complaint.id}</strong> — {complaint.title}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
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
