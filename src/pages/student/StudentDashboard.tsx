import React from 'react';
import { motion } from 'framer-motion';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* 1. WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: 'var(--pup-maroon-clay)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.25rem 2.5rem',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.75rem',
          boxShadow: '0 20px 40px -10px rgba(122, 18, 40, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.775rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.4)',
            }}
          >
            <Sparkles size={14} />
            <span>Student Care Portal • Punjabi University Patiala</span>
          </div>

          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
            Welcome back, {user?.name || 'Student'}!
          </h2>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              fontSize: '0.875rem',
              color: '#FDE68A',
              marginTop: '0.45rem',
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
            isMagnetic={true}
            onClick={() => onNavigate('/student/submit')}
            leftIcon={<PlusCircle size={19} />}
          >
            Report an Issue
          </Button>
        </div>
      </motion.div>

      {/* 2. STAT CARDS ROW WITH STAGGERED ENTRANCE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.35rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.0 }}
        >
          <StatCard
            label="Total Complaints"
            value={total}
            icon={<FileText size={24} strokeWidth={2.4} />}
            iconBg="var(--pup-maroon-subtle)"
            iconColor="var(--pup-maroon)"
            onClick={() => onNavigate('/student/complaints')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <StatCard
            label="Pending Review"
            value={pending}
            icon={<Clock size={24} strokeWidth={2.4} />}
            iconBg="var(--status-review-bg)"
            iconColor="var(--status-review)"
            onClick={() => onNavigate('/student/complaints?tab=pending')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatCard
            label="In Progress"
            value={inProgress}
            icon={<Wrench size={24} strokeWidth={2.4} />}
            iconBg="var(--status-progress-bg)"
            iconColor="#B45309"
            onClick={() => onNavigate('/student/complaints?tab=in_progress')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <StatCard
            label="Resolved / Closed"
            value={resolved}
            icon={<CheckCircle2 size={24} strokeWidth={2.4} />}
            iconBg="var(--status-resolved-bg)"
            iconColor="var(--status-resolved)"
            onClick={() => onNavigate('/student/complaints?tab=resolved')}
          />
        </motion.div>
      </div>

      {/* 3. MAIN SECTION: RECENT COMPLAINTS & ACTIVITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Recent Complaints */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Recent Complaints</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/student/complaints')}
              rightIcon={<ArrowRight size={15} />}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.15rem' }}>
              {recentComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                >
                  <Card
                    interactive={true}
                    glowOnHover={true}
                    onClick={() => onNavigate(`/student/complaints/${complaint.id}`)}
                    style={{ padding: '1.5rem' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.775rem',
                            fontWeight: 800,
                            color: 'var(--pup-maroon)',
                            background: 'var(--pup-maroon-subtle)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)',
                          }}
                        >
                          {complaint.id}
                        </span>
                        <span
                          style={{
                            fontSize: '0.775rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            background: 'var(--clay-inset-bg)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: 'inset 1px 1px 2px rgba(15, 23, 42, 0.05)',
                          }}
                        >
                          {complaint.category}
                        </span>
                      </div>
                      <PriorityBadge priority={complaint.priority} />
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.015em' }}>
                      {complaint.title}
                    </h4>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        lineHeight: 1.45,
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
                        paddingTop: '0.85rem',
                        borderTop: '1px solid rgba(241, 245, 249, 0.85)',
                        fontSize: '0.785rem',
                        color: 'var(--text-muted)',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <MapPin size={14} style={{ color: 'var(--pup-maroon)' }} />
                        <span>{complaint.location}</span>
                      </div>

                      <StatusBadge status={complaint.status} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Notifications & Quick Assistance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No new notifications
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {recentNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.complaintId) onNavigate(`/student/complaints/${n.complaintId}`);
                      }}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-lg)',
                        background: n.read ? 'rgba(240, 243, 248, 0.6)' : 'var(--pup-maroon-subtle)',
                        boxShadow: n.read ? 'none' : '0 2px 6px rgba(122, 18, 40, 0.06)',
                        border: n.read ? '1px solid rgba(226, 232, 240, 0.6)' : '1px solid rgba(122, 18, 40, 0.12)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Help Card */}
          <Card style={{ background: 'var(--clay-card-bg)', border: '1px solid rgba(15, 23, 42, 0.1)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pup-navy)', marginBottom: '0.45rem', letterSpacing: '-0.01em' }}>
              Need Urgent Help?
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              For electrical fire hazards, major water burst, or security emergencies, please call the university security desk immediately.
            </p>
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'var(--clay-inset-bg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--clay-inset-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Campus Emergency
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#DC2626', fontWeight: 900 }}>+91 175 3046100</strong>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
