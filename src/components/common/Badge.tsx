import React from 'react';
import type { ComplaintStatus, Priority } from '../../types';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Flame,
} from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'maroon' | 'gold' | 'navy' | 'gray' | 'success';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  icon,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { 
      background: 'rgba(240, 243, 248, 0.9)', 
      color: 'var(--text-secondary)',
      boxShadow: '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
    maroon: { 
      background: 'var(--pup-maroon-subtle)', 
      color: 'var(--pup-maroon)', 
      border: '1px solid rgba(122, 18, 40, 0.15)',
      boxShadow: '0 2px 6px rgba(122, 18, 40, 0.08), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
    gold: { 
      background: 'var(--pup-gold-subtle)', 
      color: '#B45309', 
      border: '1px solid rgba(217, 119, 6, 0.2)',
      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.1), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
    navy: { 
      background: 'var(--pup-navy-subtle)', 
      color: 'var(--pup-navy)',
      boxShadow: '0 2px 5px rgba(15, 23, 42, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
    gray: { 
      background: '#F1F5F9', 
      color: '#475569',
      boxShadow: '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
    success: { 
      background: '#ECFDF5', 
      color: '#059669', 
      border: '1px solid rgba(5, 150, 105, 0.2)',
      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)'
    },
  };

  return (
    <span className={`badge ${className}`} style={variantStyles[variant]}>
      {icon}
      <span>{children}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; showIcon?: boolean }> = ({
  status,
  showIcon = true,
}) => {
  const statusConfig: Record<
    ComplaintStatus,
    { className: string; icon: React.ReactNode; label: string; hasPulse?: boolean }
  > = {
    Submitted: {
      className: 'status-submitted',
      icon: <Clock size={13} strokeWidth={2.4} />,
      label: 'Submitted',
    },
    'Under Review': {
      className: 'status-under-review',
      icon: <Search size={13} strokeWidth={2.4} />,
      label: 'Under Review',
      hasPulse: true,
    },
    Assigned: {
      className: 'status-assigned',
      icon: <UserCheck size={13} strokeWidth={2.4} />,
      label: 'Assigned',
    },
    'In Progress': {
      className: 'status-in-progress',
      icon: <Wrench size={13} strokeWidth={2.4} />,
      label: 'In Progress',
      hasPulse: true,
    },
    Resolved: {
      className: 'status-resolved',
      icon: <CheckCircle2 size={13} strokeWidth={2.4} />,
      label: 'Resolved',
    },
    Closed: {
      className: 'status-closed',
      icon: <XCircle size={13} strokeWidth={2.4} />,
      label: 'Closed',
    },
  };

  const current = statusConfig[status] || statusConfig.Submitted;

  return (
    <span className={`badge ${current.className}`}>
      {showIcon && current.icon}
      <span>{current.label}</span>
      {current.hasPulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
            marginLeft: '2px',
          }}
          className="animate-soft-pulse"
        />
      )}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; showIcon?: boolean }> = ({
  priority,
  showIcon = true,
}) => {
  const priorityConfig: Record<
    Priority,
    { className: string; icon: React.ReactNode; label: string }
  > = {
    Low: {
      className: 'priority-low',
      icon: <ArrowDown size={13} strokeWidth={2.4} />,
      label: 'Low Priority',
    },
    Medium: {
      className: 'priority-medium',
      icon: <ArrowRight size={13} strokeWidth={2.4} />,
      label: 'Medium Priority',
    },
    High: {
      className: 'priority-high',
      icon: <ArrowUp size={13} strokeWidth={2.4} />,
      label: 'High Priority',
    },
    Urgent: {
      className: 'priority-urgent',
      icon: <Flame size={13} strokeWidth={2.4} />,
      label: 'Urgent',
    },
  };

  const current = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span className={`badge ${current.className}`}>
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
