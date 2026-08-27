import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Building,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  Layers,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Check,
  Zap,
  ThumbsUp,
  History,
  FileCheck,
  Loader2,
  AlertCircle,
  Activity,
  Link2,
  RotateCcw,
} from 'lucide-react'
import type { Incident, IncidentStatus } from '../types'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { getCategoryIcon } from './IncidentCard'
import { AgentTimeline } from './AgentTimeline'
import { ConfirmDialog } from './ConfirmDialog'
import { ResolveModal } from './ResolveModal'
import { AutonomousWorkflowDemo } from './AutonomousWorkflowDemo'
import { useToast } from './Toast'
import { verifyIncidentResolution, resolveIncident, approveIncidentRecommendation } from '../lib/api'

interface IncidentDetailModalProps {
  incident: Incident | null
  allIncidents?: Incident[]
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, newStatus: IncidentStatus) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  allIncidents = [],
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}) => {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [approving, setApproving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [workflowDemoOpen, setWorkflowDemoOpen] = useState(false)

  // Interactive Live AI Analysis Demo State
  const [isAnalyzingDemo, setIsAnalyzingDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !confirmDeleteOpen && !resolveModalOpen && !workflowDemoOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, confirmDeleteOpen, resolveModalOpen, workflowDemoOpen, onClose])

  if (!isOpen || !incident) return null

  // Related Incidents Correlation
  const relatedIncidents = allIncidents.filter(
    (other) => other.id !== incident.id && (other.building === incident.building || other.department === incident.department)
  )

  const handleRunAiDemo = () => {
    setIsAnalyzingDemo(true)
    setDemoStep(1)

    const timers = [
      setTimeout(() => setDemoStep(2), 600),
      setTimeout(() => setDemoStep(3), 1200),
      setTimeout(() => setDemoStep(4), 1800),
      setTimeout(() => setDemoStep(5), 2400),
      setTimeout(() => setDemoStep(6), 3000),
      setTimeout(() => {
        setIsAnalyzingDemo(false)
        toast.success('AI Multi-Tool Re-Analysis Completed')
      }, 3600),
    ]

    return () => timers.forEach(clearTimeout)
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await approveIncidentRecommendation(incident.id, 'Campus Operations Admin')
      await onStatusChange(incident.id, 'in_progress')
      toast.success('Autonomous Recommendation Approved & Dispatched')
    } catch {
      toast.error('Failed to approve recommendation')
    } finally {
      setApproving(false)
    }
  }

  const handleConfirmResolve = async (note: string) => {
    setUpdating(true)
    try {
      await resolveIncident(incident.id, note)
      await onStatusChange(incident.id, 'resolved')
      setResolveModalOpen(false)
      toast.success('Incident marked as Resolved with work order note')
    } catch {
      toast.error('Failed to resolve incident')
    } finally {
      setUpdating(false)
    }
  }

  const handleVerifyResolution = async () => {
    setVerifying(true)
    try {
      await verifyIncidentResolution(incident.id)
      await onStatusChange(incident.id, 'resolved')
      toast.success('AI Resolution Verification Completed: PASS')
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete(incident.id)
      toast.success(`Incident ${incident.id} deleted`)
      setConfirmDeleteOpen(false)
      onClose()
    } catch {
      toast.error('Failed to delete incident')
    } finally {
      setDeleting(false)
    }
  }

  const copyId = () => {
    navigator.clipboard.writeText(incident.id)
    toast.success('Incident ID copied to clipboard')
  }

  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const slaTarget = {
    critical: 'Immediate Action (< 15 mins)',
    high: 'Response SLA: Within 1 Hour',
    medium: 'Response SLA: Within 4 Hours',
    low: 'Routine Maintenance SLA (< 24 Hours)',
  }[incident.priority]

  const confidenceScore = incident.aiConfidence || 95
  const riskScore = incident.priorityScore || 85

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#07111F] border border-white/[0.1] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative my-8 text-left"
        >
          {/* Header Bar */}
          <div className="p-6 border-b border-white/[0.06] flex items-start justify-between gap-4 bg-[#05070D]/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                    {incident.id.toUpperCase().startsWith('INC-') ? incident.id.toUpperCase() : `INC-${incident.id.toUpperCase()}`}
                  </span>
                  <button
                    onClick={copyId}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    title="Copy ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <StatusBadge status={incident.status} />
                <PriorityBadge priority={incident.priority} score={incident.priorityScore} />
                {incident.verifiedByAi && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    AI Verified PASS
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                {incident.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkflowDemoOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run Autonomous Demo</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive AI Re-Analysis Runner */}
          {isAnalyzingDemo && (
            <div className="bg-cyan-950/30 border-b border-cyan-500/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Agent Step {demoStep} of 6 in Progress
                </span>
                <span>Gemini 3.6 Flash Multi-Tool Engine</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 text-[10px] font-mono">
                <span className={`p-1.5 rounded text-center border ${demoStep >= 1 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>1. Ingest</span>
                <span className={`p-1.5 rounded text-center border ${demoStep >= 2 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>2. Classify</span>
                <span className={`p-1.5 rounded text-center border ${demoStep >= 3 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>3. Severity</span>
                <span className={`p-1.5 rounded text-center border ${demoStep >= 4 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>4. Routing</span>
                <span className={`p-1.5 rounded text-center border ${demoStep >= 5 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>5. Action</span>
                <span className={`p-1.5 rounded text-center border ${demoStep >= 6 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-[#05070D] text-slate-600 border-white/[0.04]'}`}>6. Verify</span>
              </div>
            </div>
          )}

          {/* 2-Column Main Body on Desktop */}
          <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* Original Description */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Original Complaint Statement
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans italic bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                    "{incident.description || incident.title}"
                  </p>
                </div>

                {/* AI Executive Summary & Recommended Action */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Executive Diagnostics & Recommended Action
                    </span>
                    <button
                      onClick={handleRunAiDemo}
                      disabled={isAnalyzingDemo}
                      className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      {isAnalyzingDemo ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-white/[0.02] p-3 rounded-xl border border-white/[0.03] space-y-2">
                    <p>{incident.aiSummary || 'Automated classification parsed incident coordinates and priority rating.'}</p>
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-xs">
                      <strong className="text-white block font-mono text-[10px] uppercase">Recommended Action:</strong>
                      {incident.aiRecommendation || `Assign ${incident.department} immediately, isolate affected zone if safe to do so, and complete physical inspection.`}
                    </div>
                  </div>
                </div>

                {/* Incident Correlation */}
                {relatedIncidents.length > 0 && (
                  <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      Incident Correlation Detected
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Nearby active incident in the same facility zone:
                    </p>
                    <div className="space-y-1.5">
                      {relatedIncidents.slice(0, 2).map((rel) => (
                        <div key={rel.id} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.03] flex items-center justify-between text-xs">
                          <div className="space-y-0.5 truncate max-w-[240px]">
                            <span className="font-mono text-[10px] text-cyan-300 font-bold">{rel.id}</span>
                            <span className="text-white block truncate">{rel.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{rel.building}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-5">
                {/* AI Confidence vs Risk Score (Clear Distinction + Contributing Factors) */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    AI Evaluation Metrics (Confidence vs. Risk)
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Model Confidence</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">{confidenceScore}%</span>
                      <span className="text-[9px] text-slate-500 block">Classification accuracy</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Hazard Risk</span>
                      <span className="text-sm font-mono font-bold text-rose-400">{riskScore}/100</span>
                      <span className="text-[9px] text-slate-500 block">Calibrated urgency</span>
                    </div>
                  </div>

                  {/* 4-Factor Risk Breakdown */}
                  <div className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.03] space-y-2 text-[11px]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                      Contributing Risk Factors:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between p-1 bg-[#07111F] rounded px-2">
                        <span className="text-slate-400">Safety Impact:</span>
                        <span className={riskScore >= 75 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                          {riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : 'MODERATE'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1 bg-[#07111F] rounded px-2">
                        <span className="text-slate-400">Infra Impact:</span>
                        <span className={riskScore >= 70 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                          {riskScore >= 70 ? 'ELEVATED' : 'STANDARD'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1 bg-[#07111F] rounded px-2">
                        <span className="text-slate-400">Urgency:</span>
                        <span className={incident.priority === 'critical' ? 'text-rose-400 font-bold' : 'text-cyan-300'}>
                          {incident.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1 bg-[#07111F] rounded px-2">
                        <span className="text-slate-400">Disruption:</span>
                        <span className={riskScore >= 75 ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                          {riskScore >= 75 ? 'ACTIVE' : 'LOCALIZED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Box */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Spatial Telemetry
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-500">Building:</span>
                      <span className="font-semibold text-white">{incident.building || 'Campus Central'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-500">Floor:</span>
                      <span className="font-semibold text-white">{incident.floor || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-slate-500">Spot / Room:</span>
                      <span className="font-semibold text-white truncate max-w-[130px]">{incident.location}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-cyan-300 truncate max-w-[130px]">{incident.department}</span>
                    </div>
                  </div>
                </div>

                {/* Human-in-the-Loop Decision & Control Area */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Human Operations Decision
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">Admin Control</span>
                  </div>

                  {/* Primary Decision Action: Approve Recommendation */}
                  {(incident.status === 'submitted' || incident.status === 'assigned') && !incident.workOrderId ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {approving ? 'Approving...' : 'Approve & Create Work Order'}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onStatusChange(incident.id, 'rejected')
                            toast.info(`Incident ${incident.id} marked as Rejected`)
                          }}
                          className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-[11px] font-semibold transition-colors text-center"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setResolveModalOpen(true)
                          }}
                          className="py-1.5 px-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] rounded-lg text-[11px] font-semibold transition-colors text-center"
                        >
                          Modify / Close
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Work Order Already Exists — duplicate prevention pill */}
                  {incident.workOrderId && (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center gap-2 font-mono font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      Work Order <strong className="text-white ml-1">{incident.workOrderId}</strong>&nbsp;already dispatched
                    </div>
                  )}

                  {/* Operational Status Toggles */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={updating || incident.status === 'in_progress'}
                      onClick={() => onStatusChange(incident.id, 'in_progress')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        incident.status === 'in_progress'
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#07111F] hover:bg-[#0B1020] border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      Mark In Progress
                    </button>

                    <button
                      disabled={updating || incident.status === 'resolved'}
                      onClick={() => setResolveModalOpen(true)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        incident.status === 'resolved'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#07111F] hover:bg-[#0B1020] border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      Mark Resolved
                    </button>
                  </div>

                  {/* AI Resolution Verification */}
                  {incident.status === 'resolved' && !incident.verifiedByAi && (
                    <button
                      onClick={handleVerifyResolution}
                      disabled={verifying}
                      className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {verifying ? 'Verifying with AI...' : 'Start AI Verification'}
                    </button>
                  )}
                </div>

                {/* Work Order Lifecycle Tracker — visible when a WO has been dispatched */}
                {incident.workOrderId && (() => {
                  const WO_STEPS = [
                    { label: 'Created', verified: false },
                    { label: 'Assigned', verified: false },
                    { label: 'In Progress', verified: false },
                    { label: 'Completed', verified: false },
                    { label: 'AI Verified', verified: true },
                  ]
                  const currentStep = incident.verifiedByAi ? 4
                    : incident.status === 'resolved' ? 3
                    : incident.status === 'in_progress' ? 2
                    : 1

                  return (
                    <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                          <Link2 className="w-3 h-3 text-cyan-400" />
                          Work Order Lifecycle
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 px-2 py-0.5 rounded">
                          {incident.workOrderId}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {WO_STEPS.map((step, idx) => {
                          const done = idx <= currentStep
                          const active = idx === currentStep
                          return (
                            <React.Fragment key={step.label}>
                              <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  done && step.verified
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                    : done
                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                    : active
                                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 animate-pulse'
                                    : 'bg-white/[0.03] border-white/[0.08] text-slate-600'
                                }`}>
                                  {done ? (
                                    <Check className="w-2.5 h-2.5" />
                                  ) : (
                                    <span className="text-[8px] font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[9px] font-mono text-center leading-tight ${
                                  done && step.verified ? 'text-emerald-400'
                                  : done ? 'text-cyan-300'
                                  : active ? 'text-violet-300'
                                  : 'text-slate-600'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                              {idx < WO_STEPS.length - 1 && (
                                <div className={`h-px flex-1 mb-4 transition-all ${idx < currentStep ? 'bg-cyan-500/40' : 'bg-white/[0.06]'}`} />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Bottom Section: Audit Log */}
            <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Operations System Audit Trail
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Reported: {formattedDate}
                </span>
              </div>

              {incident.auditLogs && incident.auditLogs.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-white/[0.04]">
                  {incident.auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] text-xs flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white block">{log.action}</span>
                        <p className="text-[11px] text-slate-400">{log.details}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-cyan-400 block">{log.actor}</span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <AgentTimeline
                steps={['classify_complaint', 'extract_details', 'determine_priority', 'assign_department', 'create_incident']}
                createdAt={incident.createdAt}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#05070D]/80 border-t border-white/[0.06] flex items-center justify-between">
            {onDelete ? (
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Incident
              </button>
            ) : <div />}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>

        {/* Resolution Note Modal */}
        <ResolveModal
          isOpen={resolveModalOpen}
          incidentId={incident.id}
          incidentTitle={incident.title}
          isProcessing={updating}
          onClose={() => setResolveModalOpen(false)}
          onConfirm={handleConfirmResolve}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={confirmDeleteOpen}
          title="Delete Incident Record?"
          message={`Are you sure you want to permanently delete incident ${incident.id}? This action cannot be undone.`}
          confirmLabel="Delete Incident"
          variant="danger"
          isProcessing={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />

        {/* Autonomous Workflow Demo Modal */}
        <AutonomousWorkflowDemo
          isOpen={workflowDemoOpen}
          onClose={() => setWorkflowDemoOpen(false)}
          onCompleteIncident={(updatedInc) => {
            onStatusChange(incident.id, 'resolved')
          }}
        />
      </div>
    </AnimatePresence>
  )
}
