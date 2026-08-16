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
        return <Clock size={18} style={{ color: 'var(--pup-maroon)' }} />;
      case 'assignment':
        return <UserCheck size={18} style={{ color: '#0284C7' }} />;
      case 'comment':
        return <MessageSquare size={18} style={{ color: '#059669' }} />;
      case 'urgent':
        return <ShieldAlert size={18} style={{ color: '#DC2626' }} />;
      default:
        return <Bell size={18} style={{ color: 'var(--pup-gold)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
            Real-time updates regarding your filed complaints, engineer assignments, and responses.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            leftIcon={<CheckCheck size={15} />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadNotificationCount})
        </Button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="You are fully caught up with all campus alerts and complaint updates."
            icon={<Bell size={32} />}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                padding: '1.25rem',
                borderLeft: item.read ? '1px solid var(--border-light)' : '4px solid var(--pup-maroon)',
                background: item.read ? 'var(--bg-surface)' : 'var(--pup-maroon-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
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
                      marginBottom: '0.25rem',
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                    {item.message}
                  </p>

                  {item.complaintId && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--pup-maroon)',
                      }}
                    >
                      <span>View Ticket ({item.complaintId})</span>
                      <ArrowRight size={13} />
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
