import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import {
  PlusCircle,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { complaints, notifications, loading } = useComplaints();

  // Filter complaints for this student
  const studentComplaints = complaints.filter(
    (c) => c.studentId === user?.id || user?.role === 'admin'
  );

  const total = studentComplaints.length;
  const pending = studentComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = studentComplaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  ).length;
  const resolved = studentComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;

  const recentComplaints = [...studentComplaints].slice(0, 3);
  const recentNotifs = notifications.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. WELCOME BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7A1228 0%, #560C1C 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-maroon)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.6rem',
            }}
          >
            <Sparkles size={13} />
            <span>Student Care Portal • Punjabi University Patiala</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            Welcome back, {user?.name || 'Student'}!
          </h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.85rem',
              color: '#FDE68A',
              marginTop: '0.35rem',
            }}
          >
            {user?.rollNo && <span>Roll No: <strong>{user.rollNo}</strong></span>}
            {user?.department && <span>Dept: <strong>{user.department}</strong></span>}
            {user?.hostel && <span>Residence: <strong>{user.hostel}</strong></span>}
          </div>
        </div>

        <div>
          <Button
            variant="gold"
            size="lg"
            onClick={() => onNavigate('/student/submit')}
            leftIcon={<PlusCircle size={18} />}
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
          >
            Report an Issue
          </Button>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          label="Total Complaints"
          value={total}
          icon={<FileText size={22} />}
          iconBg="var(--pup-maroon-subtle)"
          iconColor="var(--pup-maroon)"
          onClick={() => onNavigate('/student/complaints')}
        />
        <StatCard
          label="Pending Review"
          value={pending}
          icon={<Clock size={22} />}
          iconBg="var(--status-review-bg)"
          iconColor="var(--status-review)"
          onClick={() => onNavigate('/student/complaints?tab=pending')}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={<Wrench size={22} />}
          iconBg="var(--status-progress-bg)"
          iconColor="#B45309"
          onClick={() => onNavigate('/student/complaints?tab=in_progress')}
        />
        <StatCard
          label="Resolved / Closed"
          value={resolved}
          icon={<CheckCircle2 size={22} />}
          iconBg="var(--status-resolved-bg)"
          iconColor="var(--status-resolved)"
          onClick={() => onNavigate('/student/complaints?tab=resolved')}
        />
      </div>

      {/* 3. MAIN SECTION: RECENT COMPLAINTS & ACTIVITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Recent Complaints */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Complaints</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/student/complaints')}
              rightIcon={<ArrowRight size={14} />}
            >
              View All ({studentComplaints.length})
            </Button>
          </div>

          {loading && studentComplaints.length === 0 ? (
            <LoadingSkeleton type="card" count={3} />
          ) : recentComplaints.length === 0 ? (
            <Card>
              <EmptyState
                title="No complaints reported yet"
                description="Everything looks peaceful! If you spot an issue in your hostel or department, click below to report it."
                actionText="Report Issue Now"
                onAction={() => onNavigate('/student/submit')}
                actionIcon={<PlusCircle size={16} />}
              />
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {recentComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  interactive={true}
                  onClick={() => onNavigate(`/student/complaints/${complaint.id}`)}
                  style={{ padding: '1.25rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--pup-maroon)',
                          background: 'var(--pup-maroon-subtle)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {complaint.id}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-main)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {complaint.category}
                      </span>
                    </div>
                    <PriorityBadge priority={complaint.priority} />
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {complaint.title}
                  </h4>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.85rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {complaint.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} style={{ color: 'var(--pup-maroon)' }} />
                      <span>{complaint.location}</span>
                    </div>

                    <StatusBadge status={complaint.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Notifications & Quick Assistance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Notifications Card */}
          <Card>
            <CardHeader
              title="Recent Updates"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/student/notifications')}
                >
                  All
                </Button>
              }
            />
            <CardBody>
              {recentNotifs.length === 0 ? (
                <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.complaintId) onNavigate(`/student/complaints/${n.complaintId}`);
                      }}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        background: n.read ? 'var(--bg-main)' : 'var(--pup-maroon-subtle)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Help Card */}
          <Card style={{ background: 'var(--pup-navy-subtle)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--pup-navy)', marginBottom: '0.4rem' }}>
              Need Urgent Help?
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              For electrical fire hazards, major water burst, or security emergencies, please call the university security desk immediately.
            </p>
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-light)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Campus Emergency
              </span>
              <strong style={{ fontSize: '0.875rem', color: '#DC2626' }}>+91 175 3046100</strong>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
