import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Layers,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckSquare,
  Square,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wrench,
  FileText,
  FileCheck,
  UserCheck,
} from 'lucide-react'
import type { Incident, IncidentPriority, IncidentStatus, WorkOrder, WorkOrderStatus } from '../types'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { getCategoryIcon } from './IncidentCard'
import { useToast } from './Toast'
import { ConfirmDialog } from './ConfirmDialog'
import { bulkUpdateIncidentStatus } from '../lib/api'

interface TriageCommandCenterProps {
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
  onRefreshData: () => void
}

export const TriageCommandCenter: React.FC<TriageCommandCenterProps> = ({
  incidents,
  onSelectIncident,
  onRefreshData,
}) => {
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState<'triage' | 'workorders'>('triage')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)
  const [pendingBulkStatus, setPendingBulkStatus] = useState<IncidentStatus | null>(null)
  const [bulkUpdating, setBulkUpdating] = useState(false)

  // Filters & Search
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterSla, setFilterSla] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Synthetic Work Orders generated from incidents
  const workOrders: WorkOrder[] = useMemo(() => {
    return incidents.map((inc, idx) => {
      const isCompleted = inc.status === 'resolved'
      const isInProgress = inc.status === 'in_progress'
      const isVerified = Boolean(inc.verifiedByAi)

      const woStatus: WorkOrderStatus = isVerified
        ? 'verified'
        : isCompleted
        ? 'completed'
        : isInProgress
        ? 'in_progress'
        : inc.status === 'assigned'
        ? 'assigned'
        : 'created'

      const minutesAgo = (idx + 1) * 22
      const createdDate = new Date(Date.now() - minutesAgo * 60000).toISOString()
      const deadlineDate = new Date(Date.now() + (60 - minutesAgo) * 60000).toISOString()

      return {
        id: `WO-${inc.id.replace('INC-', '').substring(0, 4) || (1040 + idx)}`,
        incidentId: inc.id,
        title: `Work Order: ${inc.title}`,
        assignedTeam: inc.department,
        priority: inc.priority,
        riskScore: inc.priorityScore,
        slaDeadline: deadlineDate,
        status: woStatus,
        location: `${inc.building || 'Campus Central'} · ${inc.location}`,
        resolutionNotes: inc.resolutionNote || (isCompleted ? 'Repairs completed and validated on-site.' : undefined),
        createdAt: createdDate,
        completedAt: inc.resolvedAt,
        verifiedAt: isVerified ? inc.resolvedAt : undefined,
        verificationResult: isVerified ? 'PASS' : undefined,
      }
    })
  }, [incidents])

  // SLA Calculation Helper based on createdAt and priority policy
  const SLA_LIMITS_MINUTES: Record<IncidentPriority, number> = {
    critical: 15,
    high: 60,
    medium: 240,
    low: 1440,
  }

  const getSlaStatus = (priority: IncidentPriority, status: IncidentStatus, createdAt?: string) => {
    if (status === 'resolved') {
      return { label: 'SLA Met · Resolved', variant: 'success', remaining: 'Completed' }
    }
    if (status === 'rejected') {
      return { label: 'Closed / Rejected', variant: 'neutral', remaining: 'Archived' }
    }

    if (!createdAt) {
      return { label: 'Under Review', variant: 'neutral', remaining: 'Pending' }
    }

    const createdTime = new Date(createdAt).getTime()
    const limitMinutes = SLA_LIMITS_MINUTES[priority] || 240
    const deadline = createdTime + limitMinutes * 60_000
    const diffMs = deadline - Date.now()
    const diffMinutes = Math.round(diffMs / 60_000)

    if (diffMinutes < 0) {
      const overdueMins = Math.abs(diffMinutes)
      const overdueStr = overdueMins >= 60 ? `${Math.floor(overdueMins / 60)}h ${overdueMins % 60}m` : `${overdueMins}m`
      return { label: `Breached by ${overdueStr}`, variant: 'danger', remaining: 'SLA Overdue' }
    }

    if (diffMinutes <= 15) {
      return { label: `${diffMinutes}m remaining`, variant: 'danger', remaining: 'At Immediate Risk' }
    }

    if (diffMinutes <= 60) {
      return { label: `${diffMinutes}m remaining`, variant: 'warning', remaining: 'Expiring Soon' }
    }

    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    return { label: `${hours}h ${mins}m remaining`, variant: 'neutral', remaining: 'Within Target SLA' }
  }

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return incidents.filter((inc) => {
      if (filterPriority !== 'all' && inc.priority !== filterPriority) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = inc.title.toLowerCase().includes(q)
        const matchId = inc.id.toLowerCase().includes(q)
        const matchDept = inc.department.toLowerCase().includes(q)
        const matchLoc = inc.location.toLowerCase().includes(q)
        return matchTitle || matchId || matchDept || matchLoc
      }
      return true
    }).sort((a, b) => {
      // Sort Critical (95+) to top
      return b.priorityScore - a.priorityScore
    })
  }, [incidents, filterPriority, searchQuery])

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredQueue.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredQueue.map((i) => i.id))
    }
  }

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const triggerBulkConfirm = (status: IncidentStatus) => {
    setPendingBulkStatus(status)
    setConfirmBulkOpen(true)
  }

  const handleExecuteBulk = async () => {
    if (!pendingBulkStatus || selectedIds.length === 0) return
    setBulkUpdating(true)
    try {
      await bulkUpdateIncidentStatus(selectedIds, pendingBulkStatus)
      toast.success(`Updated ${selectedIds.length} items to ${pendingBulkStatus}`)
      setSelectedIds([])
      setConfirmBulkOpen(false)
      onRefreshData()
    } catch {
      toast.error('Bulk update failed')
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'RiskScore', 'Department', 'Location', 'Status', 'CreatedAt']
    const rows = filteredQueue.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.priority,
      i.priorityScore,
      `"${i.department}"`,
      `"${i.location}"`,
      i.status,
      i.createdAt,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `campusops_fleet_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Operations Fleet exported to CSV')
  }

  return (
    <div className="space-y-6 text-left">
      {/* Pillar Header */}
      <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Operations Command Pillar
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Priority Triage Queue & Work Orders
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#05070D] hover:bg-[#0B1020] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Fleet CSV
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setActiveSubTab('triage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'triage'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Priority Triage Queue ({incidents.length})
          </button>

          <button
            onClick={() => setActiveSubTab('workorders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'workorders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Resolution Work Orders ({workOrders.length})
          </button>
        </div>
      </div>

      {/* ── SUB TAB 1: PRIORITY TRIAGE QUEUE ───────────────────────────────── */}
      {activeSubTab === 'triage' && (
        <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search urgency queue by ID, department, building..."
                className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#05070D] p-1 rounded-xl border border-white/[0.06]">
              {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    filterPriority === p
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <span className="font-mono text-cyan-300 font-bold">
                {selectedIds.length} items selected for bulk operation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerBulkConfirm('in_progress')}
                  className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 rounded-xl font-semibold"
                >
                  Set In Progress
                </button>
                <button
                  onClick={() => triggerBulkConfirm('resolved')}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 rounded-xl font-semibold"
                >
                  Set Resolved
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-white px-2"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}

          {/* Table of Queue */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05070D] border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedIds.length === filteredQueue.length && filteredQueue.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 font-semibold">Priority & Risk</th>
                  <th className="py-3 px-4 font-semibold">Incident</th>
                  <th className="py-3 px-4 font-semibold">SLA Status</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">State</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredQueue.map((inc) => {
                  const sla = getSlaStatus(inc.priority, inc.status, inc.createdAt)
                  const isSelected = selectedIds.includes(inc.id)

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <button
                          onClick={(e) => handleToggleSelect(inc.id, e)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={inc.priority} score={inc.priorityScore} size="sm" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-cyan-400">{inc.id}</span>
                          <p className="font-semibold text-white truncate max-w-[220px]">{inc.title}</p>
                          <span className="text-[10px] text-slate-500 block">{inc.building || 'Campus'} · {inc.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono">
                          <span
                            className={`text-xs font-bold block ${
                              sla.variant === 'danger'
                                ? 'text-rose-400'
                                : sla.variant === 'warning'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {sla.label}
                          </span>
                          <span className="text-[10px] text-slate-500">{sla.remaining}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {inc.department}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectIncident(inc)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Review & Triage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB TAB 2: RESOLUTION WORK ORDERS ───────────────────────────────── */}
      {activeSubTab === 'workorders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workOrders.map((wo) => (
            <div
              key={wo.id}
              className="bg-[#07111F] border border-white/[0.08] p-5 rounded-2xl space-y-3.5 text-xs shadow-lg text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                    {wo.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Parent: {wo.incidentId}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                    wo.status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : wo.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {wo.status}
                </span>
              </div>

              <h4 className="font-bold text-white text-sm">{wo.title}</h4>
              <p className="text-slate-400 text-xs">{wo.location}</p>

              {wo.resolutionNotes && (
                <div className="p-2.5 bg-[#05070D] rounded-xl border border-white/[0.04] text-[11px] text-slate-300 font-sans italic">
                  "{wo.resolutionNotes}"
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Team: <strong className="text-cyan-300">{wo.assignedTeam}</strong></span>
                {wo.verificationResult && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AI Verification: {wo.verificationResult}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Bulk Operations */}
      <ConfirmDialog
        isOpen={confirmBulkOpen}
        title="Confirm Bulk Status Update?"
        message={`Update status for ${selectedIds.length} selected items to "${pendingBulkStatus}"?`}
        confirmLabel="Confirm Update"
        isProcessing={bulkUpdating}
        onConfirm={handleExecuteBulk}
        onCancel={() => setConfirmBulkOpen(false)}
      />
    </div>
  )
}
