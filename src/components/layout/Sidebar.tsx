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

interface SidebarLink {
  title: string;
  path: string;
  icon: React.ReactNode;
  highlight?: boolean;
  badge?: number;
  badgeColor?: string;
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

  const studentLinks: SidebarLink[] = [
    {
      title: 'Dashboard',
      path: '/student/dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      title: 'Submit Complaint',
      path: '/student/submit',
      icon: <PlusCircle size={19} />,
      highlight: true,
    },
    {
      title: 'My Complaints',
      path: '/student/complaints',
      icon: <FileText size={19} />,
      badge: activeStudentComplaints > 0 ? activeStudentComplaints : undefined,
    },
    {
      title: 'Notifications',
      path: '/student/notifications',
      icon: <Bell size={19} />,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
      badgeColor: '#DC2626',
    },
    {
      title: 'Student Profile',
      path: '/student/profile',
      icon: <User size={19} />,
    },
  ];

  const adminLinks: SidebarLink[] = [
    {
      title: 'Admin Overview',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      title: 'Complaints Hub',
      path: '/admin/complaints',
      icon: <ShieldAlert size={19} />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: '#D97706',
    },
    {
      title: 'Campus Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 size={19} />,
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <Users size={19} />,
    },
  ];

  const links: SidebarLink[] = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '1.25rem 0.65rem 1.25rem 0.65rem',
      }}
    >
      <div>
        {/* Role Header Clay Card */}
        <div
          style={{
            padding: '0.85rem 1.15rem',
            background: role === 'admin' ? 'var(--pup-navy-clay)' : 'var(--pup-maroon-clay)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 
              role === 'admin'
                ? '0 6px 16px -2px rgba(15, 23, 42, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                : '0 6px 16px -2px rgba(122, 18, 40, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#FDE68A',
              }}
            >
              {role === 'admin' ? 'Administrative Portal' : 'Student Portal'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {user?.name.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
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
                  padding: '0.75rem 1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: isActive
                    ? '#FFFFFF'
                    : link.highlight
                    ? 'rgba(122, 18, 40, 0.08)'
                    : 'transparent',
                  color: isActive
                    ? role === 'admin' ? 'var(--pup-navy)' : 'var(--pup-maroon)'
                    : link.highlight
                    ? 'var(--pup-maroon)'
                    : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : link.highlight ? 700 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: isActive
                    ? '0 6px 14px -2px rgba(15, 23, 42, 0.08), inset 0 1.5px 2px rgba(255, 255, 255, 1)'
                    : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {link.icon}
                  <span>{link.title}</span>
                </div>

                {link.badge !== undefined && (
                  <span
                    style={{
                      background: isActive 
                        ? (role === 'admin' ? 'var(--pup-navy)' : 'var(--pup-maroon)')
                        : (link.badgeColor || 'var(--pup-maroon)'),
                      color: '#FFFFFF',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
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

      {/* Footer / Quick Help Clay Card */}
      <div
        style={{
          background: 'var(--clay-card-bg)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          border: 'var(--clay-card-border)',
          boxShadow: 'var(--clay-card-shadow)',
          marginTop: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--pup-maroon)', fontWeight: 800, fontSize: '0.85rem' }}>
          <HelpCircle size={16} />
          <span>Campus Helpline</span>
        </div>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0.4rem 0 0.75rem 0', lineHeight: 1.4 }}>
          For emergency support or physical assistance:
        </p>
        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          +91 175 3046000
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
          care.demo@pup.ac.in
        </div>
      </div>
    </aside>
  );
};
