import React from 'react'
import type { IncidentStatus, IncidentPriority } from '../types'

export const StatusBadge: React.FC<{ status: IncidentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const styles: Record<IncidentStatus, { bg: string; text: string; border: string; label: string; dot: string }> = {
    submitted: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      label: 'Submitted',
      dot: 'bg-amber-400',
    },
    analyzing: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      label: 'AI Analyzing',
      dot: 'bg-blue-400 animate-pulse',
    },
    assigned: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      label: 'Assigned',
      dot: 'bg-purple-400',
    },
    in_progress: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      label: 'In Progress',
      dot: 'bg-cyan-400 animate-ping',
    },
    resolved: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'Resolved',
      dot: 'bg-emerald-400',
    },
    rejected: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      label: 'Rejected',
      dot: 'bg-rose-400',
    },
  }

  const current = styles[status] || styles.submitted
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  )
}

export const PriorityBadge: React.FC<{ priority: IncidentPriority; score?: number; size?: 'sm' | 'md' }> = ({
  priority,
  score,
  size = 'md',
}) => {
  const styles: Record<IncidentPriority, { bg: string; text: string; border: string; glow: string; label: string }> = {
    critical: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/20 shadow-sm',
      label: 'Critical',
    },
    high: {
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/10 shadow-sm',
      label: 'High',
    },
    medium: {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      glow: '',
      label: 'Medium',
    },
    low: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      glow: '',
      label: 'Low',
    },
  }

  const current = styles[priority] || styles.medium
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border uppercase tracking-wider ${current.bg} ${current.text} ${current.border} ${current.glow} ${sizeClasses}`}
    >
      {current.label}
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[11px] ml-0.5">({score})</span>
      )}
    </span>
  )
}
