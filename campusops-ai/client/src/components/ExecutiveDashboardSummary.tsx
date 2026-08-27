import React from 'react'
import { ShieldCheck, AlertTriangle, Cpu, Clock, CheckCircle2, Zap } from 'lucide-react'

interface ExecutiveDashboardSummaryProps {
  criticalCount: number
  inProgressCount: number
  resolvedCount: number
  onLaunchDemo?: () => void
}

export const ExecutiveDashboardSummary: React.FC<ExecutiveDashboardSummaryProps> = ({
  criticalCount,
  inProgressCount,
  resolvedCount,
  onLaunchDemo,
}) => {
  return (
    <div className="bg-[#07111F] border border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
      {/* 5 Compact Executive Telemetry Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1 text-xs">
        <div className="p-3 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Campus Status
          </span>
          <span className="font-bold text-emerald-400 block font-mono">OPERATIONAL</span>
        </div>

        <div className="p-3 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Attention Needed
          </span>
          <span className="font-bold text-rose-400 block font-mono">{criticalCount} Critical</span>
        </div>

        <div className="p-3 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            AI Multi-Tool Mesh
          </span>
          <span className="font-bold text-cyan-300 block font-mono">5 Agents Active</span>
        </div>

        <div className="p-3 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Active Dispatch
          </span>
          <span className="font-bold text-slate-200 block font-mono">{inProgressCount} Work Orders</span>
        </div>

        <div className="p-3 bg-[#05070D] rounded-2xl border border-white/[0.04] space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved Today
          </span>
          <span className="font-bold text-emerald-300 block font-mono">{resolvedCount} Verified</span>
        </div>
      </div>

      {/* Direct Demo Trigger Button */}
      {onLaunchDemo && (
        <button
          onClick={onLaunchDemo}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Launch Executive Demo</span>
        </button>
      )}
    </div>
  )
}
