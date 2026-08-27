import React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Sparkles, Tag, MapPin, AlertTriangle, Building2, FileCheck, Clock } from 'lucide-react'

interface TimelineStep {
  id: string
  label: string
  functionName: string
  timestamp?: string
  status: 'completed' | 'processing' | 'pending'
  detail?: string
}

interface AgentTimelineProps {
  steps?: string[]
  createdAt?: string
  isExecuting?: boolean
  currentStep?: string
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  steps = [],
  createdAt,
  isExecuting = false,
  currentStep,
}) => {
  const baseTime = createdAt ? new Date(createdAt) : new Date()

  const defaultTimeline: TimelineStep[] = [
    {
      id: 'complaint_received',
      label: 'Complaint received',
      functionName: 'complaint_received',
      timestamp: formatTime(baseTime, 0),
      status: 'completed',
      detail: 'Natural language input ingested into agent runtime',
    },
    {
      id: 'classify_complaint',
      label: 'Classification completed',
      functionName: 'classify_complaint',
      timestamp: formatTime(baseTime, 1),
      status: steps.includes('classify_complaint')
        ? 'completed'
        : currentStep === 'classify_complaint'
        ? 'processing'
        : 'pending',
      detail: 'Intent parsed & primary facility domain categorized',
    },
    {
      id: 'extract_details',
      label: 'Details extracted',
      functionName: 'extract_details',
      timestamp: formatTime(baseTime, 2),
      status: steps.includes('extract_details')
        ? 'completed'
        : currentStep === 'extract_details'
        ? 'processing'
        : 'pending',
      detail: 'Building, floor, and spatial tags resolved',
    },
    {
      id: 'determine_priority',
      label: 'Priority determined',
      functionName: 'determine_priority',
      timestamp: formatTime(baseTime, 2),
      status: steps.includes('determine_priority')
        ? 'completed'
        : currentStep === 'determine_priority'
        ? 'processing'
        : 'pending',
      detail: 'Safety hazard calibrated with 1-100 risk score',
    },
    {
      id: 'assign_department',
      label: 'Department assigned',
      functionName: 'assign_department',
      timestamp: formatTime(baseTime, 3),
      status: steps.includes('assign_department')
        ? 'completed'
        : currentStep === 'assign_department'
        ? 'processing'
        : 'pending',
      detail: 'Escalation rules checked & maintenance team assigned',
    },
    {
      id: 'create_incident',
      label: 'Incident created',
      functionName: 'create_incident',
      timestamp: formatTime(baseTime, 4),
      status: steps.includes('create_incident')
        ? 'completed'
        : currentStep === 'create_incident'
        ? 'processing'
        : 'pending',
      detail: 'Structured record persisted to operational database',
    },
  ]

  function formatTime(date: Date, offsetSeconds: number): string {
    const d = new Date(date.getTime() + offsetSeconds * 1000)
    return d.toTimeString().split(' ')[0]
  }

  return (
    <div className="relative pl-6 space-y-6">
      {/* Glowing vertical connector line */}
      <div className="absolute left-2.5 top-3 bottom-3 w-[2px] bg-gradient-to-b from-cyan-500 via-indigo-500 to-slate-800" />

      {defaultTimeline.map((item, idx) => {
        const isDone = item.status === 'completed'
        const isCurrent = item.status === 'processing'

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative flex items-start gap-4 group"
          >
            {/* Node Bullet */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isDone
                  ? 'bg-slate-950 border-cyan-500/80 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : isCurrent
                  ? 'bg-slate-950 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(139,92,246,0.6)] animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : isCurrent ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              )}
            </div>

            {/* Content card */}
            <div
              className={`flex-1 p-3 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
                  : isCurrent
                  ? 'bg-indigo-950/30 border-indigo-500/30'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    {item.functionName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {item.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.detail}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
