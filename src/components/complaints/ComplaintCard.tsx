import React from 'react';
import type { Complaint } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Card } from '../common/Card';
import { MapPin, Calendar, ArrowRight, MessageSquare, Paperclip } from 'lucide-react';
import { CATEGORY_METADATA } from '../../data/mockData';

interface ComplaintCardProps {
  complaint: Complaint;
  onOpen: (id: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onOpen }) => {
  const catMeta = CATEGORY_METADATA[complaint.category] || {
    color: '#6B7280',
    description: '',
  };

  return (
    <Card
      interactive={true}
      onClick={() => onOpen(complaint.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${catMeta.color}`,
      }}
    >
      <div>
        {/* Top Header info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'var(--bg-main)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
              }}
            >
              {complaint.id}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: catMeta.color,
                background: `${catMeta.color}15`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {complaint.category}
            </span>
          </div>

          <PriorityBadge priority={complaint.priority} />
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            marginBottom: '0.5rem',
          }}
        >
          {complaint.title}
        </h4>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {complaint.description}
        </p>

        {/* Location & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <MapPin size={13} style={{ flexShrink: 0, color: 'var(--pup-maroon)' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {complaint.location}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>
              Reported on {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <StatusBadge status={complaint.status} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {complaint.comments.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <MessageSquare size={13} />
              <span>{complaint.comments.length}</span>
            </div>
          )}

          {complaint.attachments.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <Paperclip size={13} />
              <span>{complaint.attachments.length}</span>
            </div>
          )}

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--pup-maroon)',
              fontSize: '0.75rem',
              fontWeight: 700,
              gap: '0.15rem',
            }}
          >
            <span>View</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Card>
  );
};
