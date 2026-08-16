import React from 'react';
import type { ComplaintStatus, StatusHistory } from '../../types';
import { motion } from 'framer-motion';
import { Check, Clock, Search, UserCheck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface TimelineProps {
  currentStatus: ComplaintStatus;
  history?: StatusHistory[];
  orientation?: 'horizontal' | 'vertical';
}

const ALL_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

const STATUS_ICONS: Record<ComplaintStatus, React.ReactNode> = {
  Submitted: <Clock size={16} />,
  'Under Review': <Search size={16} />,
  Assigned: <UserCheck size={16} />,
  'In Progress': <Wrench size={16} />,
  Resolved: <CheckCircle2 size={16} />,
  Closed: <XCircle size={16} />,
};

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  history = [],
  orientation = 'vertical',
}) => {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);

  if (orientation === 'horizontal') {
    return (
      <div style={{ width: '100%', padding: '1rem 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Connecting Track Line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '5%',
              right: '5%',
              height: '3px',
              background: 'var(--border-light)',
              zIndex: 1,
            }}
          />
          {/* Active Filled Track */}
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(Math.max(0, currentIndex) / (ALL_STATUSES.length - 1)) * 90}%`,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '20px',
              left: '5%',
              height: '3px',
              background: 'linear-gradient(90deg, #7A1228 0%, #D97706 100%)',
              zIndex: 2,
            }}
          />

          {ALL_STATUSES.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={status}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 3,
                  position: 'relative',
                  width: '80px',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.15 : 1 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? 'var(--pup-maroon)'
                      : isCurrent
                      ? 'var(--bg-surface)'
                      : 'var(--bg-surface)',
                    color: isCompleted
                      ? '#FFFFFF'
                      : isCurrent
                      ? 'var(--pup-maroon)'
                      : 'var(--text-muted)',
                    border: isCompleted
                      ? '2px solid var(--pup-maroon)'
                      : isCurrent
                      ? '3px solid var(--pup-gold)'
                      : '2px solid var(--border-light)',
                    boxShadow: isCurrent
                      ? '0 0 0 5px var(--pup-gold-subtle), var(--shadow-md)'
                      : 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted ? <Check size={18} /> : STATUS_ICONS[status]}
                </motion.div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 700 : 600,
                    marginTop: '0.5rem',
                    color: isCurrent
                      ? 'var(--pup-maroon)'
                      : isCompleted
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    lineHeight: 1.2,
                  }}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Timeline with Detailed Status History
  return (
    <div className="timeline-container">
      {ALL_STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        // Check if there is history item matching this status
        const matchedHistory = history.find((h) => h.status === status);

        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
            style={{
              opacity: isUpcoming ? 0.45 : 1,
            }}
          >
            {/* Timeline Dot */}
            <div
              className="timeline-dot"
              style={{
                borderColor: isCompleted
                  ? 'var(--pup-maroon)'
                  : isCurrent
                  ? 'var(--pup-gold)'
                  : 'var(--border-light)',
              }}
            >
              {isCompleted ? (
                <Check size={14} />
              ) : (
                <span style={{ color: isCurrent ? 'var(--pup-maroon)' : 'var(--text-muted)' }}>
                  {STATUS_ICONS[status]}
                </span>
              )}
            </div>

            {/* Content Box */}
            <div
              style={{
                background: isCurrent ? 'var(--pup-maroon-subtle)' : 'var(--bg-surface)',
                border: `1px solid ${isCurrent ? 'rgba(122, 18, 40, 0.2)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                boxShadow: isCurrent ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: isCurrent ? 'var(--pup-maroon)' : 'var(--text-primary)',
                    }}
                  >
                    {status}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        background: 'var(--pup-gold)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Current State
                    </span>
                  )}
                </div>

                {matchedHistory && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(matchedHistory.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>

              {matchedHistory && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.8125rem' }}>
                  {matchedHistory.notes && (
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                      "{matchedHistory.notes}"
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginTop: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>By: {matchedHistory.updatedBy}</span>
                    {matchedHistory.department && <span>Dept: {matchedHistory.department}</span>}
                  </div>
                </div>
              )}

              {!matchedHistory && !isUpcoming && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Completed
                </div>
              )}

              {isUpcoming && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Pending next administrative action
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
