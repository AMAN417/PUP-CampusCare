import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Building,
  MapPin,
  AlertTriangle,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import type { Incident, IncidentCategory, IncidentPriority } from '../types'
import { submitComplaint } from '../lib/api'
import { useToast } from './Toast'
import { PriorityBadge } from './StatusBadge'

interface IntakeCommandProps {
  existingIncidents: Incident[]
  initialText?: string
  onIncidentCreated: () => void
  onReviewExisting: (incident: Incident) => void
}

const SAMPLE_INTAKES = [
  {
    label: '⚡ Electrical Sparking in Engineering Block',
    text: 'There is active electrical sparking and exposed wiring near the Engineering Block second floor laboratory corridor.',
  },
  {
    label: '🚰 Water Pipe Rupture in Girls Hostel',
    text: 'Major water pipeline burst in Girls Hostel Block 3 ground floor elevator lobby with heavy water pooling.',
  },
  {
    label: '❄️ Lab 402 AC Failure During Exams',
    text: 'Central AC unit in Computer Lab 402 Science Block has stopped working and is making loud buzzing noise during exam.',
  },
  {
    label: '📶 Library 3rd Floor Core WiFi Down',
    text: 'The core WiFi access point on 3rd floor Central Library reading hall is dead with no network signal for 2 hours.',
  },
]

