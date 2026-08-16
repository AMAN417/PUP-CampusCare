import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { CATEGORY_METADATA, DEMO_DEPARTMENTS } from '../../data/mockData';
import { ComplaintCategory, ComplaintStatus } from '../../types';

interface AnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Care Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
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
          gap: '1.25rem',
        }}
      >
        <StatCard
          label="Total Logged Issues"
          value={total}
          icon={<Layers size={22} />}
          iconBg="var(--pup-maroon-subtle)"
          iconColor="var(--pup-maroon)"
        />
        <StatCard
          label="Resolution Success Rate"
          value={`${resolutionRate}%`}
          icon={<CheckCircle2 size={22} />}
          iconBg="#ECFDF5"
          iconColor="#059669"
        />
        <StatCard
          label="Avg Resolution Time"
          value="18.4 hrs"
          icon={<Clock size={22} />}
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <StatCard
          label="Active Campus Wings"
          value={DEMO_DEPARTMENTS.length}
          icon={<Shield size={22} />}
          iconBg="var(--pup-navy-subtle)"
          iconColor="var(--pup-navy)"
        />
      </div>

      {/* Main Grid: Category Breakdown + Status Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Category Distribution Bar Chart */}
        <Card style={{ padding: '1.75rem' }}>
          <CardHeader
            title="Complaints by Category"
            subtitle="Volume share across campus infrastructure divisions"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {categoryCounts.map((item) => (
              <div key={item.category}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: item.color,
                      }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    <strong>{item.count}</strong> tickets ({item.percent}%)
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(item.percent, 4)}%`,
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Complaints By Status Pipeline */}
        <Card style={{ padding: '1.75rem' }}>
          <CardHeader
            title="Complaints by Lifecycle Status"
            subtitle="Current distribution across processing phases"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1rem' }}>
            {statusCounts.map((item) => (
              <div
                key={item.status}
                style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.status}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.percent}% of active database
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
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
      <Card style={{ padding: '1.75rem' }}>
        <CardHeader
          title="Monthly Complaint Volume Trend"
          subtitle="Total issues reported vs resolved over past 6 months"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1.25rem',
            marginTop: '2rem',
            alignItems: 'flex-end',
            minHeight: '200px',
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
                  gap: '0.5rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                  {/* Total Bar */}
                  <div
                    style={{
                      width: '24px',
                      height: `${Math.max(heightPercent, 10)}%`,
                      background: 'var(--pup-maroon)',
                      borderRadius: '4px 4px 0 0',
                      title: `${t.count} Total`,
                    }}
                  />
                  {/* Resolved Bar */}
                  <div
                    style={{
                      width: '24px',
                      height: `${Math.max(resolvedPercent, 10)}%`,
                      background: '#059669',
                      borderRadius: '4px 4px 0 0',
                      title: `${t.resolved} Resolved`,
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t.month}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {t.count} / {t.resolved}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--pup-maroon)', borderRadius: '2px' }} />
            <span>Reported Complaints</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '2px' }} />
            <span>Successfully Resolved</span>
          </div>
        </div>
      </Card>

      {/* Department SLA & Performance Table */}
      <Card style={{ padding: '1.75rem' }}>
        <CardHeader
          title="Department SLA Compliance Performance"
          subtitle="Resolution adherence rate by maintenance division"
        />
        <div className="custom-table-container" style={{ marginTop: '1rem' }}>
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
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {dept.code}</div>
                  </td>
                  <td>{dept.lead}</td>
                  <td>{dept.total} items</td>
                  <td>{dept.resolved} items</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '6px',
                          background: 'var(--bg-main)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${dept.compliance}%`,
                            height: '100%',
                            background: dept.compliance >= 90 ? '#059669' : '#D97706',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: dept.compliance >= 90 ? '#059669' : '#D97706' }}>
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
