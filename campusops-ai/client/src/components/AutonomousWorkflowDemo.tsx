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
} from 'lucide-react'
import type { Incident, IncidentCategory, IncidentPriority, WorkOrder } from '../types'
import { useToast } from './Toast'

export type AgentState =
  | 'IDLE'
  | 'ANALYZING'
  | 'CLASSIFYING'
  | 'ASSESSING_RISK'
  | 'ROUTING'
  | 'RECOMMENDING'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'IN_PROGRESS'
  | 'RESOLVING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REQUIRES_REVIEW'

interface AutonomousWorkflowDemoProps {
  isOpen: boolean
  onClose: () => void
  onCompleteIncident?: (incident: Incident) => void
}

export const AutonomousWorkflowDemo: React.FC<AutonomousWorkflowDemoProps> = ({
  isOpen,
  onClose,
  onCompleteIncident,
}) => {
  const { toast } = useToast()

  // State Machine
  const [agentState, setAgentState] = useState<AgentState>('IDLE')
  const [activeStep, setActiveStep] = useState(0)

  // Incident Context
  const [complaintText, setComplaintText] = useState(
    'There is active electrical sparking near the Engineering Block second floor laboratory corridor panel.'
  )
  const [category, setCategory] = useState<IncidentCategory>('electrical')
  const [location, setLocation] = useState('Engineering Block Corridor Panel 2B')
  const [building, setBuilding] = useState('Engineering Block')
  const [floor, setFloor] = useState('2nd Floor')
  const [riskScore, setRiskScore] = useState(95)
  const [priority, setPriority] = useState<IncidentPriority>('critical')
  const [aiConfidence, setAiConfidence] = useState(96)
  const [department, setDepartment] = useState('Electrical Maintenance')
  const [recommendation, setRecommendation] = useState(
    'Assign Electrical Maintenance immediately, isolate the affected panel if safe to do so, and complete inspection within the critical SLA window (< 15 mins).'
  )

  // Work Order State
  const [workOrderId, setWorkOrderId] = useState('WO-1048')
  const [resolutionNotes, setResolutionNotes] = useState(
    'Technician on-site isolated circuit breaker B-12, replaced damaged wiring insulation, and verified zero voltage leakage with multimeter.'
  )
  const [verificationResult, setVerificationResult] = useState<'PASS' | 'REVIEW_REQUIRED' | 'FAIL'>('PASS')

  // Audit Log History
  const [auditHistory, setAuditHistory] = useState<Array<{ time: string; action: string; actor: string; details: string }>>([])

  // Reset or initialize demo
  const resetDemo = () => {
    setAgentState('IDLE')
    setActiveStep(0)
    setAuditHistory([])
  }

  useEffect(() => {
    if (isOpen) {
      resetDemo()
    }
  }, [isOpen])

  // Automated step progression
  const runNextStep = () => {
    const now = new Date().toLocaleTimeString()

    if (agentState === 'IDLE') {
      setAgentState('ANALYZING')
      setActiveStep(1)
      setAuditHistory((prev) => [
        ...prev,
        { time: now, action: 'Incident Ingested via Natural Language', actor: 'USER: Student Reporter', details: `"${complaintText}"` },
      ])
      setTimeout(() => {
        setAgentState('CLASSIFYING')
        setActiveStep(2)
        setAuditHistory((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), action: 'Category Classified as Electrical', actor: 'AI: Incident Triage Agent', details: 'Extracted coordinates: Engineering Block · 2nd Floor' },
        ])
      }, 700)
      setTimeout(() => {
        setAgentState('ASSESSING_RISK')
        setActiveStep(3)
        setAuditHistory((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), action: 'Risk Calibrated: 95/100 (CRITICAL)', actor: 'AI: Risk Assessment Agent', details: 'High safety hazard (live voltage) + academic lab proximity' },
        ])
      }, 1400)
      setTimeout(() => {
        setAgentState('ROUTING')
        setActiveStep(4)
        setAuditHistory((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), action: 'Department Matched: Electrical Maintenance', actor: 'AI: Routing Agent', details: 'SLA Escalation window: Immediate (< 15 mins)' },
        ])
      }, 2100)
      setTimeout(() => {
        setAgentState('AWAITING_APPROVAL')
        setActiveStep(5)
        setAuditHistory((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), action: 'AI Operational Recommendation Generated', actor: 'AI: Work Order Recommender', details: recommendation },
        ])
        toast.info('Autonomous Recommendation Ready for Operator Approval')
      }, 2800)
    }
  }

  // Operator Approves
  const handleApprove = () => {
    const now = new Date().toLocaleTimeString()
    setAgentState('EXECUTING')
    setActiveStep(6)
    setAuditHistory((prev) => [
      ...prev,
      { time: now, action: 'Administrator Approved Recommendation', actor: 'USER: Operations Administrator', details: `Dispatched work order ${workOrderId} to Electrical Maintenance` },
    ])

    setTimeout(() => {
      setAgentState('IN_PROGRESS')
      setActiveStep(7)
      setAuditHistory((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), action: 'Technician Dispatched On-Site', actor: 'SYSTEM: Dispatch Engine', details: 'En route to Engineering Block 2nd Floor Corridor' },
      ])
    }, 800)
  }

  // Technician completes repairs
  const handleCompleteWorkOrder = () => {
    const now = new Date().toLocaleTimeString()
    setAgentState('RESOLVING')
    setActiveStep(8)
    setAuditHistory((prev) => [
      ...prev,
      { time: now, action: 'Work Order Completed & Resolution Note Submitted', actor: 'USER: Electrical Field Tech', details: resolutionNotes },
    ])
  }

  // Run AI Verification
  const handleRunVerification = () => {
    const now = new Date().toLocaleTimeString()
    setAgentState('VERIFYING')
    setActiveStep(9)
    setAuditHistory((prev) => [
      ...prev,
      { time: now, action: 'AI Safety Verification Initiated', actor: 'AI: Safety Verification Agent', details: 'Validating resolution against campus electrical safety protocols...' },
    ])

    setTimeout(() => {
      setAgentState('COMPLETED')
      setActiveStep(10)
      setVerificationResult('PASS')
      setAuditHistory((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), action: 'AI Verification Certified: PASS', actor: 'AI: Safety Verification Agent', details: 'Zero residual hazard detected. Circuit isolation and multimeter resistance confirmed compliant.' },
      ])
      toast.success('AI Autonomous Operations Loop Completed with Verified PASS')

      if (onCompleteIncident) {
        onCompleteIncident({
          id: 'INC-1048',
          title: 'Electrical Sparking in Engineering Block',
          description: complaintText,
          category: 'electrical',
          priority: 'critical',
          priorityScore: 95,
          location: 'Engineering Block Corridor Panel 2B',
          building: 'Engineering Block',
          floor: '2nd Floor',
          department: 'Electrical Maintenance',
          status: 'resolved',
          reporterId: 'demo_operator',
          createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
          updatedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
          aiSummary: 'Autonomous Agent: Fully ingested, risk scored, approved, resolved, and verified PASS.',
          aiRecommendation: recommendation,
          aiConfidence: 96,
          operationalImpact: 'high',
          verifiedByAi: true,
          resolutionNote: resolutionNotes,
        })
      }
    }, 1200)
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#07111F] border border-white/[0.1] rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative my-6 text-left"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-start justify-between gap-4 bg-[#05070D]/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  Observe → Understand → Decide → Act → Verify
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Autonomous Operations Workflow Engine
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetDemo}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                title="Restart Workflow"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workflow State Machine Bar */}
          <div className="p-4 bg-[#05070D] border-b border-white/[0.06] flex items-center justify-between overflow-x-auto text-xs font-mono">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500">STATE:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                {agentState}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
              <span className={`px-2 py-0.5 rounded border ${activeStep >= 1 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'text-slate-600 border-transparent'}`}>1. Observe</span>
              <span className="text-slate-700">→</span>
              <span className={`px-2 py-0.5 rounded border ${activeStep >= 3 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'text-slate-600 border-transparent'}`}>2. Understand</span>
              <span className="text-slate-700">→</span>
              <span className={`px-2 py-0.5 rounded border ${activeStep >= 5 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'text-slate-600 border-transparent'}`}>3. Decide</span>
              <span className="text-slate-700">→</span>
              <span className={`px-2 py-0.5 rounded border ${activeStep >= 7 ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' : 'text-slate-600 border-transparent'}`}>4. Act</span>
              <span className="text-slate-700">→</span>
              <span className={`px-2 py-0.5 rounded border ${activeStep >= 10 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-slate-600 border-transparent'}`}>5. Verify</span>
            </div>
          </div>

          {/* Main 2-Column Body */}
          <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Decision Summary & Work Order */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Natural Language Input */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    1. Observed Natural Language Ingestion
                  </span>
                  <p className="text-xs text-slate-200 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03] italic">
                    "{complaintText}"
                  </p>
                </div>

                {/* 2. AI Decision Summary */}
                {activeStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#05070D] border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Decision & Risk Evaluation
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                          Confidence: {aiConfidence}%
                        </span>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                          Risk: {riskScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Target Department</span>
                        <span className="font-semibold text-white block mt-0.5">{department}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Response SLA</span>
                        <span className="font-semibold text-rose-300 block mt-0.5">Immediate (&lt; 15 mins)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                      <strong className="text-white block font-mono text-[10px] uppercase">Recommended Action:</strong>
                      {recommendation}
                    </div>
                  </motion.div>
                )}

                {/* 3. Human in the loop action trigger */}
                {agentState === 'AWAITING_APPROVAL' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#07111F] to-indigo-950/60 border border-cyan-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        Human Operations Approval Boundary
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">Requires Dispatch Signoff</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Approve autonomous work order creation and dispatch to <strong className="text-white">{department}</strong>?
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Create Work Order
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4. Physical Work Order Execution */}
                {activeStep >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#05070D] border border-white/[0.08] rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        Physical Work Order ({workOrderId})
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        agentState === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {agentState === 'COMPLETED' ? 'Verified Resolved' : 'Technician Active'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Field Repair Work Order Note</span>
                      <p className="italic">"{resolutionNotes}"</p>
                    </div>

                    {agentState === 'IN_PROGRESS' && (
                      <button
                        onClick={handleCompleteWorkOrder}
                        className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-colors"
                      >
                        Mark Repairs Completed & Submit Resolution
                      </button>
                    )}

                    {agentState === 'RESOLVING' && (
                      <button
                        onClick={handleRunVerification}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Run Autonomous AI Verification
                      </button>
                    )}

                    {agentState === 'COMPLETED' && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>AI Safety Certification: <strong>PASS (Zero residual hazard detected)</strong></span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column: Simulated Telemetry & System Audit Trail */}
              <div className="lg:col-span-5 space-y-5">
                {/* Simulated Campus Sensors Telemetry */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Live Campus Sensor Telemetry
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Demo Stream</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Circuit Load</span>
                      <span className="text-rose-400 font-bold">88% (Elevated)</span>
                    </div>
                    <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Water Pressure</span>
                      <span className="text-emerald-400 font-bold">42 PSI (Normal)</span>
                    </div>
                    <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">HVAC Zone</span>
                      <span className="text-emerald-400 font-bold">21°C (Optimal)</span>
                    </div>
                    <div className="p-2 bg-[#07111F] rounded-lg border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Network Uptime</span>
                      <span className="text-cyan-400 font-bold">99.8% (Online)</span>
                    </div>
                  </div>
                </div>

                {/* System Audit Trail */}
                <div className="bg-[#05070D] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-xs font-mono uppercase text-white font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Audit Trail & System Events
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{auditHistory.length} Events</span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {auditHistory.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-4">
                        Click "Launch Autonomous Pipeline" to begin workflow.
                      </p>
                    ) : (
                      auditHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03] text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-cyan-400 font-bold">{item.actor}</span>
                            <span className="text-slate-500">{item.time}</span>
                          </div>
                          <span className="font-semibold text-white block">{item.action}</span>
                          <p className="text-[11px] text-slate-400">{item.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#05070D] border-t border-white/[0.06] flex items-center justify-between">
            {agentState === 'IDLE' ? (
              <button
                onClick={runNextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Launch Autonomous Pipeline
              </button>
            ) : agentState === 'COMPLETED' ? (
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Workflow Loop Completed Successfully
              </span>
            ) : (
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Workflow in Progress: {agentState}
              </span>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/[0.08] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
