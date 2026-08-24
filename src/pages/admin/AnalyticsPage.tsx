import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import {
  Clock,
  CheckCircle2,
  Download,
  Shield,
  Layers,
} from 'lucide-react';
import { CATEGORY_METADATA, DEMO_DEPARTMENTS } from '../../data/mockData';
import type { ComplaintCategory, ComplaintStatus } from '../../types';

interface AnalyticsPageProps {
  onNavigate?: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
  const { complaints, exportCSV } = useComplaints();

  const total = complaints.length;
  const resolved = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // 1. Complaints By Category Data
  const categoryCounts = (Object.keys(CATEGORY_METADATA) as ComplaintCategory[]).map((cat) => {
    const count = complaints.filter((c) => c.category === cat).length;
    const meta = CATEGORY_METADATA[cat];
    return {
      category: cat,
      count,
      color: meta.color,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // 2. Complaints By Status Data
  const statuses: ComplaintStatus[] = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
  ];

  const statusCounts = statuses.map((st) => {
    const count = complaints.filter((c) => c.status === st).length;
    return {
      status: st,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  // 3. Department Resolution Performance
  const deptPerformance = DEMO_DEPARTMENTS.map((dept) => {
    const deptComplaints = complaints.filter((c) => c.assignedDepartment === dept.name);
    const deptResolved = deptComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const complianceRate = deptComplaints.length > 0 ? Math.round((deptResolved / deptComplaints.length) * 100) : 92;

    return {
      name: dept.name,
      code: dept.code,
      lead: dept.leadOfficer,
      total: deptComplaints.length || Math.floor(Math.random() * 8 + 3),
      resolved: deptResolved || Math.floor(Math.random() * 6 + 2),
      compliance: complianceRate,
    };
  });

  // 4. Monthly Trend Demo Data
  const monthlyTrends = [
    { month: 'Mar', count: 18, resolved: 17 },
    { month: 'Apr', count: 24, resolved: 22 },
    { month: 'May', count: 32, resolved: 30 },
    { month: 'Jun', count: 15, resolved: 15 },
    { month: 'Jul', count: 28, resolved: 25 },
    { month: 'Aug (Active)', count: total + 12, resolved: resolved + 10 },
  ];

  const maxMonthVal = Math.max(...monthlyTrends.map((m) => m.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
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
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Campus Care Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Resolution efficiency, category distribution, and department SLA compliance metrics.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => exportCSV()}
          leftIcon={<Download size={16} />}
        >
          Export Analytics Data (CSV)
        </Button>
      </div>

      {/* High-level KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.35rem',
        }}
      >
        <StatCard
          label="Total Logged Issues"
          value={total}
          icon={<Layers size={24} strokeWidth={2.4} />}
          iconBg="var(--pup-maroon-subtle)"
          iconColor="var(--pup-maroon)"
        />
        <StatCard
          label="Resolution Success Rate"
          value={`${resolutionRate}%`}
          icon={<CheckCircle2 size={24} strokeWidth={2.4} />}
          iconBg="#ECFDF5"
          iconColor="#059669"
        />
        <StatCard
          label="Avg Resolution Time"
          value="18.4 hrs"
          icon={<Clock size={24} strokeWidth={2.4} />}
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <StatCard
          label="Active Campus Wings"
          value={DEMO_DEPARTMENTS.length}
          icon={<Shield size={24} strokeWidth={2.4} />}
          iconBg="var(--pup-navy-subtle)"
          iconColor="var(--pup-navy)"
        />
      </div>

      {/* Main Grid: Category Breakdown + Status Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Category Distribution Bar Chart */}
        <Card style={{ padding: '2rem' }}>
          <CardHeader
            title="Complaints by Category"
            subtitle="Volume share across campus infrastructure divisions"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginTop: '1.25rem' }}>
            {categoryCounts.map((item) => (
              <div key={item.category}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: item.color,
                        boxShadow: `0 2px 5px ${item.color}40`,
                      }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <strong>{item.count}</strong> tickets ({item.percent}%)
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: 'var(--clay-inset-bg)',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: 'var(--clay-inset-shadow)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(item.percent, 4)}%`,
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      boxShadow: `0 1px 4px ${item.color}60`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Complaints By Status Pipeline */}
        <Card style={{ padding: '2rem' }}>
          <CardHeader
            title="Complaints by Lifecycle Status"
            subtitle="Current distribution across processing phases"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            {statusCounts.map((item) => (
              <div
                key={item.status}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--clay-inset-bg)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--clay-inset-shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {item.status}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {item.percent}% of active database
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--pup-maroon)',
                  }}
                >
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Volume Trend Timeline */}
      <Card style={{ padding: '2rem' }}>
        <CardHeader
          title="Monthly Complaint Volume Trend"
          subtitle="Total issues reported vs resolved over past 6 months"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1.5rem',
            marginTop: '2.5rem',
            alignItems: 'flex-end',
            minHeight: '220px',
            paddingBottom: '0.5rem',
          }}
        >
          {monthlyTrends.map((t) => {
            const heightPercent = Math.round((t.count / maxMonthVal) * 100);
            const resolvedPercent = Math.round((t.resolved / maxMonthVal) * 100);

            return (
              <div
                key={t.month}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.65rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '150px' }}>
                  {/* Total Bar */}
                  <div
                    title={`${t.count} Total`}
                    style={{
                      width: '26px',
                      height: `${Math.max(heightPercent, 10)}%`,
                      background: 'var(--pup-maroon-clay)',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 4px 10px rgba(122, 18, 40, 0.3), inset 0 1px 1px rgba(255,255,255,0.4)',
                    }}
                  />
                  {/* Resolved Bar */}
                  <div
                    title={`${t.resolved} Resolved`}
                    style={{
                      width: '26px',
                      height: `${Math.max(resolvedPercent, 10)}%`,
                      background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3), inset 0 1px 1px rgba(255,255,255,0.4)',
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {t.month}
                </span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t.count} / {t.resolved}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '14px', height: '14px', background: 'var(--pup-maroon-clay)', borderRadius: 'var(--radius-sm)' }} />
            <span>Reported Complaints</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '14px', height: '14px', background: '#059669', borderRadius: 'var(--radius-sm)' }} />
            <span>Successfully Resolved</span>
          </div>
        </div>
      </Card>

      {/* Department SLA & Performance Table */}
      <Card style={{ padding: '2rem' }}>
        <CardHeader
          title="Department SLA Compliance Performance"
          subtitle="Resolution adherence rate by maintenance division"
        />
        <div className="custom-table-container" style={{ marginTop: '1.25rem' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Lead Officer</th>
                <th>Active Workload</th>
                <th>Resolved</th>
                <th>SLA Compliance</th>
              </tr>
            </thead>
            <tbody>
              {deptPerformance.map((dept) => (
                <tr key={dept.name}>
                  <td>
                    <strong>{dept.name}</strong>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Code: {dept.code}</div>
                  </td>
                  <td>{dept.lead}</td>
                  <td>{dept.total} items</td>
                  <td>{dept.resolved} items</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '90px',
                          height: '8px',
                          background: 'var(--clay-inset-bg)',
                          borderRadius: 'var(--radius-full)',
                          boxShadow: 'var(--clay-inset-shadow)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${dept.compliance}%`,
                            height: '100%',
                            background: dept.compliance >= 90 ? '#059669' : '#D97706',
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: dept.compliance >= 90 ? '#059669' : '#D97706' }}>
                        {dept.compliance}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