export const IntakeCommand: React.FC<IntakeCommandProps> = ({
  existingIncidents,
  initialText = '',
  onIncidentCreated,
  onReviewExisting,
}) => {
  const { toast } = useToast()
  const [inputText, setInputText] = useState(initialText)

  // Extracted structured fields (editable by operator)
  const [category, setCategory] = useState<IncidentCategory>('electrical')
  const [location, setLocation] = useState('Engineering Block')
  const [building, setBuilding] = useState('Engineering Block')
  const [floor, setFloor] = useState('2nd Floor')
  const [department, setDepartment] = useState('Electrical Maintenance')
  const [priority, setPriority] = useState<IncidentPriority>('critical')
  const [riskScore, setRiskScore] = useState(95)
  const [nearbyFacility, setNearbyFacility] = useState('Power Distribution Unit')

  // Validation & Duplicate states
  const [duplicateWarning, setDuplicateWarning] = useState<Incident | null>(null)
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Failure recovery state: true when AI/network error (429 etc.) is detected
  const [aiUnavailable, setAiUnavailable] = useState(false)
  // Post-submit success state
  const [submittedDept, setSubmittedDept] = useState<string | null>(null)

  // Real-time pre-extraction heuristic when text changes
  useEffect(() => {
    if (!inputText.trim()) return

    const lower = inputText.toLowerCase()

    // Category & Department & Risk deduction
    if (lower.includes('spark') || lower.includes('wire') || lower.includes('electric') || lower.includes('shock')) {
      setCategory('electrical')
      setDepartment('Electrical Maintenance')
      setPriority('critical')
      setRiskScore(95)
      setNearbyFacility('Power Substation / Circuit Panel')
    } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('flood')) {
      setCategory('plumbing')
      setDepartment('Facilities & Plumbing')
      setPriority('high')
      setRiskScore(82)
      setNearbyFacility('Main Valve & Drain Shaft')
    } else if (lower.includes('ac') || lower.includes('cooling') || lower.includes('hvac') || lower.includes('fan')) {
      setCategory('classroom')
      setDepartment('HVAC & Maintenance')
      setPriority('medium')
      setRiskScore(58)
      setNearbyFacility('Air Handling Unit 4')
    } else if (lower.includes('wifi') || lower.includes('network') || lower.includes('internet') || lower.includes('router')) {
      setCategory('internet')
      setDepartment('IT Support & Telecom')
      setPriority('medium')
      setRiskScore(60)
      setNearbyFacility('IDF Telecom Rack')
    } else if (lower.includes('gate') || lower.includes('security') || lower.includes('guard') || lower.includes('door')) {
      setCategory('security')
      setDepartment('Campus Security')
      setPriority('high')
      setRiskScore(78)
      setNearbyFacility('Perimeter Camera Post 08')
    }

    // Location extraction
    if (lower.includes('engineering')) {
      setBuilding('Engineering Block')
      setLocation('Engineering Block Corridor')
    } else if (lower.includes('hostel') || lower.includes('girls hostel')) {
      setBuilding('Girls Hostel Block 3')
      setLocation('Girls Hostel Lobby')
    } else if (lower.includes('library')) {
      setBuilding('Central Library')
      setLocation('Central Library 3rd Floor')
    } else if (lower.includes('science') || lower.includes('lab 402')) {
      setBuilding('Science Block')
      setLocation('Science Block Room 402')
    }

    // Floor extraction
    if (lower.includes('2nd floor') || lower.includes('second floor')) {
      setFloor('2nd Floor')
    } else if (lower.includes('3rd floor') || lower.includes('third floor')) {
      setFloor('3rd Floor')
    } else if (lower.includes('ground floor') || lower.includes('lobby')) {
      setFloor('Ground Floor')
    }

    // Duplicate detection check
    const matched = existingIncidents.find((inc) => {
      const matchCat = inc.category === (lower.includes('electric') ? 'electrical' : lower.includes('water') ? 'plumbing' : '')
      const matchBldg = inc.building && lower.includes(inc.building.toLowerCase())
      return matchCat && matchBldg && inc.status !== 'resolved'
    })

    if (matched && !ignoreDuplicate) {
      setDuplicateWarning(matched)
    } else {
      setDuplicateWarning(null)
    }
  }, [inputText, existingIncidents, ignoreDuplicate])

  const handleDispatch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim()) {
      setError('Please enter a natural language incident description.')
      return
    }

    setError(null)
    setAiUnavailable(false)
    setIsSubmitting(true)

    // Build structured payload context
    const fullContext = `${inputText.trim()}\n(Structured Context: Category: ${category}, Building: ${building}, Floor: ${floor}, Location: ${location}, Department: ${department})`

    try {
      await submitComplaint(fullContext)
      // Show success panel instead of immediately resetting
      setSubmittedDept(department)
      toast.success(`Incident created and routed to ${department}`)
      onIncidentCreated()
    } catch (err) {
      const message = (err as Error).message || ''
      // Detect AI / quota failure vs generic failure
      const isAiFailure =
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('AI') ||
        message.includes('Gemini') ||
        message.includes('rate limit') ||
        message.includes('overloaded') ||
        message.includes('service unavailable') ||
        message.includes('503') ||
        message.includes('502')

      if (isAiFailure) {
        setAiUnavailable(true)
        setError(null) // suppress generic error — recovery UI takes over
        toast.error('AI analysis unavailable — see recovery options below')
      } else {
        setError(message || 'Failed to dispatch incident.')
        toast.error('Dispatch failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetAndReportAnother = () => {
    setSubmittedDept(null)
    setInputText('')
    setDuplicateWarning(null)
    setIgnoreDuplicate(false)
    setError(null)
    setAiUnavailable(false)
  }

  // ── POST-SUBMIT SUCCESS PANEL ─────────────────────────────────────────────
  if (submittedDept) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#07111F] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl text-left"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Incident Dispatched</h2>
            <p className="text-sm text-slate-400">
              AI pipeline ingested, classified, scored, and routed the incident
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-mono text-emerald-300">
            Routed → <strong className="text-white">{submittedDept}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              handleResetAndReportAnother()
              onIncidentCreated()
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            View in Operations Command
          </button>
          <button
            onClick={handleResetAndReportAnother}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-sm border border-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Report Another Incident
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-cyan-300 font-bold">
              Natural Language Intake & Real-Time Pre-Extraction
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Report & Ingest Campus Incident
          </h2>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-xl">
          Auto-Extraction Active
        </span>
      </div>

      {/* Quick Intake Scenario Chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
          One-Click Incident Intake Prompts:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_INTAKES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(s.text)
                setIgnoreDuplicate(false)
                setAiUnavailable(false)
                setError(null)
              }}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[#05070D] hover:bg-[#0B1020] border border-white/[0.06] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all font-medium"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Natural Language Textarea */}
      <form onSubmit={handleDispatch} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 font-mono uppercase">
              Natural Language Problem Statement
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              {inputText.length} / 500 chars
            </span>
          </div>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              setIgnoreDuplicate(false)
              setAiUnavailable(false)
              setError(null)
            }}
            placeholder="Type or dictate campus issue (e.g., 'There is electrical sparking near the Engineering Block 2nd floor laboratory corridor...')"
            className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && !ignoreDuplicate && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Potential Duplicate Incident Detected</strong>
                <span className="text-slate-300">
                  A critical active incident matches this location:{' '}
                  <strong className="text-amber-200">{duplicateWarning.id}</strong> — "{duplicateWarning.title}".
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onReviewExisting(duplicateWarning)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/30 transition-colors text-xs"
              >
                Review Existing
              </button>
              <button
                type="button"
                onClick={() => setIgnoreDuplicate(true)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold border border-white/[0.08] transition-colors text-xs"
              >
                Continue Anyway
              </button>
            </div>
          </motion.div>
        )}

        {/* Real-Time Extracted Structured Telemetry (Editable by Operator) */}
        <div className="p-5 bg-[#05070D] border border-white/[0.06] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Extracted Structured Telemetry (Verified & Editable)
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
              Risk Calibration: {riskScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-[#07111F] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2 text-white font-semibold capitalize"
              >
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="security">Security</option>
                <option value="internet">Internet / IT</option>
                <option value="classroom">Classroom / HVAC</option>
                <option value="hostel">Hostel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Building / Zone</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-[#07111F] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2 text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Floor / Area</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full bg-[#07111F] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2 text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Target Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#07111F] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-2 text-cyan-300 font-semibold"
              />
            </div>
          </div>

          {/* Contextual Location Card */}
          <div className="p-3 bg-[#07111F]/80 rounded-xl border border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Location Context:</span>
              <strong className="text-white">{building} · {floor}</strong>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Nearby: <strong className="text-slate-200">{nearbyFacility}</strong></span>
              <span>Priority: <strong className={priority === 'critical' ? 'text-rose-400' : 'text-orange-400'}>{priority.toUpperCase()} ({riskScore}/100)</strong></span>
            </div>
          </div>
        </div>

        {/* AI Unavailability Recovery Panel */}
        {aiUnavailable && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">AI Analysis Unavailable</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  The Gemini AI pipeline is temporarily unreachable (quota limit or network error). You can retry once AI recovers, or submit using the rule-based fallback engine.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDispatch()}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-xs border border-amber-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isSubmitting ? 'Retrying...' : 'Retry Analysis'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-xs border border-white/[0.08] transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Continue with Rule-Based Fallback
              </button>
            </div>
          </motion.div>
        )}

        {/* Generic Error Notification (non-AI errors only) */}
        {error && !aiUnavailable && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Submit & Dispatch Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !inputText.trim()}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching to {department}...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Dispatch & Ingest Incident
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
