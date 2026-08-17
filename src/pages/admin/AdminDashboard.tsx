import React from 'react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. ADMIN HERO HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid #334155',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FDE68A',
              marginBottom: '0.6rem',
            }}
          >
            <ShieldCheck size={13} />
            <span>Campus Estate & Maintenance Operations Central</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            Welcome, {user?.name || 'Administrator'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Punjabi University Patiala Central Facilities Management Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => exportCSV()}
            leftIcon={<Download size={16} />}
            style={{ color: '#FFFFFF', borderColor: '#475569', background: 'rgba(255,255,255,0.05)' }}
          >
            Export CSV Log
          </Button>
          <Button
            variant="gold"
            size="md"
            onClick={() => onNavigate('/admin/complaints')}
            rightIcon={<ArrowRight size={16} />}
          >
            Manage All ({total})
          </Button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          label="Total Complaints"
          value={total}
          icon={<FileText size={22} />}
          iconBg="var(--pup-navy-subtle)"
          iconColor="var(--pup-navy)"
          onClick={() => onNavigate('/admin/complaints')}
        />
        <StatCard
          label="New / Pending Triage"
          value={newPending}
          icon={<Clock size={22} />}
          iconBg="var(--status-review-bg)"
          iconColor="var(--status-review)"
          onClick={() => onNavigate('/admin/complaints?status=Submitted')}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={<Wrench size={22} />}
          iconBg="var(--status-progress-bg)"
          iconColor="#B45309"
          onClick={() => onNavigate('/admin/complaints?status=In Progress')}
        />
        <StatCard
          label="Resolved"
          value={resolved}
          icon={<CheckCircle2 size={22} />}
          iconBg="var(--status-resolved-bg)"
          iconColor="var(--status-resolved)"
          onClick={() => onNavigate('/admin/complaints?status=Resolved')}
        />
        <StatCard
          label="High / Urgent"
          value={highUrgent}
          icon={<Flame size={22} />}
          iconBg="var(--priority-urgent-bg)"
          iconColor="#DC2626"
          onClick={() => onNavigate('/admin/complaints?priority=Urgent')}
        />
        <StatCard
          label="Overdue (>48h)"
          value={overdue}
          icon={<AlertTriangle size={22} />}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />
      </div>

      {/* 3. URGENT TRIAGE QUEUE & DEPARTMENT GLANCE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Urgent Action Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={18} style={{ color: '#DC2626' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>High & Urgent Triage Queue</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/admin/complaints')}
              rightIcon={<ArrowRight size={14} />}
            >
              View Full Queue
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
              urgentComplaints.map((item) => (
                <Card
                  key={item.id}
                  interactive={true}
                  onClick={() => onNavigate(`/admin/complaints/${item.id}`)}
                  style={{
                    padding: '1.25rem',
                    borderLeft: `4px solid ${item.priority === 'Urgent' ? '#DC2626' : '#D97706'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
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
                        {item.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.category}
                      </span>
                    </div>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {item.title}
                  </h4>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={12} style={{ color: 'var(--pup-maroon)' }} />
                      <span>{item.location}</span>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Department Operations Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  <BarChart3 size={16} />
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
                        padding: '0.75rem',
                        background: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {dept.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Lead: {dept.leadOfficer}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: active > 0 ? '#D97706' : '#059669',
                            background: active > 0 ? '#FEF3C7' : '#ECFDF5',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
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
