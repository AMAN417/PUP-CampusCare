import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Radio, ArrowRight, CornerDownLeft, Sparkles, Building, MapPin, Tag } from 'lucide-react'
import type { Incident } from '../types'
import { PriorityBadge, StatusBadge } from './StatusBadge'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
  onNavigate: (tab: 'landing' | 'report' | 'admin' | 'analytics') => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
  onNavigate,
}) => {
  const [query, setQuery] = useState('')

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = query.trim()
    ? incidents.filter((i) => {
        const q = query.toLowerCase()
        return (
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.building || '').toLowerCase().includes(q)
        )
      }).slice(0, 5)
    : incidents.slice(0, 4)

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#05070D]/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="bg-[#07111F] border border-white/[0.12] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-3 text-left"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 p-4 border-b border-white/[0.06] bg-[#05070D]">
            <Search className="w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search incidents, locations, departments, categories... (or type 'report', 'analytics')"
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg text-xs font-mono"
            >
              ESC
            </button>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="px-4 pt-1 flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                onNavigate('report')
                onClose()
              }}
              className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              New Report
            </button>
            <button
              onClick={() => {
                onNavigate('admin')
                onClose()
              }}
              className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.06] transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              Open Live Fleet
            </button>
          </div>

          {/* Incident Search Results List */}
          <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block py-1">
              {query.trim() ? `Matches (${filtered.length})` : 'Recent Operations Telemetry'}
            </span>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No incidents match "{query}". Try searching by building or department name.
              </div>
            ) : (
              filtered.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    onSelectIncident(inc)
                    onClose()
                  }}
                  className="p-3 rounded-2xl bg-[#05070D]/70 hover:bg-[#0B1020] border border-white/[0.04] hover:border-cyan-500/30 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {inc.id}
                      </span>
                      <PriorityBadge priority={inc.priority} score={inc.priorityScore} size="sm" />
                      <StatusBadge status={inc.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </p>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {inc.building || 'Campus'} · {inc.location} &rarr; <span className="text-slate-300">{inc.department}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 group-hover:text-cyan-300">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Shortcuts Hint */}
          <div className="p-3 bg-[#05070D] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Press <strong className="text-slate-300">ESC</strong> to exit</span>
            <span className="text-cyan-400">CampusOps AI Omnibox</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
