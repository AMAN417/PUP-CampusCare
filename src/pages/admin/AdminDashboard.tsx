import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Flame,
  AlertTriangle,
  ArrowRight,
  Download,
  ShieldCheck,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { DEMO_DEPARTMENTS } from '../../data/mockData';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { complaints, exportCSV, loading } = useComplaints();

  // Calculate Admin Metrics
  const total = complaints.length;
  const newPending = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  ).length;
  const resolved = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const highUrgent = complaints.filter(
    (c) => (c.priority === 'High' || c.priority === 'Urgent') && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;
  const overdue = complaints.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    const hoursOld = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
    return hoursOld > 48;
  }).length;

  const urgentComplaints = complaints
    .filter((c) => c.priority === 'Urgent' || c.priority === 'High')
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
      {/* 1. ADMIN HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2.25rem 2.5rem',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.75rem',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.775rem',
              fontWeight: 800,
              color: '#FDE68A',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <ShieldCheck size={14} />
            <span>Campus Estate & Maintenance Operations Central</span>
          </div>

          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
            Welcome, {user?.name || 'Administrator'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Punjabi University Patiala Central Facilities Management Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => exportCSV()}
            leftIcon={<Download size={16} />}
            style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}
          >
            Export CSV Log
          </Button>
          <Button
            variant="gold"
            size="md"
            isMagnetic={true}
            onClick={() => onNavigate('/admin/complaints')}
            rightIcon={<ArrowRight size={16} />}
          >
            Manage All ({total})
          </Button>
        </div>
      </motion.div>

      {/* 2. STATS ROW WITH STAGGERED ENTRANCE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
            iconBg="var(--pup-navy-subtle)"
            iconColor="var(--pup-navy)"
            onClick={() => onNavigate('/admin/complaints')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
        >
          <StatCard
            label="New / Pending Triage"
            value={newPending}
            icon={<Clock size={24} strokeWidth={2.4} />}
            iconBg="var(--status-review-bg)"
            iconColor="var(--status-review)"
            onClick={() => onNavigate('/admin/complaints?status=Submitted')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <StatCard
            label="In Progress"
            value={inProgress}
            icon={<Wrench size={24} strokeWidth={2.4} />}
            iconBg="var(--status-progress-bg)"
            iconColor="#B45309"
            onClick={() => onNavigate('/admin/complaints?status=In Progress')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          <StatCard
            label="Resolved"
            value={resolved}
            icon={<CheckCircle2 size={24} strokeWidth={2.4} />}
            iconBg="var(--status-resolved-bg)"
            iconColor="var(--status-resolved)"
            onClick={() => onNavigate('/admin/complaints?status=Resolved')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
        >
          <StatCard
            label="High / Urgent"
            value={highUrgent}
            icon={<Flame size={24} strokeWidth={2.4} />}
            iconBg="var(--priority-urgent-bg)"
            iconColor="#DC2626"
            onClick={() => onNavigate('/admin/complaints?priority=Urgent')}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatCard
            label="Overdue (>48h)"
            value={overdue}
            icon={<AlertTriangle size={24} strokeWidth={2.4} />}
            iconBg="#FEF2F2"
            iconColor="#DC2626"
          />
        </motion.div>
      </div>

      {/* 3. URGENT TRIAGE QUEUE & DEPARTMENT GLANCE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Urgent Action Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={20} style={{ color: '#DC2626' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em' }}>High & Urgent Triage Queue</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/admin/complaints')}
              rightIcon={<ArrowRight size={15} />}
            >
              View Full Queue
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading && complaints.length === 0 ? (
              <LoadingSkeleton type="card" count={3} />
            ) : urgentComplaints.length === 0 ? (
              <Card>
                <EmptyState
                  title="Triage Queue Clear"
                  description="There are no urgent or high-priority complaints requiring immediate intervention at this time."
                />
              </Card>
            ) : (
              urgentComplaints.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                >
                  <Card
                    interactive={true}
                    glowOnHover={true}
                    onClick={() => onNavigate(`/admin/complaints/${item.id}`)}
                    style={{
                      padding: '1.35rem 1.5rem',
                      borderLeft: `5px solid ${item.priority === 'Urgent' ? '#DC2626' : '#D97706'}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
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
                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9)',
                          }}
                        >
                          {item.id}
                        </span>
                        <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </div>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.015em' }}>
                      {item.title}
                    </h4>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.775rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.65rem',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid rgba(241, 245, 249, 0.85)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <MapPin size={13} style={{ color: 'var(--pup-maroon)' }} />
                        <span>{item.location}</span>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: Department Operations Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <CardHeader
              title="Department Workloads"
              subtitle="Active maintenance routing across campus divisions"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/admin/analytics')}
                >
                  <BarChart3 size={17} />
                </Button>
              }
            />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {DEMO_DEPARTMENTS.slice(0, 5).map((dept) => {
                  const deptComplaints = complaints.filter(
                    (c) => c.assignedDepartment === dept.name
                  );
                  const active = deptComplaints.filter(
                    (c) => c.status !== 'Resolved' && c.status !== 'Closed'
                  ).length;

                  return (
                    <div
                      key={dept.id}
                      style={{
                        padding: '0.9rem 1.15rem',
                        background: 'var(--clay-inset-bg)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--clay-inset-shadow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {dept.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          Lead: {dept.leadOfficer}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: active > 0 ? '#B45309' : '#059669',
                            background: active > 0 ? '#FEF3C7' : '#ECFDF5',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)',
                          }}
                        >
                          {active} Active
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
