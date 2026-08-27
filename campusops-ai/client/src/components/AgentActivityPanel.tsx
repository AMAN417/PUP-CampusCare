import React from 'react'
import { Check, Loader2, Sparkles, Cpu, Activity, Shield } from 'lucide-react'

interface AgentActivityPanelProps {
  activeSteps?: string[]
  currentStep?: string
  isExecuting?: boolean
}

interface StepMeta {
  id: string
  label: string
  functionName: string
}

export const AGENT_STEPS: StepMeta[] = [
  {
    id: 'classify_complaint',
    label: 'Complaint classified',
    functionName: 'classify_complaint',
  },
  {
    id: 'extract_details',
    label: 'Details extracted',
    functionName: 'extract_details',
  },
  {
    id: 'determine_priority',
    label: 'Priority determined',
    functionName: 'determine_priority',
  },
  {
    id: 'assign_department',
    label: 'Department assigned',
    functionName: 'assign_department',
  },
  {
    id: 'create_incident',
    label: 'Incident created',
    functionName: 'create_incident',
  },
]

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  activeSteps = [],
  currentStep,
  isExecuting = false,
}) => {
  return (
    <div className="bg-[#07111F]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden">
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-white">
              AI Operations Agent
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300/80 mt-0.5 block">
            ● Operational
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-slate-400">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>Gemini 3.6</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
        Autonomously classifies complaints, evaluates risk, routes incidents, and creates operational records.
      </p>

      {/* Vertical Execution Track */}
      <div className="relative pl-5 space-y-3">
        {/* Glowing vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] bg-slate-800" />
        <div
          className="absolute left-[7px] top-2 w-[1.5px] bg-gradient-to-b from-cyan-400 to-violet-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          style={{
            height: isExecuting
              ? '60%'
              : activeSteps.length > 0
              ? `${(activeSteps.length / AGENT_STEPS.length) * 100}%`
              : '100%',
          }}
        />

        {AGENT_STEPS.map((step, idx) => {
          const isDone = activeSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const isPending = !isDone && !isCurrent

          return (
            <div key={step.id} className="relative flex items-center justify-between group">
              {/* Bullet indicator */}
              <div
                className={`absolute -left-5 w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-[#05070D] border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : isCurrent
                    ? 'bg-[#05070D] border-violet-400 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.9)] animate-pulse'
                    : 'bg-[#05070D] border-slate-700 text-slate-600'
                }`}
              >
                {isDone ? (
                  <Check className="w-2 h-2" />
                ) : isCurrent ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                )}
              </div>

              {/* Step info */}
              <div className="flex items-center justify-between w-full pl-2">
                <span
                  className={`text-xs font-medium transition-colors ${
                    isDone
                      ? 'text-slate-200'
                      : isCurrent
                      ? 'text-cyan-300 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {isDone ? `✓ ${step.label}` : isCurrent ? `● ${step.label}` : `○ ${step.label}`}
                </span>

                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                  {step.functionName}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer telemetry */}
      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          Autonomous Dispatch
        </span>
        <span className="text-slate-400">Ready</span>
      </div>
    </div>
  )
}
