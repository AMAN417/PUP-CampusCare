import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Copy,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  Shield,
  Layers,
} from 'lucide-react'
import type { Incident } from '../types'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { getCategoryIcon } from './IncidentCard'
import { AgentTimeline } from './AgentTimeline'

interface IncidentResultViewProps {
  incident: Incident
  aiSummary: string
  steps: string[]
  onNewReport: () => void
  onViewInAdmin: () => void
}

export const IncidentResultView: React.FC<IncidentResultViewProps> = ({
  incident,
  aiSummary,
  steps,
  onNewReport,
  onViewInAdmin,
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(incident.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isCritical = incident.priority === 'critical' || incident.priority === 'high'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto space-y-6 text-left"
    >
      {/* Primary Success Hero Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl relative overflow-hidden shadow-2xl ${
          isCritical
            ? 'bg-gradient-to-br from-[#0B1020] via-[#07111F] to-[#05070D] border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
            : 'bg-[#07111F] border-white/[0.08]'
        }`}
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Incident created successfully
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg sm:text-xl font-extrabold text-cyan-400 tracking-tight">
                {incident.id.toUpperCase().startsWith('INC-') ? incident.id.toUpperCase() : `INC-${incident.id.toUpperCase()}`}
              </span>
              <button
                onClick={copyId}
                className="text-slate-400 hover:text-white p-1 rounded-md bg-white/[0.04] border border-white/[0.06] transition-colors"
                title="Copy Incident ID"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={incident.priority} score={incident.priorityScore} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Title & Metadata Grid */}
        <div className="pt-6 space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Incident Title</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              {incident.title}
            </h2>
          </div>

          {/* 4-Box Telemetry Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#05070D] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Category</span>
              <div className="flex items-center gap-1.5 mt-1">
                {getCategoryIcon(incident.category)}
                <span className="text-xs font-semibold text-white capitalize">{incident.category}</span>
              </div>
            </div>

            <div className="bg-[#05070D] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Priority / Risk</span>
              <span
                className={`text-xs font-mono font-bold block mt-1 ${
                  incident.priorityScore >= 80 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {incident.priority.toUpperCase()} ({incident.priorityScore}/100)
              </span>
            </div>

            <div className="bg-[#05070D] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Department</span>
              <span className="text-xs font-semibold text-cyan-300 block mt-1 truncate">
                {incident.department}
              </span>
            </div>

            <div className="bg-[#05070D] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Location</span>
              <span className="text-xs font-semibold text-slate-200 block mt-1 truncate">
                {incident.building || 'Campus'} {incident.floor ? `· ${incident.floor}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Safety Advisory Card */}
      <div className="bg-[#05070D] border-l-4 border-l-rose-500 border border-white/[0.08] p-5 sm:p-6 rounded-2xl space-y-2.5 shadow-[0_0_20px_rgba(244,63,94,0.08)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-rose-300 font-bold">
            AI Safety Advisory & Operational Notice
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {incident.aiReasoning ||
            'Avoid touching the affected equipment. Keep students away from the area until maintenance personnel arrive on-site.'}
        </p>
      </div>

      {/* Autonomous Tool Execution Timeline */}
      <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Agent Execution Timeline
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            {steps.length} MCP Tools Autonomous Chain
          </span>
        </div>

        <AgentTimeline steps={steps} createdAt={incident.createdAt} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onNewReport}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B1020] hover:bg-[#10172A] text-slate-300 hover:text-white font-semibold text-xs border border-white/[0.08] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Report Another Issue
        </button>

        <button
          onClick={onViewInAdmin}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
        >
          Open in Operations Console
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
