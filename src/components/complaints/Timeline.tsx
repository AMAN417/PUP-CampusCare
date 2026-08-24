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
      <div style={{ width: '100%', overflowX: 'auto', padding: '0.75rem 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            minWidth: '540px',
            padding: '1rem 1.25rem',
          }}
        >
          {/* Connecting Track Line */}
          <div
            style={{
              position: 'absolute',
              top: '28px',
              left: '6%',
              right: '6%',
              height: '4px',
              background: 'rgba(226, 232, 240, 0.9)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.08)',
              zIndex: 1,
            }}
          />
          {/* Active Filled Track */}
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(Math.max(0, currentIndex) / (ALL_STATUSES.length - 1)) * 88}%`,
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '28px',
              left: '6%',
              height: '4px',
              background: 'linear-gradient(90deg, #7A1228 0%, #D97706 100%)',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 2px 6px rgba(122, 18, 40, 0.3)',
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
                  width: '84px',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: isCurrent ? 1.18 : 1 }}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? 'var(--pup-maroon-clay)'
                      : isCurrent
                      ? '#FFFFFF'
                      : 'var(--clay-card-bg)',
                    color: isCompleted
                      ? '#FFFFFF'
                      : isCurrent
                      ? 'var(--pup-maroon)'
                      : 'var(--text-muted)',
                    border: isCompleted
                      ? 'none'
                      : isCurrent
                      ? '3px solid var(--pup-gold)'
                      : '2px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: isCurrent
                      ? '0 0 0 6px var(--pup-gold-subtle), 0 8px 18px -2px rgba(217, 119, 6, 0.3)'
                      : isCompleted
                      ? '0 6px 14px -2px rgba(122, 18, 40, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
                      : '0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted ? <Check size={19} strokeWidth={2.6} /> : STATUS_ICONS[status]}
                </motion.div>
                <span
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: isCurrent ? 800 : 700,
                    marginTop: '0.6rem',
                    color: isCurrent
                      ? 'var(--pup-maroon)'
                      : isCompleted
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    lineHeight: 1.25,
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
            initial={{ opacity: 0, x: -12 }}
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
                  ? 'transparent'
                  : isCurrent
                  ? 'var(--pup-gold)'
                  : 'rgba(203, 213, 225, 0.8)',
              }}
            >
              {isCompleted ? (
                <Check size={14} strokeWidth={2.8} />
              ) : (
                <span style={{ color: isCurrent ? 'var(--pup-maroon)' : 'var(--text-muted)' }}>
                  {STATUS_ICONS[status]}
                </span>
              )}
            </div>

            {/* Clay Content Box */}
            <div
              style={{
                background: isCurrent ? 'linear-gradient(145deg, #FFFFFF 0%, #FDF2F4 100%)' : 'var(--clay-card-bg)',
                border: isCurrent ? '1px solid rgba(122, 18, 40, 0.2)' : 'var(--clay-card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.9rem 1.25rem',
                boxShadow: isCurrent 
                  ? '0 8px 20px -3px rgba(122, 18, 40, 0.12), inset 0 2px 3px rgba(255, 255, 255, 1)'
                  : 'var(--clay-card-shadow)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      color: isCurrent ? 'var(--pup-maroon)' : 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {status}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        background: 'var(--pup-gold-clay)',
                        color: 'white',
                        fontSize: '0.685rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        boxShadow: '0 2px 5px rgba(217, 119, 6, 0.3)',
                      }}
                    >
                      Current State
                    </span>
                  )}
                </div>

                {matchedHistory && (
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
                <div style={{ marginTop: '0.45rem', fontSize: '0.85rem' }}>
                  {matchedHistory.notes && (
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.45 }}>
                      "{matchedHistory.notes}"
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      marginTop: '0.35rem',
                      fontSize: '0.775rem',
                      color: 'var(--text-muted)',
                      fontWeight: 500,
                    }}
                  >
                    <span>By: <strong style={{ color: 'var(--text-secondary)' }}>{matchedHistory.updatedBy}</strong></span>
                    {matchedHistory.department && <span>Dept: <strong>{matchedHistory.department}</strong></span>}
                  </div>
                </div>
              )}

              {!matchedHistory && !isUpcoming && (
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                  Completed
                </div>
              )}

              {isUpcoming && (
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
