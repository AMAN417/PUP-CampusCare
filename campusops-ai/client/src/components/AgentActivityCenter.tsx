import React from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { AGENT_STEPS } from './AgentActivityPanel'

interface AgentActivityCenterProps {
  totalIncidents?: number
}

export const AgentActivityCenter: React.FC<AgentActivityCenterProps> = ({
  totalIncidents = 5,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                Agent Operations & Telemetry Mesh
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Autonomous Agent Activity Center
            </h2>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Engine: Healthy</span>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-[#05070D] p-4 rounded-2xl border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Active Agents
            </span>
            <p className="text-2xl font-extrabold text-white font-mono">1 Triage Mesh</p>
            <span className="text-[10px] text-cyan-400 font-mono">5 Autonomous Tools</span>
          </div>

          <div className="bg-[#05070D] p-4 rounded-2xl border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Tasks Processed Today
            </span>
            <p className="text-2xl font-extrabold text-white font-mono">{totalIncidents * 5}</p>
            <span className="text-[10px] text-emerald-400 font-mono">100% Autonomous</span>
          </div>

          <div className="bg-[#05070D] p-4 rounded-2xl border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Avg Processing Latency
            </span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">&lt; 1.8s</p>
            <span className="text-[10px] text-slate-400 font-mono">Gemini 3.6 Flash</span>
          </div>

          <div className="bg-[#05070D] p-4 rounded-2xl border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Classification Confidence
            </span>
            <p className="text-2xl font-extrabold text-violet-400 font-mono">96.4%</p>
            <span className="text-[10px] text-slate-400 font-mono">Zero Human Triage Lag</span>
          </div>
        </div>
      </div>

      {/* Dual Panel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Agent Live Status */}
        <div className="lg:col-span-7 bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Incident Triage Agent — Live Pipeline</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              READY / STANDBY
            </span>
          </div>

          <div className="space-y-3">
            {AGENT_STEPS.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#05070D] border border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{step.label}</span>
                    <span className="text-[10px] font-mono text-slate-500">{step.functionName}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Operational
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Decision Transparency & Evidence Rules */}
        <div className="lg:col-span-5 bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">AI Transparency & Evidence Rules</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#05070D] border border-white/[0.04] space-y-1">
              <span className="font-mono text-[10px] text-rose-400 uppercase font-bold block">
                Why Critical (90-100)?
              </span>
              <p className="text-slate-300 leading-relaxed">
                Active electrical arcing, major water ruptures near electrical conduits, or blocked fire exits in occupied student buildings.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#05070D] border border-white/[0.04] space-y-1">
              <span className="font-mono text-[10px] text-orange-400 uppercase font-bold block">
                Why Department Routing?
              </span>
              <p className="text-slate-300 leading-relaxed">
                Autonomous intent matching binds complaint entities directly to responsible university teams (Electrical, Facilities, IT, Security).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#05070D] border border-white/[0.04] space-y-1">
              <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold block">
                Why AI Resolution Verification?
              </span>
              <p className="text-slate-300 leading-relaxed">
                Closed incidents require safety verification against campus facility SLAs to ensure zero residual hazard before completion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
