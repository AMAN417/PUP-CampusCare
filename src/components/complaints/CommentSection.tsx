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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} style={{ color: 'var(--pup-maroon)' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Comments & Discussion ({visibleComments.length})
          </h4>
        </div>
      </div>

      {/* Comment History Stream */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          maxHeight: '420px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {visibleComments.length === 0 ? (
          <div
            style={{
              padding: '1.75rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
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
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: comm.isInternal
                    ? '#FFFBEB'
                    : isAdmin
                    ? 'var(--pup-maroon-subtle)'
                    : 'var(--bg-main)',
                  border: `1px solid ${
                    comm.isInternal
                      ? '#FDE68A'
                      : isAdmin
                      ? 'rgba(122, 18, 40, 0.15)'
                      : 'var(--border-light)'
                  }`,
                }}
              >
                {/* Author Info Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isAdmin ? (
                      <Shield size={14} style={{ color: 'var(--pup-maroon)' }} />
                    ) : (
                      <GraduationCap size={14} style={{ color: 'var(--text-secondary)' }} />
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {comm.userName}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: isAdmin ? 'var(--pup-maroon)' : '#E5E7EB',
                        color: isAdmin ? '#FFFFFF' : '#374151',
                      }}
                    >
                      {comm.userRole.toUpperCase()}
                    </span>
                    {comm.isInternal && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Lock size={11} /> Internal Note
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
              gap: '0.75rem',
            }}
          >
            {role === 'admin' ? (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <span>Internal remark only (Hidden from student)</span>
              </label>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
