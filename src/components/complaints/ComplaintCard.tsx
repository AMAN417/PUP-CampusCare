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
        borderLeft: `5px solid ${catMeta.color}`,
      }}
    >
      <div>
        {/* Top Header info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.775rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                background: 'var(--clay-inset-bg)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'inset 1px 1px 2px rgba(15, 23, 42, 0.06)',
              }}
            >
              {complaint.id}
            </span>
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 800,
                color: catMeta.color,
                background: `${catMeta.color}15`,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)',
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
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            marginBottom: '0.6rem',
            letterSpacing: '-0.015em',
          }}
        >
          {complaint.title}
        </h4>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '1.15rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {complaint.description}
        </p>

        {/* Location & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.15rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <MapPin size={14} style={{ flexShrink: 0, color: 'var(--pup-maroon)' }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {complaint.location}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <Calendar size={14} style={{ flexShrink: 0 }} />
            <span>
              Reported on {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(241, 245, 249, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <StatusBadge status={complaint.status} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {complaint.comments.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <MessageSquare size={14} />
              <span>{complaint.comments.length}</span>
            </div>
          )}

          {complaint.attachments.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.775rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <Paperclip size={14} />
              <span>{complaint.attachments.length}</span>
            </div>
          )}

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--pup-maroon)',
              fontSize: '0.8rem',
              fontWeight: 800,
              gap: '0.2rem',
            }}
          >
            <span>View</span>
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Card>
  );
};
