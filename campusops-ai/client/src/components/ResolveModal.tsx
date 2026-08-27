import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, ShieldCheck, FileText } from 'lucide-react'

interface ResolveModalProps {
  isOpen: boolean
  incidentId: string
  incidentTitle: string
  isProcessing?: boolean
  onClose: () => void
  onConfirm: (resolutionNote: string) => void
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  isOpen,
  incidentId,
  incidentTitle,
  isProcessing = false,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState('Technician inspected on-site, replaced damaged components, and verified safe operation.')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isProcessing, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(note.trim())
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#07111F] border border-white/[0.12] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Mark Incident as Resolved
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">{incidentId}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Confirm completion of field repair work for <strong className="text-white">"{incidentTitle}"</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Work Order / Resolution Summary Note
              </label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe actions taken to resolve the incident..."
                className="w-full bg-[#05070D] border border-white/[0.08] focus:border-cyan-500/60 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing || !note.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
              >
                {isProcessing ? 'Recording Resolution...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
