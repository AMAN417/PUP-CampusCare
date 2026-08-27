import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Check, Loader2, Sparkles, ShieldAlert, Cpu } from 'lucide-react'
import { AGENT_STEPS } from './AgentActivityPanel'

interface AIProcessingViewProps {
  isComplete: boolean
  error?: string | null
  actualSteps?: string[]
}

export const AIProcessingView: React.FC<AIProcessingViewProps> = ({
  isComplete,
  error,
  actualSteps = [],
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (isComplete) {
      setCompletedSteps(actualSteps.length > 0 ? actualSteps : AGENT_STEPS.map((t) => t.id))
      setCurrentStepIndex(AGENT_STEPS.length)
      return
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AGENT_STEPS.length - 1) {
          const next = prev + 1
          setCompletedSteps((done) => [...done, AGENT_STEPS[prev].id])
          return next
        }
        return prev
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [isComplete, actualSteps])

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-[#07111F]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden text-left">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 mb-8 relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Brain className="w-7 h-7 animate-pulse text-cyan-300" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold">
            CampusOps AI
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Analyzing incident...
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-semibold">Agent Dispatch Notice</p>
            <p className="text-slate-400">{error}</p>
          </div>
        </div>
      )}

      {/* Step Sequence */}
      <div className="space-y-3 relative pl-4">
        {/* Glowing vertical line */}
        <div className="absolute left-[22px] top-4 bottom-4 w-[1.5px] bg-slate-800" />

        {AGENT_STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(step.id) || (isComplete && actualSteps.includes(step.id))
          const isCurrent = !isDone && idx === currentStepIndex && !error
          const isWaiting = !isDone && !isCurrent

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-cyan-950/40 via-[#0B1020] to-[#07111F] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isDone
                  ? 'bg-[#05070D]/80 border-white/[0.06]'
                  : 'bg-[#05070D]/30 border-transparent opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Node icon */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border text-xs transition-all ${
                    isDone
                      ? 'bg-slate-950 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : isCurrent
                      ? 'bg-slate-950 border-cyan-400 text-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.9)]'
                      : 'bg-slate-950 border-slate-700 text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>

                <div>
                  <span
                    className={`text-xs font-medium block ${
                      isDone ? 'text-white' : isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {isDone ? `✓ ${step.label}` : isCurrent ? `● ${step.label}` : `○ ${step.label}`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {step.functionName}
                  </span>
                </div>
              </div>

              <div>
                {isDone && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Running
                  </span>
                )}
                {isWaiting && (
                  <span className="text-[10px] font-mono text-slate-600">Standby</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.6 Flash Multi-Turn Function Calling</span>
        </div>
        <span className="text-cyan-400">Live Agent</span>
      </div>
    </div>
  )
}
