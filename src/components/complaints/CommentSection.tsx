import React, { useState } from 'react';
import type { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Send, Shield, GraduationCap, Lock, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  complaintId?: string;
  comments: Comment[];
  onAddComment: (message: string, isInternal?: boolean) => Promise<boolean | void> | boolean | void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
}) => {
  const { role } = useAuth();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const success = await onAddComment(message.trim(), isInternal);
      if (success) {
        setMessage('');
        setIsInternal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out internal comments for students
  const visibleComments = comments.filter((c) => {
    if (role === 'student' && c.isInternal) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(241, 245, 249, 0.85)',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--pup-maroon-subtle)',
              color: 'var(--pup-maroon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(122, 18, 40, 0.1)',
            }}
          >
            <MessageSquare size={16} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Comments & Discussion ({visibleComments.length})
          </h4>
        </div>
      </div>

      {/* Comment History Stream */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '6px',
        }}
      >
        {visibleComments.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              background: 'var(--clay-inset-bg)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--clay-inset-shadow)',
              fontWeight: 500,
            }}
          >
            No responses recorded yet. Post a remark or query below.
          </div>
        ) : (
          visibleComments.map((comm) => {
            const isAdmin = comm.userRole === 'admin';
            return (
              <div
                key={comm.id}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  background: comm.isInternal
                    ? 'linear-gradient(145deg, #FFFDF5 0%, #FEF3C7 100%)'
                    : isAdmin
                    ? 'linear-gradient(145deg, #FFFFFF 0%, #FDF2F4 100%)'
                    : 'var(--clay-card-bg)',
                  border: comm.isInternal
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : isAdmin
                    ? '1px solid rgba(122, 18, 40, 0.15)'
                    : 'var(--clay-card-border)',
                  boxShadow: 'var(--clay-card-shadow)',
                }}
              >
                {/* Author Info Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isAdmin ? (
                      <Shield size={15} style={{ color: 'var(--pup-maroon)' }} />
                    ) : (
                      <GraduationCap size={15} style={{ color: 'var(--text-secondary)' }} />
                    )}
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {comm.userName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: isAdmin ? 'var(--pup-maroon-clay)' : 'rgba(15, 23, 42, 0.08)',
                        color: isAdmin ? '#FFFFFF' : '#334155',
                        boxShadow: isAdmin ? '0 2px 5px rgba(122, 18, 40, 0.25)' : 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {comm.userRole.toUpperCase()}
                    </span>
                    {comm.isInternal && (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: 'rgba(217, 119, 6, 0.15)',
                          padding: '1px 7px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Lock size={12} /> Internal Note
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(comm.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Body */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {comm.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input Box */}
      <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <textarea
            rows={3}
            className="form-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              role === 'admin'
                ? 'Type update or feedback for student or maintenance team...'
                : 'Write additional details, clarification, or follow-up note...'
            }
            required
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            {role === 'admin' ? (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--pup-maroon)' }}
                />
                <span>Internal remark only (Hidden from student)</span>
              </label>
            ) : (
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Visible to maintenance administrators
              </span>
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
              rightIcon={<Send size={14} />}
            >
              Post Comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
