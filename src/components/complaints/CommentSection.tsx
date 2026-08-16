import React, { useState } from 'react';
import type { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Send, Shield, GraduationCap, Lock, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  complaintId?: string;
  comments: Comment[];
  onAddComment: (message: string, isInternal?: boolean) => boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
}) => {
  const { user, role } = useAuth();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    const success = onAddComment(message.trim(), isInternal);
    if (success) {
      setMessage('');
      setIsInternal(false);
    }
    setSubmitting(false);
  };

  // Filter out internal comments for students
  const visibleComments = comments.filter((c) => {
    if (role === 'student' && c.isInternal) return false;
    return true;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <MessageSquare size={18} style={{ color: 'var(--pup-maroon)' }} />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
          Activity & Responses ({visibleComments.length})
        </h4>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {visibleComments.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No responses or remarks posted yet.
          </div>
        ) : (
          visibleComments.map((comment) => {
            const isAdmin = comment.userRole === 'admin';
            const isMe = comment.userId === user?.id;

            return (
              <div
                key={comment.id}
                style={{
                  background: comment.isInternal
                    ? '#FFFBEB'
                    : isAdmin
                    ? 'var(--pup-navy-subtle)'
                    : 'var(--bg-surface)',
                  border: `1px solid ${
                    comment.isInternal
                      ? '#FDE68A'
                      : isAdmin
                      ? 'var(--border-light)'
                      : 'var(--border-light)'
                  }`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.25rem',
                  position: 'relative',
                }}
              >
                {comment.isInternal && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: '#F59E0B',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Lock size={10} />
                    <span>Internal Staff Remark</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isAdmin ? 'var(--pup-navy)' : 'var(--pup-maroon)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {isAdmin ? <Shield size={14} /> : <GraduationCap size={14} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {comment.userName}{isMe ? ' (You)' : ''}
                      </span>
                      <span
                        style={{
                          marginLeft: '0.4rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: isAdmin ? 'var(--pup-navy)' : 'var(--pup-maroon)',
                          background: isAdmin ? 'rgba(15, 23, 42, 0.08)' : 'var(--pup-maroon-subtle)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {comment.userRole}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(comment.timestamp).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {comment.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <textarea
          rows={3}
          className="form-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            role === 'admin'
              ? 'Add an update, instructions, or official response...'
              : 'Add an inquiry or supplementary detail for the maintenance team...'
          }
          style={{ resize: 'vertical' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {role === 'admin' ? (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              <Lock size={13} style={{ color: '#D97706' }} />
              <span>Mark as Internal Staff Note (Hidden from student)</span>
            </label>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Responses are visible to assigned maintenance staff.
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!message.trim() || submitting}
            isLoading={submitting}
            rightIcon={<Send size={14} />}
          >
            Post Message
          </Button>
        </div>
      </form>
    </div>
  );
};
