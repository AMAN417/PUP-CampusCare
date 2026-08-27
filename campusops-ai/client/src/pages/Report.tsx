import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building,
  Camera,
  FileUp,
  Image as ImageIcon,
  MapPin,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react'
import { submitComplaint } from '../lib/api'
import type { AgentReportResponse } from '../types'
import { AIProcessingView } from '../components/AIProcessingView'
import { IncidentResultView } from '../components/IncidentResultView'
import { AgentActivityPanel } from '../components/AgentActivityPanel'
import { useToast } from '../components/Toast'

interface ReportProps {
  initialPrompt?: string
  onViewInAdmin: () => void
  onIncidentCreated?: () => void
}

export const Report: React.FC<ReportProps> = ({
  initialPrompt = '',
  onViewInAdmin,
  onIncidentCreated,
}) => {
  const { toast } = useToast()
  const [description, setDescription] = useState(initialPrompt)
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [room, setRoom] = useState('')
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number } | null>(null)

  // AI Pipeline states
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<AgentReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialPrompt) {
      setDescription(initialPrompt)
    }
  }, [initialPrompt])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Attachment exceeds 10MB limit.')
      return
    }

    setAttachedFile({ name: file.name, size: file.size })
    setError(null)
    toast.info(`Attached file: ${file.name}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError('Please provide a description of the campus issue.')
      return
    }

    if (description.trim().length < 10) {
      setError('Please provide more detail (minimum 10 characters) so the agent can accurately assess risk.')
      return
    }

    setError(null)
    setIsProcessing(true)
    setResult(null)

    // Build context
    let fullPrompt = description.trim()
    const extras: string[] = []
    if (building.trim()) extras.push(`Building: ${building.trim()}`)
    if (floor.trim()) extras.push(`Floor: ${floor.trim()}`)
    if (room.trim()) extras.push(`Room: ${room.trim()}`)
    if (attachedFile) extras.push(`Attachment: ${attachedFile.name}`)

    if (extras.length > 0) {
      fullPrompt = `${fullPrompt}\n(Location Context: ${extras.join(', ')})`
    }

    try {
      const response = await submitComplaint(fullPrompt)
      setResult(response)
      toast.success('Incident analyzed and routed successfully')
      onIncidentCreated?.()
    } catch (err) {
      const msg = (err as Error).message || 'Unable to communicate with AI agent.'
      setError(msg)
      toast.error('Agent execution encountered an error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setDescription('')
    setBuilding('')
    setFloor('')
    setRoom('')
    setAttachedFile(null)
  }

  if (result && !isProcessing) {
    return (
      <div className="py-6 px-4">
        <IncidentResultView
          incident={result.incident}
          aiSummary={result.aiSummary}
          steps={result.steps}
          onNewReport={handleReset}
          onViewInAdmin={onViewInAdmin}
        />
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="py-12 px-4">
        <AIProcessingView isComplete={false} error={error} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="space-y-2 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Autonomous Incident Intake
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Campus Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Describe the problem. Tell us what happened and where. The AI agent will autonomously extract coordinates, calibrate hazard levels, and dispatch to campus facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Clean Form */}
        <div className="lg:col-span-8 bg-[#07111F] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Describe the problem
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {description.length} / 500 characters
                </span>
              </div>
              <textarea
                required
                rows={5}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened and where (e.g., The electrical wire near Block B 2nd floor washroom is exposed and sparking. Students are using this corridor.)"
                className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 block">
                Be specific about safety hazards, broken fixtures, water leaks, or electrical issues.
              </span>
            </div>

            {/* Location Sub-fields */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono block">
                Location Details (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block">Building</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="e.g. Science Block"
                      className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. 2nd Floor"
                    className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block">Room / Area</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. Room 301"
                      className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional attachment */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] text-slate-400 font-medium block">
                Attachment (Images / Documents up to 10MB)
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#05070D] border border-white/[0.08] hover:border-white/[0.15] text-slate-300 text-xs font-medium cursor-pointer transition-colors">
                  <FileUp className="w-4 h-4 text-cyan-400" />
                  <span>{attachedFile ? 'Replace File' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {attachedFile && (
                  <div className="flex items-center gap-2 bg-[#05070D] border border-white/[0.06] px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-cyan-300 font-mono truncate max-w-[200px]">
                      {attachedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-slate-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || !description.trim()}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with CampusOps AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze with CampusOps AI
                    <Send className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-4">
          <AgentActivityPanel isExecuting={isProcessing} />
        </div>
      </div>
    </div>
  )
}
