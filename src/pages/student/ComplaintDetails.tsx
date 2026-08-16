import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
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
} from 'lucide-react';
import { CATEGORY_METADATA } from '../../data/mockData';
import type { Complaint } from '../../types';

interface ComplaintDetailsProps {
  complaintId: string;
  onNavigate: (path: string) => void;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaintId,
  onNavigate,
}) => {
  const { getComplaintById, fetchComplaintById, addComment, updateStatus } = useComplaints();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [complaint, setComplaint] = useState<Complaint | undefined>(() =>
    getComplaintById(complaintId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!complaint);
  const [isClosing, setIsClosing] = useState<boolean>(false);

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
    </div>
  );
};
