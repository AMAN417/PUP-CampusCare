import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
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
  Wrench,
  UserCheck,
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
  const { getComplaintById, fetchComplaintById, updateStatus, assignOfficer, addComment } =
    useComplaints();

  const [complaint, setComplaint] = useState<Complaint | undefined>(() =>
    getComplaintById(complaintId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!complaint);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

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

  const catMeta = CATEGORY_METADATA[complaint.category] || {
    color: '#6B7280',
    description: '',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
          <span>Back to Complaints Hub</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Action Console</span>
        </div>
      </div>

      {/* Main Header Card */}
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
                fontSize: '1.1rem',
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

        {/* Student & Location Metadata Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reported By Student</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.studentName}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {complaint.studentRollNo} • {complaint.studentDepartment}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Target Location</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.location}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Date & Timeline</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left: Administrative Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Update Controller */}
          <Card style={{ padding: '1.5rem', border: '1.5px solid var(--pup-maroon)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: 'var(--pup-maroon)' }}>
              <Wrench size={18} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
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
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: 'var(--pup-navy)' }}>
              <UserCheck size={18} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Timeline */}
          <Card style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              Official Status History Log
            </h4>
            <Timeline
              currentStatus={complaint.status}
              history={complaint.statusHistory}
              orientation="vertical"
            />
          </Card>

          {/* Description & Attachments */}
          <Card style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Student Problem Description
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {complaint.description}
            </p>

            {complaint.attachments.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  ATTACHED EVIDENCE
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {complaint.attachments.map((att) => (
                    <img
                      key={att.id}
                      src={att.url}
                      alt={att.name}
                      onClick={() => setPreviewImage(att.url)}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1px solid var(--border-light)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Discussion / Internal Remarks Thread */}
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
        title="Evidence Image"
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Attachment"
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        )}
      </Modal>
    </div>
  );
};
