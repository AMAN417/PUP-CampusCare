import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useComplaints();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Clock size={19} strokeWidth={2.4} style={{ color: 'var(--pup-maroon)' }} />;
      case 'assignment':
        return <UserCheck size={19} strokeWidth={2.4} style={{ color: '#0284C7' }} />;
      case 'comment':
        return <MessageSquare size={19} strokeWidth={2.4} style={{ color: '#059669' }} />;
      case 'urgent':
        return <ShieldAlert size={19} strokeWidth={2.4} style={{ color: '#DC2626' }} />;
      default:
        return <Bell size={19} strokeWidth={2.4} style={{ color: 'var(--pup-gold)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Campus Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Real-time updates regarding your filed complaints, engineer assignments, and responses.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            leftIcon={<CheckCheck size={16} />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--clay-inset-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: '4px',
          boxShadow: 'var(--clay-inset-shadow)',
          width: 'fit-content',
          gap: '0.35rem',
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            background: filter === 'all' ? '#FFFFFF' : 'transparent',
            boxShadow: filter === 'all' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
            color: filter === 'all' ? 'var(--pup-maroon)' : 'var(--text-secondary)',
            fontWeight: filter === 'all' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            background: filter === 'unread' ? '#FFFFFF' : 'transparent',
            boxShadow: filter === 'unread' ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
            color: filter === 'unread' ? 'var(--pup-maroon)' : 'var(--text-secondary)',
            fontWeight: filter === 'unread' ? 800 : 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          Unread ({unreadNotificationCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="You are fully caught up with all campus alerts and complaint updates."
            icon={<Bell size={36} />}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((item) => (
            <Card
              key={item.id}
              interactive={true}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.complaintId) {
                  onNavigate(`/student/complaints/${item.complaintId}`);
                }
              }}
              style={{
                padding: '1.35rem 1.5rem',
                borderLeft: item.read ? 'var(--clay-card-border)' : '5px solid var(--pup-maroon)',
                background: item.read ? 'var(--clay-card-bg)' : 'linear-gradient(145deg, #FFFFFF 0%, #FDF2F4 100%)',
                boxShadow: item.read ? 'var(--clay-card-shadow)' : '0 8px 20px -3px rgba(122, 18, 40, 0.12), inset 0 1.5px 2px rgba(255, 255, 255, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.15rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--clay-card-bg)',
                    border: 'var(--clay-card-border)',
                    boxShadow: 'var(--clay-card-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: 1.5 }}>
                    {item.message}
                  </p>

                  {item.complaintId && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.785rem',
                        fontWeight: 800,
                        color: 'var(--pup-maroon)',
                      }}
                    >
                      <span>View Ticket ({item.complaintId})</span>
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
