import React from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  Bot,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { AgentActivityCenter } from './AgentActivityCenter'

interface IntelligenceMeshProps {
  totalIncidents: number
}

const AGENTS = [
  {
    name: 'Incident Triage Agent',
    role: 'Natural Language Ingestion & Domain Classification',
    model: 'Gemini 3.6 Flash',
    status: 'Operational',
    badgeVariant: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    tasks: '24 Tasks Today',
    latency: '1.2s',
  },
  {
    name: 'Risk Assessment Agent',
    role: 'Calibrated 1–100 Hazard & Disruption Scoring',
    model: 'Gemini 3.6 Flash',
    status: 'Operational',
    badgeVariant: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    tasks: '24 Tasks Today',
    latency: '1.4s',
  },
  {
    name: 'Routing & Dispatch Agent',
    role: 'Department Matchmaking & SLA Scheduling',
    model: 'Gemini 3.6 Flash',
    status: 'Operational',
    badgeVariant: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    tasks: '24 Tasks Today',
    latency: '0.9s',
  },
  {
    name: 'Resolution Work Order Agent',
    role: 'Generates Physical Repair Work Orders & Protocols',
    model: 'Gemini 3.6 Flash',
    status: 'Operational',
    badgeVariant: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    tasks: '18 Tasks Today',
    latency: '1.6s',
  },
  {
    name: 'AI Safety Verification Agent',
    role: 'Post-Resolution Audit & Zero-Hazard Certification',
    model: 'Gemini 3.6 Flash',
    status: 'Operational',
    badgeVariant: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    tasks: '12 Verifications (100% PASS)',
    latency: '1.1s',
  },
]

export const IntelligenceMesh: React.FC<IntelligenceMeshProps> = ({ totalIncidents }) => {
  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="bg-[#07111F] border border-white/[0.08] p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Intelligence Mesh Pillar
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Multi-Tool Agents & Telemetry Mesh
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Five specialized autonomous agent nodes running on Gemini 3.6 Flash function calling to ingest, score, dispatch, and certify campus facility operations.
        </p>
      </div>

      {/* 5 Specialized Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent, idx) => (
          <div
            key={idx}
            className="bg-[#07111F] border border-white/[0.08] p-5 rounded-2xl space-y-3 shadow-lg relative overflow-hidden text-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-tight">{agent.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{agent.model}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${agent.badgeVariant}`}
              >
                {agent.status}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {agent.role}
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{agent.tasks}</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {agent.latency}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Calibrated Risk Scoring Matrix */}
      <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">
            1–100 Calibrated Risk Score Evaluation Factors
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">1. Safety Hazard (40%)</span>
            <p className="text-slate-300">Live voltage, flooding, structural collapse, or student risk.</p>
          </div>

          <div className="p-3.5 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-orange-400 uppercase font-bold block">2. Infrastructure (25%)</span>
            <p className="text-slate-300">Substations, main water pipelines, servers, lab equipment.</p>
          </div>

          <div className="p-3.5 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">3. Academic Impact (20%)</span>
            <p className="text-slate-300">Classrooms, exam halls, student hostel living conditions.</p>
          </div>

          <div className="p-3.5 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">4. Urgency SLA (15%)</span>
            <p className="text-slate-300">Calculates escalation window: &lt;15m Critical to &lt;24h Low.</p>
          </div>
        </div>
      </div>

      {/* Embedded Agent Observability Center */}
      <AgentActivityCenter totalIncidents={totalIncidents} />
    </div>
  )
}
