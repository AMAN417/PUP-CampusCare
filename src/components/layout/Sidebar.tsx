import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User,
  ShieldAlert,
  BarChart3,
  Users,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onCloseMobile }) => {
  const { role, user } = useAuth();
  const { complaints, unreadNotificationCount } = useComplaints();

  // Compute student complaint counts
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const activeStudentComplaints = complaints.filter(
    (c) => (c.studentId === user?.id || user?.role === 'admin') && c.status !== 'Closed' && c.status !== 'Resolved'
  ).length;

  const handleNav = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const studentLinks = [
    {
      title: 'Dashboard',
      path: '/student/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      title: 'Submit Complaint',
      path: '/student/submit',
      icon: <PlusCircle size={18} />,
      highlight: true,
    },
    {
      title: 'My Complaints',
      path: '/student/complaints',
      icon: <FileText size={18} />,
      badge: activeStudentComplaints > 0 ? activeStudentComplaints : undefined,
    },
    {
      title: 'Notifications',
      path: '/student/notifications',
      icon: <Bell size={18} />,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
      badgeColor: '#DC2626',
    },
    {
      title: 'Student Profile',
      path: '/student/profile',
      icon: <User size={18} />,
    },
  ];

  const adminLinks = [
    {
      title: 'Admin Overview',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      title: 'Complaints Hub',
      path: '/admin/complaints',
      icon: <ShieldAlert size={18} />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: '#D97706',
    },
    {
      title: 'Campus Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 size={18} />,
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <Users size={18} />,
    },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
      }}
    >
      <div>
        {/* Role Header Banner */}
        <div
          style={{
            padding: '0.65rem 0.85rem',
            background: role === 'admin' ? 'var(--pup-navy-subtle)' : 'var(--pup-maroon-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: role === 'admin' ? 'var(--pup-navy)' : 'var(--pup-maroon)',
              }}
            >
              {role === 'admin' ? 'Administrative Portal' : 'Student Portal'}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNav(link.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive
                    ? role === 'admin'
                      ? 'var(--pup-navy)'
                      : 'var(--pup-maroon)'
                    : link.highlight
                    ? 'var(--pup-maroon-subtle)'
                    : 'transparent',
                  color: isActive
                    ? '#FFFFFF'
                    : link.highlight
                    ? 'var(--pup-maroon)'
                    : 'var(--text-secondary)',
                  fontWeight: isActive || link.highlight ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {link.icon}
                  <span>{link.title}</span>
                </div>

                {link.badge !== undefined && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : link.badgeColor || 'var(--pup-maroon)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Help Box */}
      <div
        style={{
          background: 'var(--bg-main)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          marginTop: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--pup-maroon)', fontWeight: 700, fontSize: '0.8125rem' }}>
          <HelpCircle size={14} />
          <span>Campus Helpline</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.65rem 0' }}>
          For emergency support or physical assistance:
        </p>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          +91 175 3046000
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          care.demo@pup.ac.in
        </div>
      </div>
    </aside>
  );
};
