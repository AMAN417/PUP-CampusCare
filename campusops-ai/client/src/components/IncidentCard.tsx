import React from 'react'
import { MapPin, Building, Clock, ChevronRight, Zap, Droplet, Sparkles, Shield, Wifi, School, Home, HelpCircle } from 'lucide-react'
import type { Incident, IncidentCategory } from '../types'
import { StatusBadge, PriorityBadge } from './StatusBadge'

interface IncidentCardProps {
  incident: Incident
  onClick?: () => void
  compact?: boolean
}

export const getCategoryIcon = (category: IncidentCategory) => {
  switch (category) {
    case 'electrical': return <Zap className="w-4 h-4 text-amber-400" />
    case 'plumbing': return <Droplet className="w-4 h-4 text-blue-400" />
    case 'cleanliness': return <Sparkles className="w-4 h-4 text-emerald-400" />
    case 'security': return <Shield className="w-4 h-4 text-rose-400" />
    case 'internet': return <Wifi className="w-4 h-4 text-indigo-400" />
    case 'classroom': return <School className="w-4 h-4 text-cyan-400" />
    case 'hostel': return <Home className="w-4 h-4 text-purple-400" />
    default: return <HelpCircle className="w-4 h-4 text-slate-400" />
  }
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onClick,
  compact = false,
}) => {
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      onClick={onClick}
      className={`group bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-slate-950/40 relative overflow-hidden ${
        incident.priority === 'critical' ? 'border-l-4 border-l-rose-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/60">
            {getCategoryIcon(incident.category)}
          </div>
          <span className="font-mono text-xs text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md">
            {incident.id}
          </span>
          <StatusBadge status={incident.status} size="sm" />
        </div>

        <PriorityBadge priority={incident.priority} score={incident.priorityScore} size="sm" />
      </div>

      <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
        {incident.title}
      </h3>

      {!compact && incident.aiReasoning && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {incident.aiReasoning}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-slate-300">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {incident.building || 'Campus'} {incident.floor ? `• ${incident.floor}` : ''}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {incident.location}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px] font-medium">
            {incident.department}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  )
}
