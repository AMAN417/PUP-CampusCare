import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  PlusCircle,
  Radio,
  Shield,
  ShieldAlert,
  Timer,
  TrendingUp,
  Zap,
  Activity,
  Layers,
} from 'lucide-react'
import { AutonomousWorkflowDemo } from '../components/AutonomousWorkflowDemo'
import type { Incident, AdminStatsResponse } from '../types'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'

interface LandingProps {
  onNavigate: (tab: any, prompt?: string) => void
  incidents?: Incident[]
  stats?: AdminStatsResponse | null
}

const QUICK_SCENARIOS = [
  {
    title: 'Critical Electrical Wire Sparking',
    category: 'Electrical Hazard',
    prompt: 'The electrical wire near the Block B second floor washroom is exposed and sparking. Students are using this corridor.',
    urgency: 'critical' as const,
    dept: 'Electrical Maintenance',
    score: 95,
  },
  {
    title: 'Water Main Rupture in Hostel',
    category: 'Plumbing Emergency',
    prompt: 'Major water pipeline rupture in Girls Hostel Block 3 ground floor corridor causing flooding near the lift lobby.',
    urgency: 'high' as const,
    dept: 'Facilities & Plumbing',
    score: 82,
  },
  {
    title: 'Lab AC Failure During Examination',
    category: 'HVAC Maintenance',
    prompt: 'Central AC unit in Computer Lab 402 Science Block has stopped working and is making a loud buzzing noise during mid-semester exams.',
    urgency: 'medium' as const,
    dept: 'HVAC & Maintenance',
    score: 58,
  },
  {
    title: 'WiFi Access Point Down in Library',
    category: 'IT Infrastructure',
    prompt: 'The WiFi access point on the 3rd floor Central Library reading hall is completely dead with no signal for 2 hours.',
    urgency: 'medium' as const,
    dept: 'IT Support & Telecom',
    score: 60,
  },
]

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const Landing: React.FC<LandingProps> = ({ onNavigate, incidents = [], stats }) => {
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  // Derive real-time metrics from live data
  const totalIncidents = stats?.total ?? incidents.length
  const criticalCount = stats?.critical ?? incidents.filter(i => i.priority === 'critical').length
  const activeCount = stats?.inProgress ?? incidents.filter(i => i.status === 'in_progress').length
  const resolvedToday = stats?.resolvedToday ?? incidents.filter(i => i.status === 'resolved' && i.resolvedAt && Date.now() - new Date(i.resolvedAt).getTime() < 86400000).length
  const slaAtRisk = stats?.slaAtRisk ?? 0
  const pendingVerification = incidents.filter(i => i.status === 'resolved' && !i.verifiedByAi).length

  // Top 3 unresolved incidents for "Needs Attention"
  const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
  const needsAttention = [...incidents]
    .filter(i => !['resolved', 'rejected'].includes(i.status))
    .sort((a, b) => {
      const w = (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0)
      return w !== 0 ? w : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, 3)

  // Recent AI-processed incidents
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* ─── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="section-label text-emerald-400">Live Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campus Operations</h1>
          <p className="text-sm text-slate-400 max-w-md">
            {totalIncidents > 0
              ? `${totalIncidents} incident${totalIncidents !== 1 ? 's' : ''} monitored across campus. ${criticalCount > 0 ? `${criticalCount} critical.` : 'No critical incidents.'}`
              : 'No incidents currently. Campus systems are clear.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDemoOpen(true)}
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Demo Scenario
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Incident
          </button>
        </div>
      </div>

      {/* ─── Operational KPI Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Total Active',
            value: totalIncidents,
            sub: 'All incidents',
            color: 'text-white',
            border: 'border-white/[0.08]',
            icon: <Layers className="w-4 h-4 text-slate-400" />,
          },
          {
            label: 'Critical',
            value: criticalCount,
            sub: 'SLA: 15 min',
            color: 'text-rose-400',
            border: criticalCount > 0 ? 'border-rose-500/30' : 'border-white/[0.08]',
            icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          },
          {
            label: 'In Progress',
            value: activeCount,
            sub: 'Technicians on-site',
            color: 'text-cyan-400',
            border: 'border-white/[0.08]',
            icon: <Activity className="w-4 h-4 text-cyan-400" />,
          },
          {
            label: 'Pending Verify',
            value: pendingVerification,
            sub: 'Awaiting AI check',
            color: 'text-amber-400',
            border: pendingVerification > 0 ? 'border-amber-500/30' : 'border-white/[0.08]',
            icon: <Shield className="w-4 h-4 text-amber-400" />,
          },
          {
            label: 'Resolved Today',
            value: resolvedToday,
            sub: 'Last 24 hours',
            color: 'text-emerald-400',
            border: 'border-white/[0.08]',
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          },
          {
            label: 'SLA At Risk',
            value: slaAtRisk,
            sub: 'Past deadline',
            color: slaAtRisk > 0 ? 'text-orange-400' : 'text-slate-400',
            border: slaAtRisk > 0 ? 'border-orange-500/30' : 'border-white/[0.08]',
            icon: <Timer className="w-4 h-4 text-orange-400" />,
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`card p-4 space-y-2 ${kpi.border}`}>
            <div className="flex items-center justify-between">
              <span className="section-label">{kpi.label}</span>
              {kpi.icon}
            </div>
            <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
            <span className="text-[10px] text-slate-500 block">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ─── Main Content Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column — Needs Attention + Recent Activity */}
        <div className="lg:col-span-8 space-y-6">

          {/* Needs Attention */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {needsAttention.some(i => i.priority === 'critical') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
                <h2 className="section-title">Needs Attention</h2>
              </div>
              <button
                onClick={() => onNavigate('admin')}
                className="btn-ghost flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {needsAttention.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-sm font-medium text-white">All clear</p>
                <p className="text-xs text-slate-500">No incidents currently require urgent attention.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {needsAttention.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => onNavigate('admin')}
                    className={`flex items-start justify-between gap-4 p-4 rounded-lg bg-[#06080F] border cursor-pointer hover:bg-[#0A1222] transition-colors duration-150 ${
                      inc.priority === 'critical' ? 'border-l-2 border-l-rose-500 border-white/[0.06]' : 'border-l-2 border-l-orange-500 border-white/[0.06]'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{inc.id}</span>
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                      <p className="text-sm font-medium text-white truncate">{inc.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{inc.location}</span>
                        <span>·</span>
                        <span className="text-cyan-400">{inc.department}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <PriorityBadge priority={inc.priority} score={inc.priorityScore} size="sm" />
                      <p className="text-[10px] text-slate-500">{formatRelativeTime(inc.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Incident Activity */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Recent Activity</h2>
              <button
                onClick={() => onNavigate('admin')}
                className="btn-ghost flex items-center gap-1"
              >
                Full log <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="py-6 text-center">
                <Radio className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No incidents yet. Submit the first report.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentIncidents.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className={`w-1 h-8 rounded-full shrink-0 ${
                      inc.priority === 'critical' ? 'bg-rose-500' :
                      inc.priority === 'high' ? 'bg-orange-500' :
                      inc.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{inc.title}</p>
                      <p className="text-[11px] text-slate-500">{inc.location} · {inc.department}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={inc.status} size="sm" />
                      <p className="text-[10px] text-slate-600 mt-1">{formatRelativeTime(inc.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — System status + Quick scenarios */}
        <div className="lg:col-span-4 space-y-6">

          {/* AI Operations Status */}
          <div className="card p-5 space-y-4">
            <h2 className="section-title flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              AI Agent Status
            </h2>
            <div className="space-y-2.5">
              {[
                { label: 'Gemini 3.6 Flash', status: 'Operational', ok: true },
                { label: 'Intake Pipeline', status: 'Active', ok: true },
                { label: 'Risk Scoring Engine', status: 'Active', ok: true },
                { label: 'Verification Agent', status: 'Active', ok: true },
                { label: 'Notification Service', status: 'Active', ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className={`text-[11px] font-medium ${item.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => onNavigate('intelligence')}
                className="btn-ghost w-full justify-center text-xs"
              >
                Intelligence Mesh <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Quick Test Scenarios */}
          <div className="card p-5 space-y-4">
            <div>
              <h2 className="section-title">Quick Test Scenarios</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Click to run through the AI intake pipeline</p>
            </div>
            <div className="space-y-2">
              {QUICK_SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('report', sc.prompt)}
                  className="w-full text-left p-3 rounded-lg bg-[#06080F] hover:bg-[#0A1222] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white group-hover:text-cyan-300 transition-colors truncate pr-2">
                      {sc.title}
                    </span>
                    <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border ${
                      sc.urgency === 'critical' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                      sc.urgency === 'high' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                      'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}>
                      {sc.urgency === 'critical' ? 'Critical' : sc.urgency === 'high' ? 'High' : 'Med'} · {sc.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{sc.dept}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div className="card p-4 space-y-2">
            <p className="section-label mb-3">Quick Navigation</p>
            {[
              { label: 'Operations Command', tab: 'admin' as const, icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { label: 'Triage Queue', tab: 'workorders' as const, icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'Intelligence Mesh', tab: 'intelligence' as const, icon: <Bot className="w-3.5 h-3.5" /> },
              { label: 'Analytics', tab: 'analytics' as const, icon: <Activity className="w-3.5 h-3.5" /> },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group text-left"
              >
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Autonomous Workflow Demo Modal */}
      <AutonomousWorkflowDemo
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onCompleteIncident={() => onNavigate('admin')}
      />
    </div>
  )
}
