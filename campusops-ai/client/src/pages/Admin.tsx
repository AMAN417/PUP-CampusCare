import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  Zap,
  Eye,
  Radio,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Trash2,
  Download,
  CheckSquare,
  Square,
  ShieldCheck,
  Cpu,
  Server,
  ThumbsUp,
} from 'lucide-react'
import {
  fetchIncidents,
  fetchAdminStats,
  updateIncidentStatus,
  deleteIncidentApi,
  bulkUpdateIncidentStatus,
  approveIncidentRecommendation,
} from '../lib/api'
import type { Incident, AdminStatsResponse, IncidentPriority, IncidentStatus } from '../types'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { getCategoryIcon } from '../components/IncidentCard'
import { IncidentDetailModal } from '../components/IncidentDetailModal'
import { KpiSkeleton, TableRowSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

type SortField = 'createdAt' | 'priority' | 'status' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export const Admin: React.FC = () => {
  const { toast } = useToast()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkUpdating, setBulkUpdating] = useState(false)

  // Filters & Search
  const [priorityFilter, setPriorityFilter] = useState<'all' | IncidentPriority>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [incidentList, statsData] = await Promise.all([
        fetchIncidents(),
        fetchAdminStats().catch(() => null),
      ])
      setIncidents(incidentList)
      setStats(statsData)
      setLastRefreshed(new Date().toLocaleTimeString())
    } catch (err) {
      setError('Unable to load incidents. We couldn’t retrieve the latest operational data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: IncidentStatus) => {
    const updated = await updateIncidentStatus(id, newStatus)
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)))
    setSelectedIncident(updated)
    fetchAdminStats().then(setStats).catch(() => {})
  }

  const handleApproveQuick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const updated = await approveIncidentRecommendation(id)
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)))
      toast.success(`Approved recommendation for ${id}`)
      fetchAdminStats().then(setStats).catch(() => {})
    } catch {
      toast.error('Failed to approve recommendation')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteIncidentApi(id)
    setIncidents((prev) => prev.filter((i) => i.id !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    fetchAdminStats().then(setStats).catch(() => {})
  }

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredIncidents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredIncidents.map((i) => i.id))
    }
  }

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleBulkStatus = async (status: IncidentStatus) => {
    if (selectedIds.length === 0) return
    setBulkUpdating(true)
    try {
      const updatedList = await bulkUpdateIncidentStatus(selectedIds, status)
      setIncidents(updatedList)
      toast.success(`Updated ${selectedIds.length} incidents to ${status.replace('_', ' ')}`)
      setSelectedIds([])
      fetchAdminStats().then(setStats).catch(() => {})
    } catch {
      toast.error('Failed to perform bulk update')
    } finally {
      setBulkUpdating(false)
    }
  }

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Score', 'Department', 'Location', 'Status', 'Created']
    const rows = filteredIncidents.map((i) => [
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
    link.setAttribute('download', `campusops_incidents_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Incident fleet exported to CSV')
  }

  // Dynamic list of unique departments
  const dynamicDepartments = useMemo(() => {
    const set = new Set<string>()
    incidents.forEach((i) => {
      if (i.department) set.add(i.department)
    })
    return Array.from(set)
  }, [incidents])

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false
        if (statusFilter !== 'all' && inc.status !== statusFilter) return false
        if (departmentFilter !== 'all' && inc.department !== departmentFilter) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchesId = inc.id.toLowerCase().includes(q)
          const matchesTitle = inc.title.toLowerCase().includes(q)
          const matchesCategory = inc.category.toLowerCase().includes(q)
          const matchesLocation = inc.location.toLowerCase().includes(q)
          const matchesDept = inc.department.toLowerCase().includes(q)
          const matchesBuilding = (inc.building || '').toLowerCase().includes(q)
          return matchesId || matchesTitle || matchesCategory || matchesLocation || matchesDept || matchesBuilding
        }

        return true
      })
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          return sortOrder === 'desc' ? diff : -diff
        }
        if (sortField === 'updatedAt') {
          const diff = new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
          return sortOrder === 'desc' ? diff : -diff
        }
        if (sortField === 'priority') {
          const diff = b.priorityScore - a.priorityScore
          return sortOrder === 'desc' ? diff : -diff
        }
        if (sortField === 'status') {
          const diff = a.status.localeCompare(b.status)
          return sortOrder === 'desc' ? -diff : diff
        }
        return 0
      })
  }, [incidents, priorityFilter, statusFilter, departmentFilter, searchQuery, sortField, sortOrder])

  // High priority unresolved incidents for "Needs Attention" section
  const needsAttentionIncidents = useMemo(() => {
    const priorityWeight: Record<IncidentPriority, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    }
    return incidents
      .filter((i) => i.status !== 'resolved')
      .sort((a, b) => {
        const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
        if (weightDiff !== 0) return weightDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 3)
  }, [incidents])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const clearFilters = () => {
    setPriorityFilter('all')
    setStatusFilter('all')
    setDepartmentFilter('all')
    setSearchQuery('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* ─── 1. TOP CONTEXTUAL SUMMARY BANNER ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0B1020] via-[#07111F] to-[#05070D] border border-white/[0.08] p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-xs uppercase tracking-wider font-mono text-cyan-300 font-bold">
                Campus Operations Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {incidents.length} incidents are currently being monitored across campus.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1020] hover:bg-[#10172A] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Fleet CSV
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1020] hover:bg-[#10172A] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Global System Status Tags */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AI Engine: Operational
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Incident API: Healthy
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Notifications: Active
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-semibold text-xs transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#07111F] border border-white/[0.08] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">TOTAL INCIDENTS</span>
            <p className="text-2xl font-extrabold text-white font-mono">
              {stats?.total ?? incidents.length}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Campus Fleet</span>
          </div>

          <div className="bg-[#07111F] border border-rose-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.08)]">
            <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1.5">CRITICAL</span>
            <p className="text-2xl font-extrabold text-rose-400 font-mono">
              {stats?.critical ?? incidents.filter((i) => i.priority === 'critical').length}
            </p>
            <span className="text-[10px] text-rose-400/80 mt-1 block">SLA: &lt; 15 mins</span>
          </div>

          <div className="bg-[#07111F] border border-orange-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.08)]">
            <span className="text-[10px] font-mono uppercase text-orange-400 block mb-1.5">HIGH PRIORITY</span>
            <p className="text-2xl font-extrabold text-orange-400 font-mono">
              {stats?.high ?? incidents.filter((i) => i.priority === 'high').length}
            </p>
            <span className="text-[10px] text-orange-400/80 mt-1 block">SLA: &lt; 1 Hour</span>
          </div>

          <div className="bg-[#07111F] border border-cyan-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.08)]">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-1.5">IN PROGRESS</span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">
              {stats?.inProgress ?? incidents.filter((i) => i.status === 'in_progress').length}
            </p>
            <span className="text-[10px] text-cyan-400/80 mt-1 block">Active Dispatch</span>
          </div>

          <div className="bg-[#07111F] border border-emerald-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1.5">RESOLVED TODAY</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">
              {stats?.resolvedToday ?? incidents.filter((i) => i.status === 'resolved').length}
            </p>
            <span className="text-[10px] text-emerald-400/80 mt-1 block">Last 24 Hours</span>
          </div>

          <div className="bg-[#07111F] border border-amber-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.08)]">
            <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1.5">SLA AT RISK</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">
              {stats?.slaAtRisk ?? 0}
            </p>
            <span className="text-[10px] text-amber-400/80 mt-1 block">Past Deadline</span>
          </div>
        </div>
      )}

      {/* ─── 2. "NEEDS ATTENTION" ACTION QUEUE ─────────────────────────────────── */}
      <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Needs Attention · High-Priority Action Queue
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {needsAttentionIncidents.length > 0 ? 'Action Required' : 'All Clear'}
          </span>
        </div>

        {needsAttentionIncidents.length === 0 ? (
          <div className="p-8 text-center bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">All Clear</h4>
            <p className="text-xs text-slate-400">No critical incidents currently require urgent attention.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {needsAttentionIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-2xl border bg-[#05070D] hover:bg-[#07111F] cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                  inc.priority === 'critical'
                    ? 'border-l-4 border-l-rose-500 border-rose-500/20'
                    : 'border-l-4 border-l-orange-500 border-orange-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400">
                    {inc.id}
                  </span>
                  <PriorityBadge priority={inc.priority} score={inc.priorityScore} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{inc.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300">{inc.department}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIncident(inc)
                    }}
                    className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 text-[11px] font-semibold transition-colors"
                  >
                    Review Incident
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#07111F] p-4 rounded-2xl border border-white/[0.08]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Category, Building, Room, Department..."
            className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-[#05070D] p-1 rounded-xl border border-white/[0.06]">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                  priorityFilter === p
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Department Filter Dropdown */}
          {dynamicDepartments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#05070D] border border-white/[0.08] text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500/60"
            >
              <option value="all">All Departments</option>
              {dynamicDepartments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* Clear Filters button */}
          {(priorityFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-cyan-400 hover:underline px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ─── BULK ACTIONS BAR (When items selected) ──────────────────────────── */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>{selectedIds.length} incidents selected</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Bulk Update:</span>
            <button
              disabled={bulkUpdating}
              onClick={() => handleBulkStatus('in_progress')}
              className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors"
            >
              Mark In Progress
            </button>
            <button
              disabled={bulkUpdating}
              onClick={() => handleBulkStatus('resolved')}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              Deselect All
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── 3. INCIDENT WORKSPACE TABLE ─────────────────────────────────────── */}
      <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-mono"
            >
              {selectedIds.length === filteredIncidents.length && filteredIncidents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span className="hidden sm:inline">Select All</span>
            </button>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Operations Incident Table
            </h2>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Showing {filteredIncidents.length} of {incidents.length}
          </span>
        </div>

        {loading ? (
          <TableRowSkeleton count={5} />
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <LayoutDashboard className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">
              {incidents.length === 0 ? 'No incidents yet' : 'No matching incidents'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {incidents.length === 0
                ? 'CampusOps AI will automatically create incidents when campus issues are analyzed.'
                : 'Try adjusting your filters or search query.'}
            </p>
            {incidents.length > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#0B1020] hover:bg-[#10172A] border border-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05070D] border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-3 w-8">#</th>
                  <th className="py-3.5 px-4 font-semibold">Incident ID</th>
                  <th className="py-3.5 px-4 font-semibold">Incident</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th
                    onClick={() => toggleSort('priority')}
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      {sortField === 'priority' ? (
                        sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Department</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">AI Confidence</th>
                  <th
                    onClick={() => toggleSort('createdAt')}
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Created</span>
                      {sortField === 'createdAt' ? (
                        sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredIncidents.map((inc) => {
                  const formattedTime = new Date(inc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const isSelected = selectedIds.includes(inc.id)

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition-colors group ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedIncident(inc)
                        }
                      }}
                    >
                      <td className="py-3.5 px-3">
                        <button
                          onClick={(e) => handleToggleSelect(inc.id, e)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {inc.id}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white max-w-[200px] truncate group-hover:text-cyan-300 transition-colors">
                        {inc.title}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(inc.category)}
                          <span className="capitalize text-slate-300 font-medium">
                            {inc.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={inc.priority} score={inc.priorityScore} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium truncate max-w-[140px]">
                        {inc.department}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-[140px]">
                        {inc.building ? `${inc.building} · ` : ''}{inc.location}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300">
                        {inc.aiConfidence || 95}% Autonomous
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formattedTime}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIncident(inc)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          title="Review Incident"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  )
}
