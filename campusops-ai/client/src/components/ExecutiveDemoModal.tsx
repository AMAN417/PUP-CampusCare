import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Wrench,
  Activity,
  FileCheck,
  Zap,
  Building,
  MapPin,
  RefreshCw,
  X,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  Radio,
  FileText,
  History,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react'
import type { Incident, IncidentCategory, IncidentPriority } from '../types'
import { useToast } from './Toast'

interface ExecutiveDemoModalProps {
  isOpen: boolean
  onClose: () => void
  onIncidentResolved?: (incident: Incident) => void
}

type DemoStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const ExecutiveDemoModal: React.FC<ExecutiveDemoModalProps> = ({
  isOpen,
  onClose,
  onIncidentResolved,
}) => {
  const { toast } = useToast()

  const [step, setStep] = useState<DemoStep>(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [technicianActive, setTechnicianActive] = useState(false)
  const [resolutionSubmitted, setResolutionSubmitted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationPassed, setVerificationPassed] = useState(false)
  const [showAuditTrail, setShowAuditTrail] = useState(false)

  // Incident Context
  const incidentData = {
    id: 'INC-1048',
    title: 'Electrical Sparking near Engineering Block',
    statement: 'There is active electrical sparking near the Engineering Block second floor laboratory corridor panel.',
    category: 'Electrical',
    location: 'Engineering Block · 2nd Floor Corridor Panel 2B',
    riskScore: 95,
    priority: 'CRITICAL',
    department: 'Electrical Maintenance',
    confidence: 95,
    recommendedAction: 'Immediate inspection and isolation of the affected electrical area within critical SLA (< 15 mins).',
    workOrderId: 'WO-1048',
    resolutionNote: 'Technician isolated circuit breaker B-12, replaced charred wiring insulation, and verified zero voltage leakage with multimeter.',
  }

  // Audit Events
  const [auditEvents, setAuditEvents] = useState<Array<{ time: string; event: string; actor: string; detail: string }>>([
    {
      time: '14:32:00',
      event: 'Incident Received via Natural Language Intake',
      actor: 'Student Intake Portal',
      detail: `"${incidentData.statement}"`,
    },
  ])

  // Reset Demo
  const resetDemo = () => {
    setStep(1)
    setIsAnalyzing(false)
    setTechnicianActive(false)
    setResolutionSubmitted(false)
    setIsVerifying(false)
    setVerificationPassed(false)
    setShowAuditTrail(false)
    setAuditEvents([
      {
        time: '14:32:00',
        event: 'Incident Received via Natural Language Intake',
        actor: 'Student Intake Portal',
        detail: `"${incidentData.statement}"`,
      },
    ])
    toast.info('Demo scenario reset to initial state')
  }

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setIsAnalyzing(false)
    }
  }, [isOpen])

  // Step 1: Run AI Analysis
  const handleStartAnalysis = () => {
    setIsAnalyzing(true)
    setStep(2)

    setTimeout(() => {
      setAuditEvents((prev) => [
        ...prev,
        {
          time: '14:32:02',
          event: 'Category & Location Classified',
          actor: 'Incident Triage Agent',
          detail: 'Category: Electrical · Location: Engineering Block 2nd Floor',
        },
      ])
    }, 600)

    setTimeout(() => {
      setStep(3)
      setAuditEvents((prev) => [
        ...prev,
        {
          time: '14:32:04',
          event: 'Calibrated Risk Calculated: 95/100 (CRITICAL)',
          actor: 'Risk Assessment Agent',
          detail: 'Safety hazard: High (Live Voltage) · Lab Proximity',
        },
      ])
    }, 1200)

    setTimeout(() => {
      setStep(4)
      setIsAnalyzing(false)
      setAuditEvents((prev) => [
        ...prev,
        {
          time: '14:32:06',
          event: 'Department Routing & Action Recommendation Ready',
          actor: 'Routing Agent',
          detail: `Assigned: ${incidentData.department} · SLA: < 15 mins`,
        },
      ])
      toast.info('AI Recommendation Generated — Awaiting Human Decision')
    }, 1800)
  }

  // Step 4: Human Approves Recommendation
  const handleApproveRecommendation = () => {
    setStep(5)
    setAuditEvents((prev) => [
      ...prev,
      {
        time: '14:32:20',
        event: 'Administrator Approved Recommendation',
        actor: 'Chief Operations Officer',
        detail: `Created work order ${incidentData.workOrderId} and dispatched field team`,
      },
    ])
    toast.success('Work Order Created & Dispatched')
  }

  // Step 5: Simulate Technician Workflow
  const handleSimulateFieldWork = () => {
    setTechnicianActive(true)
    setTimeout(() => {
      setTechnicianActive(false)
      setResolutionSubmitted(true)
      setStep(6)
      setAuditEvents((prev) => [
        ...prev,
        {
          time: '14:48:02',
          event: 'Field Repairs Completed & Work Order Note Recorded',
          actor: 'Electrical Lead Technician',
          detail: incidentData.resolutionNote,
        },
      ])
    }, 800)
  }

  // Step 6: Run AI Verification
  const handleRunVerification = () => {
    setIsVerifying(true)
    setAuditEvents((prev) => [
      ...prev,
      {
        time: '14:48:04',
        event: 'AI Safety Verification Initiated',
        actor: 'AI Verification Agent',
        detail: 'Auditing repair notes against university electrical safety standards...',
      },
    ])

    setTimeout(() => {
      setIsVerifying(false)
      setVerificationPassed(true)
      setStep(7)
      setAuditEvents((prev) => [
        ...prev,
        {
          time: '14:48:05',
          event: 'AI Verification Certified: PASS',
          actor: 'AI Verification Agent',
          detail: 'Criteria satisfied: Circuit breaker isolated, resistance validated. Zero residual hazard detected.',
        },
      ])
      toast.success('AI Verification Complete: PASS')

      if (onIncidentResolved) {
        onIncidentResolved({
          id: incidentData.id,
          title: incidentData.title,
          description: incidentData.statement,
          category: 'electrical',
          priority: 'critical',
          priorityScore: incidentData.riskScore,
          location: incidentData.location,
          building: 'Engineering Block',
          floor: '2nd Floor',
          department: incidentData.department,
          status: 'resolved',
          reporterId: 'demo_exec',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
          updatedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
          aiSummary: 'Autonomous Agent: Ingested, classified, risk calibrated, human approved, resolved, and verified PASS.',
          aiRecommendation: incidentData.recommendedAction,
          aiConfidence: incidentData.confidence,
          operationalImpact: 'high',
          verifiedByAi: true,
          resolutionNote: incidentData.resolutionNote,
        })
      }
    }, 1100)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#07111F] border border-white/[0.1] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative my-6 text-left"
        >
          {/* Top Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-start justify-between gap-4 bg-[#05070D]/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  Executive Demo Mode · End-to-End Autonomous Workflow
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {incidentData.id}: {incidentData.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold border border-white/[0.08] transition-colors"
                title="Reset scenario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Step Progress Tracker */}
          <div className="px-6 py-3 bg-[#05070D] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Incident Processing:</span>
              <span className="text-cyan-300 font-bold">Step {step} of 7</span>
            </div>

            <span className="text-slate-400 hidden sm:inline">
              {step === 1 && 'Incident Received · Ready for AI Analysis'}
              {step === 2 && 'Classifying & Context Extraction...'}
              {step === 3 && 'Calibrating 1–100 Hazard Risk...'}
              {step === 4 && 'AI Recommendation Ready · Awaiting Operator Approval'}
              {step === 5 && 'Work Order Dispatched · Field Repair Active'}
              {step === 6 && 'Repairs Completed · Ready for AI Safety Verification'}
              {step === 7 && 'Incident Verified PASS · Fleet Records Updated'}
            </span>
          </div>

          {/* Main Body */}
          <div className="p-6 space-y-6 max-h-[66vh] overflow-y-auto text-xs">
            {/* Step 1: Input Statement */}
            <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Natural Language Incident Ingestion
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  Engineering Block · Lab Corridor
                </span>
              </div>
              <p className="text-xs text-slate-200 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03] italic">
                "{incidentData.statement}"
              </p>

              {step === 1 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleStartAnalysis}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Autonomous AI Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Step 2-4: AI Decision Highlight Moment */}
            {step >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#05070D] border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      AI Autonomous Decision Summary
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      Model Confidence: {incidentData.confidence}%
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                      Risk: {incidentData.riskScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.03] space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Hazard Classification</span>
                    <span className="text-white font-bold block">{incidentData.category} Incident</span>
                    <span className="text-[10px] text-rose-400 font-semibold font-mono">CRITICAL PRIORITY</span>
                  </div>

                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.03] space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Recommended Department</span>
                    <span className="text-cyan-300 font-bold block">{incidentData.department}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Response SLA: &lt; 15 mins</span>
                  </div>

                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.03] space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Facility Impact</span>
                    <span className="text-slate-200 font-semibold block">Academic Lab Corridor</span>
                    <span className="text-[10px] text-amber-400 font-mono">Direct Occupant Risk</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 leading-relaxed">
                  <strong className="text-white block font-mono text-[10px] uppercase">Recommended Action:</strong>
                  {incidentData.recommendedAction}
                </div>

                {/* Human-in-the-Loop Decision Boundary */}
                {step === 4 && (
                  <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold">Operator Decision Required:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApproveRecommendation}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Create Work Order
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5 & 6: Work Order Creation & Simulated Progress */}
            {step >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#05070D] border border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-white uppercase font-mono text-xs">
                      Work Order: {incidentData.workOrderId}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    Demo Simulation: Responsible Field Progress
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                    <span className="text-[9px] text-slate-500 block">Assigned Team</span>
                    <span className="text-cyan-300 font-bold">{incidentData.department}</span>
                  </div>
                  <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                    <span className="text-[9px] text-slate-500 block">Target SLA</span>
                    <span className="text-rose-400 font-bold">15 mins</span>
                  </div>
                  <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                    <span className="text-[9px] text-slate-500 block">Status</span>
                    <span className={step >= 6 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {step >= 6 ? 'Completed' : 'Technician Dispatched'}
                    </span>
                  </div>
                  <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                    <span className="text-[9px] text-slate-500 block">Location</span>
                    <span className="text-slate-200 font-bold truncate">Engineering 2B</span>
                  </div>
                </div>

                {step === 5 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSimulateFieldWork}
                      disabled={technicianActive}
                      className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {technicianActive ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Simulating Technician Repairs...
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          Simulate Technician On-Site Resolution
                        </>
                      )}
                    </button>
                  </div>
                )}

                {step >= 6 && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Submitted Resolution Note</span>
                    <p className="italic text-slate-300">"{incidentData.resolutionNote}"</p>
                  </div>
                )}

                {step === 6 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleRunVerification}
                      disabled={isVerifying}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Verifying Safety Standards...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Run Autonomous AI Safety Verification
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 7: Executive Summary & Verification PASS Moment */}
            {step === 7 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Verification PASS Banner */}
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-white text-sm block">AI Verification Certified: PASS</strong>
                      <span className="text-xs text-emerald-200/90">
                        Resolution note inspected against campus electrical protocols. Zero residual hazard detected.
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-mono text-xs font-bold">
                    CLOSED OUT
                  </span>
                </div>

                {/* Executive Summary Table */}
                <div className="bg-[#05070D] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                  <h4 className="font-mono text-xs uppercase font-bold text-white">
                    Executive Incident Resolution Record
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Category / Priority</span>
                      <span className="font-bold text-white block">Electrical · Critical</span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Calibrated Risk</span>
                      <span className="font-bold text-rose-400 block font-mono">95 / 100</span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Assigned Team</span>
                      <span className="font-bold text-cyan-300 block">Electrical Maint.</span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Verification State</span>
                      <span className="font-bold text-emerald-400 block font-mono">PASS (Verified)</span>
                    </div>
                  </div>
                </div>

                {/* Operational Impact Delta */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Campus Fleet Impact Delta
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Critical Incidents</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        4 → 3 <TrendingDown className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Pending Verification</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        2 → 1 <TrendingDown className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Resolved Today</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        8 → 9 <TrendingUp className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#07111F] rounded-xl border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block">Autonomous Rate</span>
                      <span className="text-white font-bold">100%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Expandable Traceable Audit Trail */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setShowAuditTrail(!showAuditTrail)}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showAuditTrail ? 'Hide Traceable Audit Trail' : 'View Traceable Audit Trail'}</span>
                <span className="text-slate-500 font-mono text-[10px]">({auditEvents.length} events)</span>
              </button>

              {showAuditTrail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2 max-h-[180px] overflow-y-auto"
                >
                  {auditEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] text-xs flex items-start justify-between gap-4"
                    >
                      <div>
                        <span className="font-semibold text-white block">{ev.event}</span>
                        <p className="text-[11px] text-slate-400">{ev.detail}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-cyan-400 block">{ev.actor}</span>
                        <span className="text-[9px] font-mono text-slate-500">{ev.time}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#05070D] border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              CampusOps AI · Deterministic Executive Demo
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
